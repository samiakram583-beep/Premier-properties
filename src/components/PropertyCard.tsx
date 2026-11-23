import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  buildWhatsAppLink,
  formatArea,
  formatPkr,
  formatPropertyStatus,
  formatPropertyType,
  sanitizeSafeHref,
} from '../lib/formatters.ts';
import type { Property } from '../types/domain.ts';

interface PropertyCardProps {
  property: Property;
  onQuickInquire?: (property: Property) => void;
}

export function PropertyCard({ property, onQuickInquire }: PropertyCardProps) {
  const { siteSettings } = useApp();
  const [imgFailed, setImgFailed] = useState(false);

  const propertyPath = `/properties/${property.slug}`;
  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${propertyPath}` : propertyPath;

  const whatsappUrl = buildWhatsAppLink(
    siteSettings.whatsappUrl,
    `Assalam-o-Alaikum, I would like details about: ${property.title} (${formatPkr(property.pricePkr, property.purpose)}) — ${fullUrl}`
  );

  return (
    <article className="group bg-white border border-[#0F2A24]/12 flex flex-col justify-between transition-colors hover:border-[#0F2A24]/30">
      <div>
        <Link to={propertyPath} className="block relative aspect-[4/3] overflow-hidden bg-[#0F2A24]/5">
          {property.coverImageUrl && !imgFailed ? (
            <img
              src={property.coverImageUrl}
              alt={property.coverImageAlt || property.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0F2A24]/10 to-[#B38B52]/10">
              <Building2 className="w-8 h-8 text-[#0F2A24]/40 mb-2" aria-hidden="true" />
              <span className="text-xs text-[#51625C]">{property.title}</span>
            </div>
          )}

          {/* Crisp single status label */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium bg-[#0F2A24] text-[#F6F7F4]">
              {formatPropertyStatus(property.status)}
            </span>
            {property.isSample && (
              <span className="px-2 py-1 text-xs font-medium bg-[#F6F7F4]/95 text-[#0F2A24] border border-[#0F2A24]/15">
                Sample
              </span>
            )}
          </div>
        </Link>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 text-xs text-[#51625C] mb-2">
            <span>{formatPropertyType(property.type)}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{property.addressArea}</span>
          </div>

          <Link to={propertyPath} className="block">
            <h3 className="font-display text-2xl font-semibold text-[#0F2A24] leading-snug group-hover:text-[#B38B52] transition-colors line-clamp-2">
              {property.title}
            </h3>
          </Link>

          <p className="mt-3 text-lg font-semibold text-[#0F2A24] tabular-nums">
            {formatPkr(property.pricePkr, property.purpose)}
          </p>

          <div className="mt-3 pt-3 border-t border-[#0F2A24]/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#51625C] tabular-nums">
            <span>{formatArea(property.areaSize, property.areaUnit)}</span>
            {property.bedrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{property.bedrooms} Bed</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{property.bathrooms} Bath</span>
              </>
            )}
            {property.parking > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{property.parking} Parking</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6 flex items-center gap-2.5">
        {onQuickInquire ? (
          <button
            type="button"
            onClick={() => onQuickInquire(property)}
            className="flex-1 px-4 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] transition-colors text-center whitespace-nowrap min-h-[40px]"
          >
            Inquire about this property
          </button>
        ) : (
          <Link
            to={`${propertyPath}#inquire`}
            className="flex-1 px-4 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] transition-colors text-center whitespace-nowrap min-h-[40px] flex items-center justify-center"
          >
            Inquire about this property
          </Link>
        )}
        <a
          href={sanitizeSafeHref(whatsappUrl)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Inquire on WhatsApp about ${property.title}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#0F2A24]/20 text-[#0F2A24] text-xs font-medium hover:border-[#B38B52] hover:text-[#B38B52] transition-colors whitespace-nowrap min-h-[40px]"
        >
          <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
