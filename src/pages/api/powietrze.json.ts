import type { APIRoute } from 'astro';

export const prerender = false;

// Mysłowice — środek miasta
const MYS = { lat: 50.2074, lng: 19.1374 };

// Najbliższe stacje GIOŚ (Mysłowice nie mają własnej)
const GIOS_STACJE = [
  { id: 17318, nazwa: 'Katowice, ul. Dudy-Gracza', lat: 50.258483, lng: 19.036217 },
  { id: 837, nazwa: 'Sosnowiec, ul. Lubelska', lat: 50.285956, lng: 19.184399 },
  { id: 814, nazwa: 'Katowice, ul. Kossutha', lat: 50.264611, lng: 18.975028 },
  { id: 841, nazwa: 'Tychy, ul. Tołstoja', lat: 50.099903, lng: 18.990236 },
];

// Kolory indeksu GIOŚ wg poziomu (0–5)
const GIOS_KOLOR = ['#57b108', '#b0dd10', '#ffd911', '#e58100', '#e50000', '#990000'];

// Zgrubny prostokąt obejmujący Mysłowice (filtr czujników)
const BBOX = { latMin: 50.13, latMax: 50.29, lngMin: 19.05, lngMax: 19.30 };

function pick(o: any, ...keys: string[]) {
  if (!o) return undefined;
  const lower: Record<string, any> = {};
  for (const k of Object.keys(o)) lower[k.toLowerCase()] = o[k];
  for (const k of keys) if (lower[k.toLowerCase()] !== undefined) return lower[k.toLowerCase()];
  return undefined;
}
const liczba = (v: any): number | null => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

type Punkt = {
  zrodlo: 'GIOŚ' | 'Airly' | 'Syngeos' | 'LookO2';
  nazwa: string;
  lat: number;
  lng: number;
  indeks: string | null;
  kolor: string;
  pm10: number | null;
  pm25: number | null;
  url?: string;
};

async function pobierzGios(): Promise<Punkt[]> {
  const wyniki = await Promise.all(
    GIOS_STACJE.map(async (s) => {
      try {
        const r = await fetch(`https://api.gios.gov.pl/pjp-api/v1/rest/aqindex/getIndex/${s.id}`);
        if (!r.ok) throw new Error('http');
        const d: any = await r.json();
        const a = d.AqIndex || {};
        const lvl = a['Wartość indeksu'];
        const nazwa = a['Nazwa kategorii indeksu'] ?? null;
        const kolor = typeof lvl === 'number' && lvl >= 0 && lvl <= 5 ? GIOS_KOLOR[lvl] : '#9aa7b0';
        return {
          zrodlo: 'GIOŚ' as const,
          nazwa: s.nazwa,
          lat: s.lat,
          lng: s.lng,
          indeks: nazwa,
          kolor,
          pm10: null,
          pm25: null,
          url: `https://powietrze.gios.gov.pl/pjp/current/station_details/info/${s.id}`,
        };
      } catch {
        return {
          zrodlo: 'GIOŚ' as const, nazwa: s.nazwa, lat: s.lat, lng: s.lng,
          indeks: null, kolor: '#9aa7b0', pm10: null, pm25: null,
        };
      }
    })
  );
  return wyniki;
}

async function pobierzAirly(): Promise<Punkt[]> {
  const key = import.meta.env.AIRLY_API_KEY ?? process.env.AIRLY_API_KEY;
  if (!key) return [];
  const headers = { apikey: key, Accept: 'application/json' };
  try {
    const inst = await fetch(
      `https://airapi.airly.eu/v2/installations/nearest?lat=${MYS.lat}&lng=${MYS.lng}&maxDistanceKM=6&maxResults=12`,
      { headers }
    );
    if (!inst.ok) return [];
    const lista: any[] = await inst.json();
    const punkty = await Promise.all(
      lista.map(async (i) => {
        try {
          const m = await fetch(
            `https://airapi.airly.eu/v2/measurements/installation?installationId=${i.id}&indexType=AIRLY_CAQI`,
            { headers }
          );
          const md: any = await m.json();
          const cur = md.current || {};
          const idx = (cur.indexes || [])[0] || {};
          const val = (n: string) => {
            const v = (cur.values || []).find((x: any) => x.name === n);
            return v ? Math.round(v.value) : null;
          };
          const adr = i.address || {};
          return {
            zrodlo: 'Airly' as const,
            nazwa: [adr.street, adr.city].filter(Boolean).join(', ') || 'Czujnik Airly',
            lat: i.location.latitude,
            lng: i.location.longitude,
            indeks: idx.description ?? null,
            kolor: idx.color || '#9aa7b0',
            pm10: val('PM10'),
            pm25: val('PM25'),
            url: 'https://airly.org/map/pl/',
          };
        } catch {
          return null;
        }
      })
    );
    return punkty.filter(Boolean) as Punkt[];
  } catch {
    return [];
  }
}

async function pobierzSyngeos(): Promise<Punkt[]> {
  const key = import.meta.env.SYNGEOS_API_KEY ?? process.env.SYNGEOS_API_KEY;
  if (!key) return [];
  // Integracja Syngeos/ESA — do uzupełnienia po uzyskaniu dostępu/endpointu.
  return [];
}

async function pobierzLooko2(): Promise<Punkt[]> {
  const token = import.meta.env.LOOKO2_TOKEN ?? process.env.LOOKO2_TOKEN;
  if (!token) return [];
  try {
    const r = await fetch(`http://api.looko2.com/?method=GetAll&token=${token}`);
    if (!r.ok) return [];
    const arr: any[] = await r.json();
    if (!Array.isArray(arr)) return [];
    const out: Punkt[] = [];
    for (const d of arr) {
      const lat = liczba(pick(d, 'Lat', 'Latitude', 'lat'));
      const lng = liczba(pick(d, 'Lon', 'Lng', 'Longitude', 'lon'));
      if (lat == null || lng == null) continue;
      if (lat < BBOX.latMin || lat > BBOX.latMax || lng < BBOX.lngMin || lng > BBOX.lngMax) continue;
      const ijp = liczba(pick(d, 'IJP'));
      const kolor = pick(d, 'Color', 'Kolor') ||
        (ijp != null && ijp >= 0 && ijp <= 5 ? GIOS_KOLOR[ijp] : '#9aa7b0');
      out.push({
        zrodlo: 'LookO2',
        nazwa: String(pick(d, 'Name', 'Device') || 'Czujnik LookO2'),
        lat, lng,
        indeks: (pick(d, 'IJPString', 'IJPDescription') as string) ?? null,
        kolor,
        pm10: liczba(pick(d, 'PM10')),
        pm25: liczba(pick(d, 'PM25', 'PM2.5')),
        url: 'https://looko2.com/',
      });
    }
    return out;
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  const [gios, airly, syngeos, looko2] = await Promise.all([
    pobierzGios(),
    pobierzAirly(),
    pobierzSyngeos(),
    pobierzLooko2(),
  ]);
  const punkty = [...gios, ...airly, ...syngeos, ...looko2];
  return new Response(JSON.stringify({ punkty, czas: '' }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // CDN cache 1h, odświeżanie w tle — chroni limity API (np. Airly 100/dobę)
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
};
