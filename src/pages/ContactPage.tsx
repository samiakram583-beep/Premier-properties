import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { InquiryForm } from '../components/InquiryForm.tsx';
import { NeighborhoodExplorer } from '../components/NeighborhoodExplorer.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import { buildWhatsAppLink, sanitizeSafeHref } from '../lib/formatters.ts';

export function ContactPage() {
  const { siteSettings } = useApp();
  const telHref = `tel:${siteSettings.phoneInternational.replace(/\s+/g, '')}`;
  const whatsappHref = buildWhatsAppLink(
    siteSettings.whatsappUrl,
    'Assalam-o-Alaikum, I would like to connect with Premier Property Management & Development.'
  );

  return (
    <>
      <SeoHead
        title={`Contact — ${siteSettings.businessName}`}
        description={`Contact Premier Property Management & Development at ${siteSettings.address} or call ${siteSettings.phoneDisplay}.`}
      />

      <section className="bg-[#0F2A24] text-[#F6F7F4] py-16 border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#B38B52] font-medium mb-2">Contact</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">
            Reach our Sahiwal office
          </h1>
          <p className="text-sm sm:text-base text-[#F6F7F4]/75 max-w-2xl mt-3">
            Call, message on WhatsApp, visit in person at Park Avenue Colony, or submit a general
            inquiry below.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 bg-white border border-[#0F2A24]/12 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2A24]">
                  Office details
                </h2>
                <p className="text-xs text-[#51625C] mt-1">{siteSettings.businessName}</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B38B52] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#0F2A24]">Address</p>
                    <p className="text-[#51625C] mt-0.5">{siteSettings.address}</p>
                    <a
                      href={sanitizeSafeHref(siteSettings.googleMapsUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#B38B52] hover:underline mt-1.5"
                    >
                      <span>Open Google Maps directions</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#B38B52] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#0F2A24]">Phone</p>
                    <a
                      href={sanitizeSafeHref(telHref)}
                      className="text-[#51625C] hover:text-[#0F2A24] tabular-nums mt-0.5 block"
                    >
                      {siteSettings.phoneDisplay} ({siteSettings.phoneInternational})
                    </a>
                  </div>
                </div>

                {siteSettings.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#B38B52] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-[#0F2A24]">Email</p>
                      <a
                        href={`mailto:${siteSettings.email}`}
                        className="text-[#51625C] hover:text-[#0F2A24] mt-0.5 block"
                      >
                        {siteSettings.email}
                      </a>
                    </div>
                  </div>
                )}

                {siteSettings.workingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#B38B52] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-[#0F2A24]">Office hours</p>
                      <p className="text-[#51625C] mt-0.5">{siteSettings.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#0F2A24]/10 flex flex-wrap gap-3">
                <a
                  href={sanitizeSafeHref(whatsappHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19]"
                >
                  <MessageCircle className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={sanitizeSafeHref(telHref)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#0F2A24]/20 text-[#0F2A24] text-xs font-medium hover:border-[#0F2A24]"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Call now</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#0F2A24]/12 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mb-1">
                General inquiry form
              </h2>
              <p className="text-xs text-[#51625C] mb-6">
                Tell us whether you are buying, selling, renting, or seeking property management.
              </p>
              <InquiryForm sourcePage="/contact" />
            </div>
          </div>

          <NeighborhoodExplorer
            areaLabel="103, Park Avenue Colony, Pak Avenue Housing Scheme, Sahiwal"
            latitude={30.6682}
            longitude={73.1114}
          />
        </div>
      </section>
    </>
  );
}
