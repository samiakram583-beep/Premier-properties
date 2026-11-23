import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, MapPin, Star } from 'lucide-react';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import { sanitizeSafeHref } from '../lib/formatters.ts';

export function AboutPage() {
  const { siteSettings } = useApp();

  return (
    <>
      <SeoHead
        title={`About — ${siteSettings.businessName}`}
        description="Learn about Premier Property Management & Development at 103, Park Avenue Colony, Pak Avenue Housing Scheme, Sahiwal."
      />

      <section className="bg-[#0F2A24] text-[#F6F7F4] py-16 border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#B38B52] font-medium mb-2">About the practice</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-3xl leading-tight">
            Grounded real estate stewardship in Pak Avenue Housing Scheme, Sahiwal.
          </h1>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6 text-base text-[#51625C] leading-relaxed max-w-[68ch]">
            <h2 className="font-display text-3xl font-semibold text-[#0F2A24]">
              Plain dealing and local accountability
            </h2>
            <p>
              {siteSettings.businessName} operates from 103, Park Avenue Colony inside Pak Avenue
              Housing Scheme, Sahiwal. Our work spans residential home sales, plot advisory,
              commercial leasing, property management, and development coordination.
            </p>
            <p>
              Real estate decisions carry substantial family and institutional capital. Rather than
              pushing high-volume listings, we focus on verified ownership files, realistic local
              valuations, and direct communication between buyers, sellers, landlords, and tenants.
            </p>
            <p>
              Whether you are visiting our office in person or coordinating property care from
              another city or overseas, every viewing, inspection, and transfer step is documented
              clearly.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#0F2A24] text-[#F6F7F4] text-sm font-medium hover:bg-[#0A1E19]"
              >
                <span>Browse properties</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 border border-[#0F2A24]/25 text-[#0F2A24] text-sm font-medium hover:border-[#0F2A24]"
              >
                <span>Contact our office</span>
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#0F2A24]/12 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0F2A24]">
                <Star className="w-4 h-4 fill-[#B38B52] text-[#B38B52]" aria-hidden="true" />
                <span className="tabular-nums">
                  {siteSettings.googleRating.toFixed(1)} rating from {siteSettings.googleReviewCount} Google reviews
                </span>
              </div>
              <div className="pt-4 border-t border-[#0F2A24]/10 space-y-2 text-sm">
                <p className="font-medium text-[#0F2A24]">Office address</p>
                <p className="text-[#51625C] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#B38B52] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{siteSettings.address}</span>
                </p>
                <a
                  href={sanitizeSafeHref(siteSettings.googleMapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#B38B52] hover:underline pt-1"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
              <div className="pt-4 border-t border-[#0F2A24]/10 text-sm">
                <p className="font-medium text-[#0F2A24]">Direct phone &amp; WhatsApp</p>
                <p className="text-[#51625C] mt-1 tabular-nums">
                  {siteSettings.phoneDisplay} ({siteSettings.phoneInternational})
                </p>
                {siteSettings.workingHours && (
                  <p className="text-xs text-[#51625C] mt-1">{siteSettings.workingHours}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
