import { useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  jsonLd?: Record<string, unknown> | null;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SeoHead({ title, description, image, jsonLd }: SeoHeadProps) {
  const { siteSettings } = useApp();

  useEffect(() => {
    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('property', 'og:url', window.location.origin + window.location.pathname);

    if (image) {
      const absImage = image.startsWith('http') ? image : window.location.origin + image;
      setMetaTag('property', 'og:image', absImage);
      setMetaTag('name', 'twitter:image', absImage);
    }

    const baseBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: siteSettings.businessName,
      url: window.location.origin,
      telephone: siteSettings.phoneInternational,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '103, Park Avenue Colony, Pak Avenue Housing Scheme',
        addressLocality: 'Sahiwal',
        addressRegion: 'Punjab',
        addressCountry: 'PK',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(siteSettings.googleRating),
        reviewCount: String(siteSettings.googleReviewCount),
        bestRating: '5',
      },
      hasMap: siteSettings.googleMapsUrl,
    };

    const scriptId = 'premier-json-ld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd || baseBusinessSchema);
  }, [title, description, image, jsonLd, siteSettings]);

  return null;
}
