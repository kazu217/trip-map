import { googleMapsApiKeyForPlatform } from './appConfig';

export type Coordinates = {
  lat: number;
  lng: number;
};

type GoogleGeocodeResponse = {
  status?: string;
  results?: Array<{
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
};

type NominatimResponse = Array<{
  lat?: string;
  lon?: string;
}>;

export type GeocodeContext = {
  destination?: string;
  name?: string;
  countryCode?: string;
};

type GeocodeContextInput = string | GeocodeContext;

const japanesePlaceReplacements: Array<[RegExp, string]> = [
  [/ライロ\s*クライストチャーチ(?:[・\s]*エアポート)?/g, 'Lylo Christchurch Airport'],
  [/クライストチャーチ(?:[・\s]*エアポート|空港)/g, 'Christchurch Airport'],
  [/クライストチャーチ/g, 'Christchurch'],
  [/レイク[\s・]*テカポ/g, 'Lake Tekapo'],
  [/テカポ湖/g, 'Lake Tekapo'],
  [/カンタベリー(?:地方|州)?/g, 'Canterbury'],
  [/ニュージーランド/g, 'New Zealand'],
  [/クイーンズタウン/g, 'Queenstown'],
  [/ミルフォード(?:[・\s]*サウンド)?/g, 'Milford Sound'],
  [/オークランド/g, 'Auckland'],
  [/ウェリントン/g, 'Wellington'],
  [/シドニー/g, 'Sydney'],
  [/メルボルン/g, 'Melbourne'],
  [/オーストラリア/g, 'Australia'],
  [/日本/g, 'Japan']
];

const countryCodeHints: Array<[RegExp, string]> = [
  [/(New Zealand|ニュージーランド|Christchurch|Queenstown|Milford Sound|Auckland|Wellington)/i, 'nz'],
  [/(Australia|オーストラリア|Sydney|Melbourne)/i, 'au'],
  [/(Japan|日本|Tokyo|Osaka|Kyoto|北海道|東京|大阪|京都)/i, 'jp']
];

const normalizeSearchText = (value: string) => {
  let normalized = value
    .normalize('NFKC')
    .replace(/\bnew\s*zealand\b/gi, 'New Zealand')
    .replace(/\baotearoa\b/gi, 'New Zealand')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/[、，]/g, ',')
    .replace(/[／/]/g, ', ');

  for (const [pattern, replacement] of japanesePlaceReplacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/[・]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^,\s*/, '')
    .replace(/,\s*$/, '')
    .trim();
};

const removePostalCode = (value: string) =>
  value
    .replace(/(?:^|[\s,])\d{4,6}(?=$|[\s,])/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();

const keepLatinAddressParts = (value: string) =>
  value
    .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();

const normalizeContext = (context?: GeocodeContextInput): GeocodeContext => {
  if (!context) return {};
  if (typeof context === 'string') return { destination: context };
  return context;
};

const addCandidate = (candidates: string[], seen: Set<string>, value?: string) => {
  const normalized = value?.trim();
  if (!normalized) return;

  const key = normalized.toLowerCase();
  if (seen.has(key)) return;

  seen.add(key);
  candidates.push(normalized);
};

const addCandidateParts = (candidates: string[], seen: Set<string>, parts: Array<string | undefined>) => {
  addCandidate(candidates, seen, parts.filter(Boolean).join(', '));
};

const inferCountryCode = (query: string, explicitCountryCode?: string) => {
  if (explicitCountryCode) return explicitCountryCode.toLowerCase();

  for (const [pattern, countryCode] of countryCodeHints) {
    if (pattern.test(query)) return countryCode;
  }

  return undefined;
};

const queryCandidates = (address: string, contextInput?: GeocodeContextInput) => {
  const context = normalizeContext(contextInput);
  const trimmedAddress = address.trim();
  const trimmedName = context.name?.trim();
  const trimmedDestination = context.destination?.trim();
  const normalizedAddress = normalizeSearchText(trimmedAddress);
  const normalizedName = trimmedName ? normalizeSearchText(trimmedName) : undefined;
  const normalizedDestination = trimmedDestination ? normalizeSearchText(trimmedDestination) : undefined;
  const latinAddress = keepLatinAddressParts(normalizedAddress);
  const latinName = normalizedName ? keepLatinAddressParts(normalizedName) : undefined;
  const latinDestination = normalizedDestination ? keepLatinAddressParts(normalizedDestination) : undefined;
  const candidates: string[] = [];
  const seen = new Set<string>();

  addCandidate(candidates, seen, trimmedAddress);
  addCandidate(candidates, seen, normalizedAddress);
  addCandidate(candidates, seen, removePostalCode(normalizedAddress));
  addCandidate(candidates, seen, latinAddress);
  addCandidate(candidates, seen, removePostalCode(latinAddress));
  addCandidateParts(candidates, seen, [trimmedName, trimmedAddress]);
  addCandidateParts(candidates, seen, [normalizedName, normalizedAddress]);
  addCandidateParts(candidates, seen, [normalizedName, removePostalCode(normalizedAddress)]);
  addCandidateParts(candidates, seen, [latinName, latinAddress]);
  addCandidateParts(candidates, seen, [latinName, removePostalCode(latinAddress)]);
  addCandidateParts(candidates, seen, [trimmedAddress, trimmedDestination]);
  addCandidateParts(candidates, seen, [normalizedAddress, normalizedDestination]);
  addCandidateParts(candidates, seen, [removePostalCode(normalizedAddress), normalizedDestination]);
  addCandidateParts(candidates, seen, [latinAddress, latinDestination]);
  addCandidateParts(candidates, seen, [removePostalCode(latinAddress), latinDestination]);
  addCandidateParts(candidates, seen, [trimmedName, trimmedDestination]);
  addCandidateParts(candidates, seen, [normalizedName, normalizedDestination]);
  addCandidateParts(candidates, seen, [latinName, latinDestination]);

  return candidates;
};

export const geocodeAddress = async (address: string, context?: GeocodeContextInput): Promise<Coordinates | null> => {
  if (!address.trim()) return null;

  const geocodeContext = normalizeContext(context);
  for (const query of queryCandidates(address, geocodeContext)) {
    const countryCode = inferCountryCode(query, geocodeContext.countryCode);
    const googleResult = await geocodeWithGoogle(query, countryCode);
    if (googleResult) return googleResult;

    const fallbackResult = await geocodeWithNominatim(query, countryCode);
    if (fallbackResult) return fallbackResult;
  }

  return null;
};

const geocodeWithGoogle = async (query: string, countryCode?: string): Promise<Coordinates | null> => {
  const apiKey = googleMapsApiKeyForPlatform();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    address: query,
    key: apiKey,
    language: 'ja'
  });
  if (countryCode) params.set('region', countryCode);

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
    if (!response.ok) return null;
    const data = (await response.json()) as GoogleGeocodeResponse;
    const location = data.results?.[0]?.geometry?.location;
    const lat = location?.lat;
    const lng = location?.lng;
    if (data.status === 'OK' && typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  } catch {
    return null;
  }

  return null;
};

const geocodeWithNominatim = async (query: string, countryCode?: string): Promise<Coordinates | null> => {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    addressdetails: '1'
  });
  if (countryCode) params.set('countrycodes', countryCode);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en,ja;q=0.8',
        'User-Agent': 'TripMap/1.0 geocoding'
      }
    });
    if (!response.ok) return null;
    const data = (await response.json()) as NominatimResponse;
    const first = data[0];
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  } catch {
    return null;
  }

  return null;
};
