import { useState } from 'react';
import { ExternalLink, MapPin, Search } from 'lucide-react';
import { sanitizeSafeHref } from '../lib/formatters.ts';
import type { MapsGroundingPlace } from '../types/domain.ts';

interface NeighborhoodExplorerProps {
  areaLabel: string;
  latitude?: number | null;
  longitude?: number | null;
}

const PRESET_QUERIES = [
  'Schools, colleges, and parks nearby',
  'Hospitals, pharmacies, and clinics nearby',
  'Main roads, shopping, and daily conveniences nearby',
];

export function NeighborhoodExplorer({
  areaLabel,
  latitude,
  longitude,
}: NeighborhoodExplorerProps) {
  const [queryText, setQueryText] = useState(PRESET_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [places, setPlaces] = useState<MapsGroundingPlace[]>([]);
  const [error, setError] = useState('');

  const runSearch = async (customQuery?: string) => {
    const q = (customQuery ?? queryText).trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${q} around ${areaLabel}`,
          latitude: latitude ?? 30.6682,
          longitude: longitude ?? 73.1114,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Could not retrieve Google Maps neighborhood details.');
      }
      setSummary(json.summary || '');
      setPlaces(Array.isArray(json.places) ? json.places : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach neighborhood service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#0F2A24]/15 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0F2A24]/10">
        <div>
          <h3 className="font-display text-2xl font-semibold text-[#0F2A24]">
            Neighborhood &amp; Local Amenities
          </h3>
          <p className="text-xs text-[#51625C] mt-1">
            Live place context around {areaLabel} powered by Google Maps data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] disabled:opacity-60 transition-colors whitespace-nowrap min-h-[40px]"
        >
          <MapPin className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
          <span>{loading ? 'Checking Google Maps...' : 'Check nearby places'}</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setQueryText(preset);
              runSearch(preset);
            }}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              queryText === preset
                ? 'border-[#0F2A24] bg-[#0F2A24]/5 text-[#0F2A24] font-medium'
                : 'border-[#0F2A24]/15 text-[#51625C] hover:border-[#0F2A24]/40'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Ask about nearby landmarks, roads, or facilities..."
          aria-label="Neighborhood search query"
          className="flex-1 px-3.5 py-2 border border-[#0F2A24]/20 text-sm text-[#0F2A24] outline-none focus:border-[#0F2A24]"
        />
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading}
          aria-label="Search neighborhood"
          className="px-4 py-2 border border-[#0F2A24]/20 text-[#0F2A24] hover:border-[#0F2A24] inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Search</span>
        </button>
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-5 pt-4 border-t border-[#0F2A24]/10 space-y-4">
          <p className="text-sm text-[#51625C] leading-relaxed whitespace-pre-line">{summary}</p>

          {places.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#0F2A24] mb-2">
                Referenced Google Maps locations
              </p>
              <ul className="divide-y divide-[#0F2A24]/10 border border-[#0F2A24]/10">
                {places.map((place, idx) => (
                  <li key={`${place.uri}-${idx}`} className="p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#0F2A24]">{place.title}</p>
                      {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                        <p className="text-xs text-[#51625C] mt-1">{place.reviewSnippets[0]}</p>
                      )}
                    </div>
                    <a
                      href={sanitizeSafeHref(place.uri)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#B38B52] hover:underline whitespace-nowrap shrink-0"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
