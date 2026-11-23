import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from 'lucide-react';
import { InquiryForm } from '../components/InquiryForm.tsx';
import { Lightbox, type LightboxItem } from '../components/Lightbox.tsx';
import { NeighborhoodExplorer } from '../components/NeighborhoodExplorer.tsx';
import { PropertyCard } from '../components/PropertyCard.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import { fetchPropertyImages } from '../lib/firestoreRepo.ts';
import {
  buildWhatsAppLink,
  formatArea,
  formatPkr,
  formatPropertyStatus,
  formatPropertyType,
  sanitizeSafeHref,
} from '../lib/formatters.ts';
import type { PropertyImage } from '../types/domain.ts';

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { properties, siteSettings } = useApp();

  const property = useMemo(
    () => properties.find((p) => p.slug === slug),
    [properties, slug]
  );

  const [gallery, setGallery] = useState<PropertyImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    if (!property) return;
    fetchPropertyImages(property.id)
      .then((imgs) => setGallery(imgs))
      .catch(() => setGallery([]));
  }, [property]);

  if (!property) {
    return (
      <section className="py-24 px-4 text-center max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-[#0F2A24]">
          Property not found
        </h1>
        <p className="text-sm text-[#51625C] mt-3 mb-6">
          This listing may have been removed or updated.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to all properties</span>
        </Link>
      </section>
    );
  }

  const images: LightboxItem[] = useMemo(() => {
    const list: LightboxItem[] = [];
    if (gallery.length > 0) {
      gallery.forEach((img) =>
        list.push({ url: img.url, alt: img.altText || property.title, title: property.title })
      );
    } else if (property.coverImageUrl) {
      list.push({
        url: property.coverImageUrl,
        alt: property.coverImageAlt || property.title,
        title: property.title,
      });
    }
    return list;
  }, [gallery, property]);

  const activeImg = images[activeImageIndex] || images[0];
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappUrl = buildWhatsAppLink(
    siteSettings.whatsappUrl,
    `Assalam-o-Alaikum, I am interested in "${property.title}" (${formatPkr(
      property.pricePkr,
      property.purpose
    )}). Link: ${currentUrl}`
  );
  const telHref = `tel:${siteSettings.phoneInternational.replace(/\s+/g, '')}`;

  const similarProperties = properties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.purpose === property.purpose))
    .slice(0, 3);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `${property.title} — ${formatPkr(property.pricePkr, property.purpose)}`,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    } catch {
      // User cancelled share
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: currentUrl,
    image: property.coverImageUrl,
    offers: {
      '@type': 'Offer',
      price: String(property.pricePkr),
      priceCurrency: 'PKR',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.addressArea,
      addressLocality: 'Sahiwal',
      addressCountry: 'PK',
    },
  };

  return (
    <>
      <SeoHead
        title={`${property.title} — ${formatPkr(property.pricePkr, property.purpose)} | Premier Property`}
        description={property.description.slice(0, 155)}
        image={property.coverImageUrl}
        jsonLd={jsonLd}
      />

      <div className="bg-[#F6F7F4] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#51625C] hover:text-[#0F2A24]"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>All properties</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0F2A24]/20 bg-white text-xs font-medium text-[#0F2A24] hover:border-[#0F2A24]"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0F2A24]" aria-hidden="true" />
                  <span>Link copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Share listing</span>
                </>
              )}
            </button>
          </div>

          {/* Photo Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
            <div className="lg:col-span-9">
              {activeImg ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block w-full aspect-[16/10] bg-[#0F2A24]/5 overflow-hidden border border-[#0F2A24]/12 cursor-zoom-in"
                >
                  <img
                    src={activeImg.url}
                    alt={activeImg.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : null}
            </div>

            <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[460px]">
              {images.map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`shrink-0 w-28 lg:w-full aspect-[4/3] overflow-hidden border-2 transition-colors ${
                    idx === activeImageIndex ? 'border-[#B38B52]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main Content + Inquiry Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="pb-6 border-b border-[#0F2A24]/12">
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#51625C] mb-3">
                  <span className="px-2.5 py-1 bg-[#0F2A24] text-[#F6F7F4] font-medium">
                    {formatPropertyStatus(property.status)}
                  </span>
                  <span>{formatPropertyType(property.type)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{property.purpose === 'sale' ? 'For sale' : 'For rent'}</span>
                  {property.isSample && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#B38B52]">Sample listing</span>
                    </>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F2A24] leading-tight">
                  {property.title}
                </h1>

                <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#0F2A24] tabular-nums">
                  {formatPkr(property.pricePkr, property.purpose)}
                </p>

                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#51625C]">
                  <MapPin className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
                  <span>{property.addressArea}</span>
                </p>
              </div>

              {/* Specifications Table */}
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mb-4">
                  Specifications
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-[#0F2A24]/12 bg-white">
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Area</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1 tabular-nums">
                      {formatArea(property.areaSize, property.areaUnit)}
                    </dd>
                  </div>
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Bedrooms</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1 tabular-nums">
                      {property.bedrooms > 0 ? property.bedrooms : '—'}
                    </dd>
                  </div>
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Bathrooms</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1 tabular-nums">
                      {property.bathrooms > 0 ? property.bathrooms : '—'}
                    </dd>
                  </div>
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Parking spaces</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1 tabular-nums">
                      {property.parking > 0 ? property.parking : '—'}
                    </dd>
                  </div>
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Furnished</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1">
                      {property.furnished ? 'Yes' : 'Unfurnished'}
                    </dd>
                  </div>
                  <div className="p-4 border-r border-b border-[#0F2A24]/12">
                    <dt className="text-xs text-[#51625C]">Year built</dt>
                    <dd className="text-sm font-semibold text-[#0F2A24] mt-1 tabular-nums">
                      {property.yearBuilt || '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mb-3">
                  Overview
                </h2>
                <p className="text-sm sm:text-base text-[#51625C] leading-relaxed whitespace-pre-line max-w-[70ch]">
                  {property.description}
                </p>
              </div>

              {/* Features & Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mb-3">
                    Features &amp; amenities
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {property.amenities.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm text-[#0F2A24] bg-white border border-[#0F2A24]/10 px-4 py-2.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#B38B52] shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coordinates / Map Embed & Google Maps Grounding */}
              {property.latitude && property.longitude && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-[#0F2A24]">Location</h2>
                    <a
                      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#B38B52] hover:underline"
                    >
                      <span>View coordinates in Google Maps</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="border border-[#0F2A24]/15 bg-white overflow-hidden">
                    <iframe
                      title={`Map of ${property.title}`}
                      width="100%"
                      height="300"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.015},${property.latitude - 0.01},${property.longitude + 0.015},${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                    />
                  </div>
                </div>
              )}

              <NeighborhoodExplorer
                areaLabel={property.addressArea}
                latitude={property.latitude}
                longitude={property.longitude}
              />
            </div>

            {/* Right Inquiry Box */}
            <aside id="inquire" className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white border border-[#0F2A24]/15 p-6 sm:p-7">
                <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mb-1">
                  Inquire about this property
                </h2>
                <p className="text-xs text-[#51625C] mb-5">
                  Send your details below or message us directly on WhatsApp.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 mb-6 pb-6 border-b border-[#0F2A24]/10">
                  <a
                    href={sanitizeSafeHref(whatsappUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                  <a
                    href={sanitizeSafeHref(telHref)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-[#0F2A24]/20 text-[#0F2A24] text-xs font-medium hover:border-[#0F2A24]"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="tabular-nums">{siteSettings.phoneDisplay}</span>
                  </a>
                </div>

                <InquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  sourcePage={`/properties/${property.slug}`}
                />
              </div>
            </aside>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#0F2A24]/12">
              <h2 className="font-display text-3xl font-semibold text-[#0F2A24] mb-8">
                Similar properties
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {similarProperties.map((sim) => (
                  <PropertyCard key={sim.id} property={sim} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          items={images}
          index={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setActiveImageIndex}
        />
      )}
    </>
  );
}
