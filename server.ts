import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { inquirySchema } from './src/lib/validation.ts';

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple sliding-window rate limiter per IP
const rateBuckets = new Map<string, number[]>();
function isRateLimited(ip: string, maxRequests = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    rateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function validateImageMagicBytes(buf: Buffer, mimeType: string): boolean {
  if (buf.length < 12) return false;
  if (mimeType === 'image/jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (mimeType === 'image/webp') {
    return (
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

async function sendInquiryEmail(payload: {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyTitle: string;
  sourcePage: string;
}): Promise<{ sent: boolean; provider?: string; note?: string }> {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) {
    return { sent: false, note: 'OWNER_NOTIFICATION_EMAIL not configured.' };
  }

  const subject = payload.propertyTitle
    ? `New Inquiry: ${payload.propertyTitle} — ${payload.name}`
    : `New General Inquiry — ${payload.name}`;

  const textBody = [
    `Premier Property Management & Development — New Inquiry`,
    ``,
    `Name: ${payload.name}`,
    `Phone / WhatsApp: ${payload.phone}`,
    `Email: ${payload.email || 'Not provided'}`,
    `Property: ${payload.propertyTitle || 'General Inquiry'}`,
    `Source Page: ${payload.sourcePage}`,
    ``,
    `Message:`,
    payload.message,
  ].join('\n');

  // Prefer Resend if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SMTP_FROM || 'Premier Property <onboarding@resend.dev>',
        to: [ownerEmail],
        subject,
        text: textBody,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend failed: ${errText}`);
    }
    return { sent: true, provider: 'resend' };
  }

  // Fallback to Nodemailer SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ownerEmail,
      subject,
      text: textBody,
    });
    return { sent: true, provider: 'smtp' };
  }

  return { sent: false, note: 'No SMTP or Resend credentials configured.' };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '22mb' }));

  // Serve uploaded property/gallery images safely
  app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', index: false }));

  // 1. Inquiry Validation, Rate Limiting, Honeypot & Email Notification
  app.post('/api/inquiries/notify', async (req, res) => {
    const ip = req.ip || 'unknown';
    if (isRateLimited(`inq:${ip}`, 8, 15 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: 'Too many inquiries sent recently. Please wait a few minutes or call 0300 0061397 directly.',
      });
    }

    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues[0]?.message || 'Please check your inquiry fields.',
      });
    }

    // Honeypot check
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return res.status(200).json({ ok: true, trapped: true });
    }

    try {
      const emailResult = await sendInquiryEmail({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
        propertyTitle: parsed.data.propertyTitle,
        sourcePage: parsed.data.sourcePage,
      });
      return res.status(200).json({ ok: true, trapped: false, email: emailResult });
    } catch (err) {
      console.error('Inquiry email notification error:', err);
      return res.status(200).json({
        ok: true,
        trapped: false,
        email: { sent: false, note: 'Saved to database; email delivery pending SMTP configuration.' },
      });
    }
  });

  // 2. Secure Image Upload Endpoint (JPG/PNG/WebP, max 15 MB)
  app.post('/api/uploads', async (req, res) => {
    const ip = req.ip || 'unknown';
    if (isRateLimited(`upl:${ip}`, 40, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Upload rate limit reached. Try again shortly.' });
    }

    const { dataUrl, mimeType } = req.body ?? {};
    if (
      typeof dataUrl !== 'string' ||
      typeof mimeType !== 'string' ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)
    ) {
      return res.status(400).json({ error: 'Only JPG, PNG, and WebP images are permitted.' });
    }

    const prefix = `data:${mimeType};base64,`;
    if (!dataUrl.startsWith(prefix)) {
      return res.status(400).json({ error: 'Invalid image payload format.' });
    }

    const base64Data = dataUrl.slice(prefix.length);
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image must be larger than 0 bytes and at most 15 MB.' });
    }

    if (!validateImageMagicBytes(buffer, mimeType)) {
      return res.status(400).json({ error: 'File contents do not match the declared image type.' });
    }

    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[mimeType];
    const safeFilename = `img_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const resolvedTarget = path.resolve(uploadsDir, safeFilename);
    if (!resolvedTarget.startsWith(uploadsDir + path.sep)) {
      return res.status(400).json({ error: 'Invalid destination path.' });
    }

    await fs.promises.writeFile(resolvedTarget, buffer);
    return res.status(201).json({ url: `/uploads/${safeFilename}` });
  });

  // 3. Google Maps Grounding via Gemini 4 Hydrogen
  app.post('/api/maps-grounding', async (req, res) => {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const queryText =
      typeof req.body?.query === 'string' && req.body.query.trim().length > 2
        ? req.body.query.trim().slice(0, 300)
        : 'Key landmarks, schools, hospitals, parks, and road access near Pak Avenue Housing Scheme, Sahiwal, Pakistan';

    const lat =
      typeof req.body?.latitude === 'number' && Number.isFinite(req.body.latitude)
        ? req.body.latitude
        : 30.6682;
    const lng =
      typeof req.body?.longitude === 'number' && Number.isFinite(req.body.longitude)
        ? req.body.longitude
        : 73.1114;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Provide a concise, factual neighborhood overview for real estate buyers and tenants in Sahiwal, Pakistan: ${queryText}`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng,
              },
            },
          },
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const places: { title: string; uri: string; reviewSnippets: string[] }[] = [];

      for (const chunk of chunks as Array<{
        maps?: {
          title?: string;
          uri?: string;
          placeAnswerSources?: { reviewSnippets?: Array<{ content?: string }> };
        };
      }>) {
        if (chunk.maps?.uri) {
          const snippets = (chunk.maps.placeAnswerSources?.reviewSnippets ?? [])
            .map((s) => s.content)
            .filter((s): s is string => typeof s === 'string' && s.length > 0);
          places.push({
            title: chunk.maps.title || 'Google Maps Place',
            uri: chunk.maps.uri,
            reviewSnippets: snippets,
          });
        }
      }

      return res.json({
        summary: response.text || '',
        places,
      });
    } catch (err) {
      console.error('Maps grounding error:', err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : 'Unable to fetch neighborhood data from Google Maps.',
      });
    }
  });

  // 4. AI Architectural Image Creation & Editing (gemini-nano-banana-2.1)
  app.post('/api/ai/image', async (req, res) => {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim().slice(0, 800) : '';
    if (prompt.length < 5) {
      return res.status(400).json({ error: 'Please provide a descriptive architectural prompt.' });
    }

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
    if (
      typeof req.body?.sourceImageBase64 === 'string' &&
      typeof req.body?.sourceMimeType === 'string' &&
      ['image/jpeg', 'image/png', 'image/webp'].includes(req.body.sourceMimeType)
    ) {
      parts.push({
        inlineData: {
          data: req.body.sourceImageBase64,
          mimeType: req.body.sourceMimeType,
        },
      });
    }
    parts.push({ text: prompt });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: '4:3',
            imageSize: '1K',
          },
        },
      });

      let savedUrl = '';
      let textNote = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
          const buf = Buffer.from(part.inlineData.data, 'base64');
          const safeFilename = `ai_${Date.now()}_${crypto.randomBytes(5).toString('hex')}.${ext}`;
          const resolvedTarget = path.resolve(uploadsDir, safeFilename);
          if (resolvedTarget.startsWith(uploadsDir + path.sep)) {
            await fs.promises.writeFile(resolvedTarget, buf);
            savedUrl = `/uploads/${safeFilename}`;
          }
        } else if (part.text) {
          textNote += part.text;
        }
      }

      if (!savedUrl) {
        return res.status(502).json({ error: 'Model returned no image output.' });
      }

      return res.json({ url: savedUrl, note: textNote });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image generation failed.';
      const status = msg.includes('PERMISSION_DENIED') || msg.includes('403') || msg.includes('billing') ? 402 : 500;
      return res.status(status).json({
        error:
          status === 402
            ? 'Image generation with gemini-nano-banana-2.1 requires a billing-enabled Gemini API key in Settings > Secrets.'
            : msg,
      });
    }
  });

  // 5. SEO robots.txt & sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticRoutes = ['', '/properties', '/gallery', '/about', '/services', '/contact'];
    const urls = staticRoutes
      .map(
        (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
      )
      .join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
    );
  });

  // Vite middleware in dev / static dist in prod
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Premier Property server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
