import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, MapPin, Phone, Star } from 'lucide-react';
import { HeroHouseDrawing } from '../components/HeroHouseDrawing.tsx';
import { InquiryForm } from '../components/InquiryForm.tsx';
import { NeighborhoodExplorer } from '../components/NeighborhoodExplorer.tsx';
import { PropertyCard } from '../components/PropertyCard.tsx';
import { QuickInquiryModal } from '../components/QuickInquiryModal.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import { buildWhatsAppLink, sanitizeSafeHref } from '../lib/formatters.ts';
import type { Property } from '../types/domain.ts';

const SERVICES = [
  {
    num: '01.',
    title: 'Residential & Commercial Sales',
    desc: 'Direct representation for buyers and sellers of homes, plots, shops, and commercial buildings across Pak Avenue Housing Scheme and Sahiwal.',
  },
  {
    num: '02.',
    title: 'Property Management & Leasing',
    desc: 'End-to-end tenancy placement, rent collection, routine maintenance coordination, and periodic inspection reports for local and overseas owners.',
  },
  {
    num: '03.',
    title: 'Plot Verification & Documentation',
    desc: 'Thorough title, allotment, and society transfer checks before any token or bayana agreement is signed.',
  },
  {
    num: '04.',
    title: 'Development & Construction Advisory',
    desc: 'Site feasibility, contractor coordination, and stage-wise supervision for residential houses and commercial builds.',
  },
];

const WORK_STEPS = [
  {
    step: 'Step 01',
    title: 'Understand your brief',
    text: 'We listen to your budget, preferred sector or road access, and intended timeline without pushing unrelated inventory.',
  },
  {
    step: 'Step 02',
    title: 'Verify site & papers',
    text: 'Every shortlisted plot or building is checked on the ground alongside its transfer file, dimensions, and utility status.',
  },
  {
    step: 'Step 03',
    title: 'Walkthrough & fair terms',
    text: 'We arrange unhurried site visits and facilitate transparent price and payment schedule discussions between parties.',
  },
  {
    step: 'Step 04',
    title: 'Transfer & handover',
    text: 'We remain beside you through society transfer, registry execution, utility meter updates, or tenancy handover.',
  },
];

export function HomePage() {
  const { siteSettings, properties } = useApp();
  const [quickInquiryProperty, setQuickInquiryProperty] = useState<Property | null>(null);

  const featuredProperties = properties.filter((p) => p.featured).slice(0, 6);
  const displayProperties = featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 6);
  const telHref = `tel:${siteSettings.phoneInternational.replace(/\s+/g, '')}`;
  const whatsappHref = buildWhatsAppLink(
    siteSettings.whatsappUrl,
    'Assalam-o-Alaikum, I would like to discuss a property requirement in Sahiwal.'
  );

  return (
    <>
      <SeoHead
        title={`${siteSettings.businessName} — Real Estate in Sahiwal`}
        description="Premier Property Management & Development in Pak Avenue Housing Scheme, Sahiwal. Homes, plots, commercial real estate, and dedicated property management."
      />

      {/* Hero Section */}
      <section className="bg-[#0F2A24] text-[#F6F7F4] border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 text-xs text-[#B38B52] tracking-wide">
                <Star className="w-3.5 h-3.5 fill-[#B38B52] text-[#B38B52]" aria-hidden="true" />
                <span className="tabular-nums">
                  {siteSettings.googleRating.toFixed(1)} rating on Google · {siteSettings.googleReviewCount} reviews
                </span>
                <span aria-hidden="true">·</span>
                <span>Pak Avenue Housing Scheme, Sahiwal</span>
              </div>

              <h1
                className="font-display font-semibold text-[#F6F7F4] leading-[1.06] tracking-tight max-w-2xl"
                style={{ fontSize: 'clamp(2.5rem, 4.6vw, 4.1rem)', textWrap: 'balance' }}
              >
                {siteSettings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#F6F7F4]/80 max-w-xl leading-relaxed">
                {siteSettings.heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#B38B52] text-[#0F2A24] text-sm font-semibold hover:bg-[#c39b61] transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <span>Browse properties</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href={sanitizeSafeHref(telHref)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#F6F7F4]/30 text-[#F6F7F4] text-sm font-medium hover:border-[#B38B52] hover:text-[#B38B52] transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call now ({siteSettings.phoneDisplay})</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HeroHouseDrawing />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 sm:py-24 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#0F2A24]/10 mb-10">
            <div>
              <p className="text-xs text-[#B38B52] font-medium mb-2">Selected listings</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F2A24]">
                Featured properties in Sahiwal
              </h2>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0F2A24] hover:text-[#B38B52] transition-colors whitespace-nowrap"
            >
              <span>View all properties</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onQuickInquire={setQuickInquiryProperty}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview (editorial hairline list, no card clutter) */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#0F2A24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              <p className="text-xs text-[#B38B52] font-medium">What we handle</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F2A24]">
                Advisory, management, and development under one roof.
              </h2>
              <p className="text-sm text-[#51625C] leading-relaxed max-w-prose">
                Whether acquiring a family plot, leasing a commercial floor, or managing a home
                from abroad, we keep every step verifiable.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0F2A24] underline underline-offset-4 decoration-[#B38B52] pt-2"
              >
                <span>Explore all services</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#0F2A24]/10 border-t border-b border-[#0F2A24]/10">
              {SERVICES.map((srv) => (
                <div
                  key={srv.num}
                  className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
                >
                  <span className="sm:col-span-2 font-mono text-xs text-[#B38B52] tabular-nums">
                    {srv.num}
                  </span>
                  <h3 className="sm:col-span-4 font-display text-2xl font-semibold text-[#0F2A24]">
                    {srv.title}
                  </h3>
                  <p className="sm:col-span-6 text-sm text-[#51625C] leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Premier */}
      <section className="py-16 sm:py-24 bg-[#0F2A24] text-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs text-[#B38B52] font-medium mb-2">Why Premier</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F6F7F4]">
              Plain dealing, local presence, and accountable follow-through.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-8 border-t border-white/15">
            <div className="space-y-2.5">
              <p className="font-display text-4xl font-semibold text-[#B38B52] tabular-nums">
                {siteSettings.googleRating.toFixed(1)} / 5
              </p>
              <h3 className="text-base font-semibold text-white">
                Rated {siteSettings.googleRating.toFixed(1)} across {siteSettings.googleReviewCount} Google reviews
              </h3>
              <p className="text-sm text-[#F6F7F4]/75 leading-relaxed">
                Consistent client feedback reflecting straightforward guidance, responsive calls,
                and clean transfer handling in Sahiwal.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="font-display text-4xl font-semibold text-[#B38B52]">Pak Avenue</p>
              <h3 className="text-base font-semibold text-white">Rooted on the ground in Sahiwal</h3>
              <p className="text-sm text-[#F6F7F4]/75 leading-relaxed">
                Based at 103, Park Avenue Colony inside Pak Avenue Housing Scheme, giving us
                firsthand visibility into block-by-block pricing and development progress.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="font-display text-4xl font-semibold text-[#B38B52]">Direct terms</p>
              <h3 className="text-base font-semibold text-white">Verified files and plain dealing</h3>
              <p className="text-sm text-[#F6F7F4]/75 leading-relaxed">
                Clear commission structure, direct buyer-seller clarity, and documented possession
                and utility verification before closing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work (4 steps) */}
      <section className="py-16 sm:py-24 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs text-[#B38B52] font-medium mb-2">Process</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F2A24]">
              How we work from first call to handover.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-[#0F2A24]/15">
            {WORK_STEPS.map((item) => (
              <div key={item.step} className="space-y-2.5">
                <p className="font-mono text-xs text-[#B38B52]">{item.step}</p>
                <h3 className="font-display text-2xl font-semibold text-[#0F2A24]">{item.title}</h3>
                <p className="text-sm text-[#51625C] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Neighborhood Grounding Explorer */}
          <div className="mt-16">
            <NeighborhoodExplorer
              areaLabel="103, Park Avenue Colony, Pak Avenue Housing Scheme, Sahiwal"
              latitude={30.6682}
              longitude={73.1114}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#0F2A24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs text-[#B38B52] font-medium">Visit or write to us</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F2A24]">
                Speak directly with our Sahiwal office.
              </h2>
              <p className="text-sm text-[#51625C] leading-relaxed max-w-md">
                Visit us in Park Avenue Colony or send a message with what you are looking to buy,
                sell, lease, or manage.
              </p>

              <div className="space-y-3 pt-2 text-sm text-[#0F2A24]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B38B52] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{siteSettings.address}</p>
                    <a
                      href={sanitizeSafeHref(siteSettings.googleMapsUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#51625C] hover:text-[#0F2A24] underline underline-offset-4 mt-1"
                    >
                      <span>Open Google Maps location</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#B38B52] shrink-0" aria-hidden="true" />
                  <a href={sanitizeSafeHref(telHref)} className="font-medium tabular-nums">
                    {siteSettings.phoneDisplay} ({siteSettings.phoneInternational})
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={sanitizeSafeHref(whatsappHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 border border-[#0F2A24]/25 text-sm font-medium text-[#0F2A24] hover:border-[#B38B52] hover:text-[#B38B52] transition-colors"
                >
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#F6F7F4] border border-[#0F2A24]/12 p-6 sm:p-8">
              <InquiryForm sourcePage="/" />
            </div>
          </div>
        </div>
      </section>

      <QuickInquiryModal
        property={quickInquiryProperty}
        onClose={() => setQuickInquiryProperty(null)}
      />
    </>
  );
}
