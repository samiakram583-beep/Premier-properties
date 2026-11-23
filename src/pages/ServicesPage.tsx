import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';

const DETAILED_SERVICES = [
  {
    code: '01',
    title: 'Residential & Commercial Sales',
    summary:
      'Representation for buyers and sellers across houses, residential plots, apartments, shops, offices, and commercial buildings in Sahiwal.',
    points: [
      'Comparable recent transaction guidance before setting ask or offer prices',
      'On-site inspection of street width, utilities, and neighboring construction',
      'Transparent bayana and transfer scheduling with both parties present',
    ],
  },
  {
    code: '02',
    title: 'Property Management & Leasing',
    summary:
      'Structured management for residential and commercial landlords, including overseas Pakistanis seeking reliable oversight in Sahiwal.',
    points: [
      'Tenant screening, lease drafting, and security deposit documentation',
      'Monthly rent follow-up and coordinated preventive maintenance',
      'Periodic photo inspection updates when properties are vacant or leased',
    ],
  },
  {
    code: '03',
    title: 'Plot Verification & Documentation',
    summary:
      'Due diligence prior to commitment so allotment letters, possession status, and society dues are clear on paper and on site.',
    points: [
      'Physical plot demarcation and boundary confirmation',
      'Society transfer clearance and pending charge checks',
      'Guidance through registry, stamp duty, and utility meter transfers',
    ],
  },
  {
    code: '04',
    title: 'Development & Construction Advisory',
    summary:
      'Practical planning and oversight for owners building custom residences or small commercial projects on their plots.',
    points: [
      'Plot orientation and bylaw review before architectural drawings',
      'Grey-structure and finishing milestone monitoring',
      'Material specification and contractor coordination support',
    ],
  },
];

export function ServicesPage() {
  const { siteSettings } = useApp();

  return (
    <>
      <SeoHead
        title={`Services — ${siteSettings.businessName}`}
        description="Real estate sales, leasing, property management, plot verification, and development advisory in Sahiwal, Pakistan."
      />

      <section className="bg-[#0F2A24] text-[#F6F7F4] py-16 border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#B38B52] font-medium mb-2">Services</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-3xl leading-tight">
            Property advisory, management, and development support.
          </h1>
        </div>
      </section>

      <section className="py-16 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-[#0F2A24]/15 border-t border-b border-[#0F2A24]/15">
          {DETAILED_SERVICES.map((srv) => (
            <div key={srv.code} className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <p className="font-mono text-xs text-[#B38B52] mb-2">{srv.code}.</p>
                <h2 className="font-display text-3xl font-semibold text-[#0F2A24]">{srv.title}</h2>
                <p className="text-sm text-[#51625C] mt-3 leading-relaxed max-w-md">{srv.summary}</p>
              </div>
              <div className="lg:col-span-7">
                <ul className="space-y-3">
                  {srv.points.map((pt) => (
                    <li
                      key={pt}
                      className="bg-white border border-[#0F2A24]/10 px-5 py-3.5 text-sm text-[#0F2A24]"
                    >
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#51625C]">
            Need help with a specific property or management brief in Sahiwal?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2A24] text-[#F6F7F4] text-sm font-medium hover:bg-[#0A1E19]"
          >
            <span>Discuss your requirement</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
