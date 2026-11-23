import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SeoHead } from '../components/SeoHead.tsx';

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Page not found — Premier Property Management & Development"
        description="The requested page could not be found."
      />
      <section className="py-28 px-4 text-center max-w-xl mx-auto">
        <p className="font-mono text-xs text-[#B38B52] mb-2">404</p>
        <h1 className="font-display text-4xl font-semibold text-[#0F2A24]">
          This page could not be found.
        </h1>
        <p className="text-sm text-[#51625C] mt-3 mb-8 leading-relaxed">
          The link may have moved or the listing is no longer active. Browse current properties or
          return home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0F2A24]/25 text-[#0F2A24] text-xs font-medium"
          >
            <span>Browse properties</span>
          </Link>
        </div>
      </section>
    </>
  );
}
