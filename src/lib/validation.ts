import { z } from 'zod';

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters).')
    .max(120, 'Name must be under 120 characters.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone or WhatsApp number.')
    .max(30, 'Phone number must be under 30 characters.')
    .regex(/^[0-9+\-\s()]{7,30}$/, 'Phone number contains invalid characters.'),
  email: z
    .string()
    .trim()
    .max(160, 'Email must be under 160 characters.')
    .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address.',
    }),
  message: z
    .string()
    .trim()
    .min(5, 'Please include a brief message (at least 5 characters).')
    .max(2500, 'Message must be under 2,500 characters.'),
  propertyId: z.string().trim().max(128).default(''),
  propertyTitle: z.string().trim().max(180).default(''),
  sourcePage: z.string().trim().min(1).max(120),
  website: z.string().max(200).optional().default(''), // Honeypot field
});

export const propertySchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(5000),
  purpose: z.enum(['sale', 'rent']),
  type: z.enum([
    'house',
    'plot',
    'apartment',
    'shop',
    'office',
    'agricultural_land',
    'commercial_building',
  ]),
  pricePkr: z.number().finite().min(0).max(100_000_000_000),
  areaSize: z.number().finite().positive('Area size must be greater than zero.').max(1_000_000),
  areaUnit: z.enum(['marla', 'kanal', 'sq_ft']),
  bedrooms: z.number().int().min(0).max(30),
  bathrooms: z.number().int().min(0).max(30),
  parking: z.number().int().min(0).max(50),
  furnished: z.boolean(),
  yearBuilt: z.number().int().min(1950).max(2035).nullable().optional(),
  addressArea: z.string().trim().min(3, 'Address or area is required').max(240),
  latitude: z.number().finite().min(-90).max(90).nullable().optional(),
  longitude: z.number().finite().min(-180).max(180).nullable().optional(),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30),
  status: z.enum(['for_sale', 'for_rent', 'sold', 'rented']),
  featured: z.boolean(),
  published: z.boolean(),
  isSample: z.boolean(),
  coverImageUrl: z.string().trim().max(1000),
  coverImageAlt: z.string().trim().max(240),
});

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  address: z.string().trim().min(5).max(300),
  phoneDisplay: z.string().trim().min(5).max(40),
  phoneInternational: z.string().trim().min(5).max(40),
  whatsappUrl: z.string().trim().min(10).max(200),
  email: z.string().trim().max(160),
  workingHours: z.string().trim().max(160),
  googleRating: z.number().min(0).max(5),
  googleReviewCount: z.number().int().min(0).max(100000),
  googleMapsUrl: z.string().trim().max(300),
  heroHeadline: z.string().trim().min(5).max(180),
  heroSubheadline: z.string().trim().min(10).max(400),
  facebookUrl: z.string().trim().max(240),
  instagramUrl: z.string().trim().max(240),
  linkedinUrl: z.string().trim().max(240),
});
