import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard.tsx';
import { QuickInquiryModal } from '../components/QuickInquiryModal.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import type { AreaUnit, Property, PropertyPurpose, PropertyType } from '../types/domain.ts';

const ITEMS_PER_PAGE = 9;

export function PropertiesPage() {
  const { properties, siteSettings } = useApp();

  const [keyword, setKeyword] = useState('');
  const [purpose, setPurpose] = useState<'all' | PropertyPurpose>('all');
  const [type, setType] = useState<'all' | PropertyType>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('all');
  const [minArea, setMinArea] = useState('');
  const [areaUnitFilter, setAreaUnitFilter] = useState<'all' | AreaUnit>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [page, setPage] = useState(1);
  const [quickInquiryProperty, setQuickInquiryProperty] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;
    const minBed = minBedrooms === 'all' ? null : Number(minBedrooms);
    const minA = minArea ? Number(minArea) : null;

    const list = properties.filter((p) => {
      if (purpose !== 'all' && p.purpose !== purpose) return false;
      if (type !== 'all' && p.type !== type) return false;
      if (minP !== null && Number.isFinite(minP) && p.pricePkr < minP) return false;
      if (maxP !== null && Number.isFinite(maxP) && p.pricePkr > maxP) return false;
      if (minBed !== null && p.bedrooms < minBed) return false;
      if (areaUnitFilter !== 'all' && p.areaUnit !== areaUnitFilter) return false;
      if (minA !== null && Number.isFinite(minA) && p.areaSize < minA) return false;
      if (kw) {
        const hay = `${p.title} ${p.addressArea} ${p.description} ${p.type}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.pricePkr - b.pricePkr);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.pricePkr - a.pricePkr);
    }
    return sorted;
  }, [properties, keyword, purpose, type, minPrice, maxPrice, minBedrooms, minArea, areaUnitFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setKeyword('');
    setPurpose('all');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('all');
    setMinArea('');
    setAreaUnitFilter('all');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <>
      <SeoHead
        title={`Properties — ${siteSettings.businessName}`}
        description="Browse residential houses, plots, apartments, commercial buildings, and rental properties in Pak Avenue Housing Scheme and Sahiwal."
      />

      <section className="bg-[#0F2A24] text-[#F6F7F4] py-14 border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#B38B52] font-medium mb-2">Listings directory</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">
            Available &amp; recent properties
          </h1>
          <p className="text-sm sm:text-base text-[#F6F7F4]/75 max-w-2xl mt-3">
            Filter by purpose, property type, PKR budget, bedrooms, or area unit across Sahiwal.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Panel */}
          <div className="bg-white border border-[#0F2A24]/12 p-5 sm:p-6 mb-10">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#0F2A24]/10 mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0F2A24]">
                <SlidersHorizontal className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
                <span>Filter listings</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-[#51625C] hover:text-[#0F2A24] underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Keyword */}
              <div>
                <label htmlFor="filter-keyword" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Search location or keyword
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#51625C] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="filter-keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Pak Avenue, Kanal, corner..."
                    className="w-full pl-9 pr-3 py-2 border border-[#0F2A24]/20 text-sm outline-none focus:border-[#0F2A24]"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="filter-purpose" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Purpose
                </label>
                <select
                  id="filter-purpose"
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value as 'all' | PropertyPurpose);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm bg-white outline-none focus:border-[#0F2A24]"
                >
                  <option value="all">All (Sale &amp; Rent)</option>
                  <option value="sale">For sale</option>
                  <option value="rent">For rent</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="filter-type" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Property type
                </label>
                <select
                  id="filter-type"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as 'all' | PropertyType);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm bg-white outline-none focus:border-[#0F2A24]"
                >
                  <option value="all">All types</option>
                  <option value="house">House</option>
                  <option value="plot">Plot</option>
                  <option value="apartment">Apartment</option>
                  <option value="shop">Shop</option>
                  <option value="office">Office</option>
                  <option value="agricultural_land">Agricultural land</option>
                  <option value="commercial_building">Commercial building</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label htmlFor="filter-bedrooms" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Minimum bedrooms
                </label>
                <select
                  id="filter-bedrooms"
                  value={minBedrooms}
                  onChange={(e) => {
                    setMinBedrooms(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm bg-white outline-none focus:border-[#0F2A24]"
                >
                  <option value="all">Any</option>
                  <option value="1">1+ Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              {/* Min Price PKR */}
              <div>
                <label htmlFor="filter-min-price" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Min price (PKR)
                </label>
                <input
                  id="filter-min-price"
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. 5000000"
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm tabular-nums outline-none focus:border-[#0F2A24]"
                />
              </div>

              {/* Max Price PKR */}
              <div>
                <label htmlFor="filter-max-price" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Max price (PKR)
                </label>
                <input
                  id="filter-max-price"
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. 80000000"
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm tabular-nums outline-none focus:border-[#0F2A24]"
                />
              </div>

              {/* Area Size & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="filter-min-area" className="block text-xs font-medium text-[#0F2A24] mb-1">
                    Min area
                  </label>
                  <input
                    id="filter-min-area"
                    type="number"
                    min={0}
                    value={minArea}
                    onChange={(e) => {
                      setMinArea(e.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm tabular-nums outline-none focus:border-[#0F2A24]"
                  />
                </div>
                <div>
                  <label htmlFor="filter-area-unit" className="block text-xs font-medium text-[#0F2A24] mb-1">
                    Unit
                  </label>
                  <select
                    id="filter-area-unit"
                    value={areaUnitFilter}
                    onChange={(e) => {
                      setAreaUnitFilter(e.target.value as 'all' | AreaUnit);
                      setPage(1);
                    }}
                    className="w-full px-2.5 py-2 border border-[#0F2A24]/20 text-sm bg-white outline-none focus:border-[#0F2A24]"
                  >
                    <option value="all">Any</option>
                    <option value="marla">Marla</option>
                    <option value="kanal">Kanal</option>
                    <option value="sq_ft">Sq ft</option>
                  </select>
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label htmlFor="filter-sort" className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Sort by
                </label>
                <select
                  id="filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
                  className="w-full px-3 py-2 border border-[#0F2A24]/20 text-sm bg-white outline-none focus:border-[#0F2A24]"
                >
                  <option value="newest">Newest listings</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between mb-6 text-xs text-[#51625C] tabular-nums">
            <p>
              Showing {paginated.length} of {filtered.length} properties
            </p>
            <p>
              Page {safePage} of {totalPages}
            </p>
          </div>

          {paginated.length === 0 ? (
            <div className="bg-white border border-[#0F2A24]/12 p-12 text-center">
              <p className="font-display text-2xl font-semibold text-[#0F2A24]">
                No properties match those filters.
              </p>
              <p className="text-sm text-[#51625C] mt-2 mb-6">
                Try clearing one or more filters or call {siteSettings.phoneDisplay} for off-market
                options in Sahiwal.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium"
              >
                Show all properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {paginated.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onQuickInquire={setQuickInquiryProperty}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#0F2A24]/20 text-xs font-medium text-[#0F2A24] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </button>
              <span className="text-xs text-[#51625C] tabular-nums px-2">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#0F2A24]/20 text-xs font-medium text-[#0F2A24] disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <QuickInquiryModal
        property={quickInquiryProperty}
        onClose={() => setQuickInquiryProperty(null)}
      />
    </>
  );
}
