export type PropertyPurpose = 'sale' | 'rent';

export type PropertyType =
  | 'house'
  | 'plot'
  | 'apartment'
  | 'shop'
  | 'office'
  | 'agricultural_land'
  | 'commercial_building';

export type AreaUnit = 'marla' | 'kanal' | 'sq_ft';

export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented';

export type GalleryCategory = 'Houses' | 'Plots' | 'Commercial' | 'Projects';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type StaffRole = 'admin' | 'editor' | 'viewer';

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  pricePkr: number;
  areaSize: number;
  areaUnit: AreaUnit;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnished: boolean;
  yearBuilt?: number | null;
  addressArea: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities: string[];
  status: PropertyStatus;
  featured: boolean;
  published: boolean;
  isSample: boolean;
  coverImageUrl: string;
  coverImageAlt: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface GalleryImage {
  id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  url: string;
  altText: string;
  propertyId: string;
  propertySlug: string;
  sortOrder: number;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  sourcePage: string;
  status: InquiryStatus;
  privateNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteSettings {
  businessName: string;
  address: string;
  phoneDisplay: string;
  phoneInternational: string;
  whatsappUrl: string;
  email: string;
  workingHours: string;
  googleRating: number;
  googleReviewCount: number;
  googleMapsUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: StaffRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MapsGroundingPlace {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}
