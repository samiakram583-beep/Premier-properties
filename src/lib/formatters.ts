import type { AreaUnit, PropertyPurpose, PropertyStatus, PropertyType } from '../types/domain.ts';

export function formatPkr(amount: number, purpose: PropertyPurpose = 'sale'): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Price on request';
  }
  if (purpose === 'rent') {
    if (amount >= 10_000_000) {
      const crore = amount / 10_000_000;
      return `PKR ${Number(crore.toFixed(2))} Crore/month`;
    }
    if (amount >= 1_000_000) {
      const lakh = amount / 100_000;
      return `PKR ${Number(lakh.toFixed(2))} Lakh/month`;
    }
    return `PKR ${Math.round(amount).toLocaleString('en-PK')}/month`;
  }

  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return `PKR ${Number(crore.toFixed(2))} Crore`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `PKR ${Number(lakh.toFixed(2))} Lakh`;
  }
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatArea(size: number, unit: AreaUnit): string {
  const formattedSize = Number.isInteger(size)
    ? size.toLocaleString('en-PK')
    : Number(size.toFixed(2)).toString();
  switch (unit) {
    case 'kanal':
      return `${formattedSize} Kanal`;
    case 'marla':
      return `${formattedSize} Marla`;
    case 'sq_ft':
      return `${formattedSize} sq ft`;
    default:
      return `${formattedSize}`;
  }
}

export function formatPropertyType(type: PropertyType): string {
  const map: Record<PropertyType, string> = {
    house: 'House',
    plot: 'Plot',
    apartment: 'Apartment',
    shop: 'Shop',
    office: 'Office',
    agricultural_land: 'Agricultural land',
    commercial_building: 'Commercial building',
  };
  return map[type] ?? type;
}

export function formatPropertyStatus(status: PropertyStatus): string {
  const map: Record<PropertyStatus, string> = {
    for_sale: 'For sale',
    for_rent: 'For rent',
    sold: 'Sold',
    rented: 'Rented',
  };
  return map[status] ?? status;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export function sanitizeSafeHref(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'tel:' || parsed.protocol === 'mailto:') {
      return trimmed;
    }
    return '#';
  } catch {
    return '#';
  }
}

export function buildWhatsAppLink(baseUrl: string, message: string): string {
  const cleanBase = sanitizeSafeHref(baseUrl) === '#' ? 'https://wa.me/923000061397' : baseUrl;
  const separator = cleanBase.includes('?') ? '&' : '?';
  return `${cleanBase}${separator}text=${encodeURIComponent(message)}`;
}

export function formatTimestamp(ts: unknown): string {
  if (!ts) return '—';
  try {
    if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
      return (ts as { toDate: () => Date }).toDate().toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    if (typeof ts === 'string' || typeof ts === 'number') {
      return new Date(ts).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return 'Just now';
  } catch {
    return '—';
  }
}

export function toDateObj(ts: unknown): Date | null {
  if (!ts) return null;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate();
  }
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
