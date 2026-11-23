# Setup, Deployment & Operations Guide
**Premier Property Management & Development**

---

## 1. Architecture Overview
This application runs as a full-stack TypeScript web platform:
- **Frontend**: React 19 + Vite + Tailwind CSS + React Router
- **Backend Server**: Express (`server.ts`) providing rate-limited Zod-validated inquiry notifications (Nodemailer / Resend), Google Maps Grounding via Gemini (`gemini-4-hydrogen`), AI architectural visualization (`gemini-nano-banana-2.1`), secure local image upload processing (`<= 15 MB`, JPG/PNG/WebP), `sitemap.xml`, and `robots.txt`.
- **Database & Auth**: Firebase Firestore (with hardened `firestore.rules` and RBAC profiles) and Firebase Authentication (Google Sign-In).
- **SQL / Supabase Export Ready**: Complete PostgreSQL schema, indexes, and RLS policies are included in `/supabase/schema.sql` and `/supabase/seed.sql`.

---

## 2. Local Setup & Running Locally
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   Copy `.env.example` to `.env` and populate:
   - `GEMINI_API_KEY`: Your Gemini API key (for Maps Grounding & AI visualization).
   - `OWNER_NOTIFICATION_EMAIL`: Email address that receives inquiry alerts.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (or `RESEND_API_KEY`) for email delivery.
3. **Firebase configuration**:
   Ensure `firebase-applet-config.json` is present in the root directory and `firestore.rules` are deployed.
4. **Run locally**:
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:3000`.

### Alternative: Supabase Project Setup (for PostgreSQL Export)
1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `/supabase/schema.sql`, then `/supabase/seed.sql`.
3. Create a public Storage bucket named `property-media` with authenticated staff write policies.
4. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to your environment.
5. Create your first admin user in Authentication -> Users and insert a row in `public.profiles` with `role = 'admin'`.

---

## 3. Creating the First Admin User
- Sign in at `/admin` using the configured primary administrator Google account (`sa3840213@gmail.com`).
- Your profile is automatically provisioned with the `admin` role in `/profiles/{uid}`.
- From **Admin -> Team & Settings**, you can promote additional team members to `editor` (manage properties, gallery, and inquiries) or `admin` (full access including Site Settings).

---

## 4. Deployment Steps (Cloud Run / Node or Vercel)
### Deploying this Full-Stack Node App
1. Build the frontend bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. Set all environment variables from `.env.example` in your hosting dashboard.

### Connecting a Custom Domain on Vercel
1. Push the repository to GitHub and import it into Vercel.
2. Add environment variables in **Project Settings -> Environment Variables**.
3. Go to **Project Settings -> Domains**, add your custom domain (e.g., `premierproperty.pk`), and configure the `A` record (`76.76.21.21`) and `CNAME` (`cname.vercel-dns.com`) at your registrar.

---

## 5. Client Operations Guide
### Adding a Property
1. Open `/admin` and go to **Properties**.
2. Click **Add Property**. Enter the title (slug auto-generates), choose Purpose (`For Sale` or `For Rent`), Type, Price in PKR, Area & Unit (`Marla`, `Kanal`, `Sq Ft`), Bedrooms, Bathrooms, Parking, and Address.
3. Toggle **Featured on Home** if you want the listing in the home page showcase (up to 6).
4. Upload photos via drag-and-drop (JPG/PNG/WebP up to 15 MB; automatically compressed), add descriptive alt text, drag or reorder images, and select the cover image.
5. Click **Save Property**.

### Handling Inquiries
1. Open **Admin -> Inquiries** to filter by `New`, `Contacted`, or `Closed`.
2. Click any inquiry to view full message details and the linked property.
3. Use the one-click **Call** or **Reply on WhatsApp** buttons, add private internal notes, update status to `Contacted` or `Closed`, or export to CSV.

---

## 6. Content Replacement Checklist (Before Going Live)
1. **Sample Properties**: Delete or replace all 6 `[Sample Listing]` properties in **Admin -> Properties** (they are tagged `Sample` for quick removal).
2. **Property & Project Photography**: Replace sample architectural images with real photographs of your active listings and completed developments in Sahiwal.
3. **Business Email & Social Links**: Update your official email address, working hours, Facebook, Instagram, and LinkedIn links in **Admin -> Site Settings**.
4. **Logo Mark**: Optionally add your custom SVG/PNG company logo mark if you have a registered monogram.
5. **Email Delivery**: Configure `OWNER_NOTIFICATION_EMAIL` and SMTP or Resend credentials in environment secrets so every web inquiry triggers an instant email alert.
