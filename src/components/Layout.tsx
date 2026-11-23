import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { buildWhatsAppLink, sanitizeSafeHref } from '../lib/formatters.ts';

const NAV_LINKS = [
  { to: '/properties', label: 'Properties' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { siteSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const telHref = `tel:${siteSettings.phoneInternational.replace(/\s+/g, '')}`;
  const whatsappHref = buildWhatsAppLink(
    siteSettings.whatsappUrl,
    'Assalam-o-Alaikum, I would like to inquire about a property with Premier Property Management & Development.'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#0F2A24] overflow-x-hidden">
      {/* 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#F6F7F4]/95 backdrop-blur-sm border-b border-[#0F2A24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#0F2A24] whitespace-nowrap shrink-0"
          >
            Premier Property
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#51625C]"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 transition-colors border-b ${
                    isActive
                      ? 'text-[#0F2A24] border-[#B38B52]'
                      : 'border-transparent hover:text-[#0F2A24] hover:border-[#0F2A24]/30'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single primary action + mobile menu toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={sanitizeSafeHref(telHref)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0F2A24] text-[#F6F7F4] hover:bg-[#0A1E19] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <Phone className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
              <span className="tabular-nums">Call {siteSettings.phoneDisplay}</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#0F2A24] border border-[#0F2A24]/15"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#0F2A24]/10 bg-[#F6F7F4] px-4 py-4 space-y-2">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 text-base font-medium ${
                    isActive ? 'text-[#0F2A24] bg-[#0F2A24]/5' : 'text-[#51625C]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={sanitizeSafeHref(telHref)}
              className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 text-sm font-medium bg-[#0F2A24] text-[#F6F7F4]"
            >
              <Phone className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
              <span>Call {siteSettings.phoneDisplay}</span>
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Quiet Architectural Footer */}
      <footer className="bg-[#0F2A24] text-[#F6F7F4] border-t border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-5 space-y-4">
              <p className="font-display text-2xl font-semibold text-[#F6F7F4]">
                {siteSettings.businessName}
              </p>
              <p className="text-sm text-[#F6F7F4]/75 max-w-md leading-relaxed">
                {siteSettings.address}
              </p>
              <p className="text-sm text-[#B38B52] tabular-nums">
                {siteSettings.googleRating.toFixed(1)} rating on Google · {siteSettings.googleReviewCount} reviews
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-sm">
              <p className="text-[#B38B52] font-medium mb-3">Navigation</p>
              {NAV_LINKS.map((item) => (
                <div key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[#F6F7F4]/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div>
                <Link
                  to="/admin"
                  className="text-[#F6F7F4]/60 hover:text-white transition-colors"
                >
                  Admin portal
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 space-y-2.5 text-sm">
              <p className="text-[#B38B52] font-medium mb-3">Direct Contact</p>
              <p>
                <a
                  href={sanitizeSafeHref(telHref)}
                  className="text-[#F6F7F4]/85 hover:text-white tabular-nums"
                >
                  {siteSettings.phoneDisplay} ({siteSettings.phoneInternational})
                </a>
              </p>
              <p>
                <a
                  href={sanitizeSafeHref(whatsappHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F6F7F4]/85 hover:text-white underline underline-offset-4 decoration-[#B38B52]/60"
                >
                  Message on WhatsApp
                </a>
              </p>
              <p>
                <a
                  href={sanitizeSafeHref(siteSettings.googleMapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F6F7F4]/85 hover:text-white underline underline-offset-4 decoration-[#B38B52]/60"
                >
                  View office on Google Maps
                </a>
              </p>
              {siteSettings.workingHours && (
                <p className="text-[#F6F7F4]/65 pt-1">{siteSettings.workingHours}</p>
              )}
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F6F7F4]/60">
            <p>
              © {new Date().getFullYear()} {siteSettings.businessName}. Sahiwal, Pakistan.
            </p>
            <div className="flex items-center gap-5">
              {siteSettings.facebookUrl && (
                <a
                  href={sanitizeSafeHref(siteSettings.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Facebook
                </a>
              )}
              {siteSettings.instagramUrl && (
                <a
                  href={sanitizeSafeHref(siteSettings.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Instagram
                </a>
              )}
              {siteSettings.linkedinUrl && (
                <a
                  href={sanitizeSafeHref(siteSettings.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button on every public page */}
      <a
        href={sanitizeSafeHref(whatsappHref)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Premier Property"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 bg-[#0F2A24] text-[#F6F7F4] border border-[#B38B52]/60 shadow-lg hover:bg-[#0A1E19] transition-colors min-h-[44px]"
      >
        <MessageCircle className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
        <span className="text-xs font-medium whitespace-nowrap">WhatsApp</span>
      </a>
    </div>
  );
}
