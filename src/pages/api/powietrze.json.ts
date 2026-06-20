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

type Punkt = {
  zrodlo: 'GIOŚ' | 'Airly' | 'Syngeos';
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

export const GET: APIRoute = async () => {
  const [gios, airly, syngeos] = await Promise.all([
    pobierzGios(),
    pobierzAirly(),
    pobierzSyngeos(),
  ]);
  const punkty = [...gios, ...airly, ...syngeos];
  return new Response(JSON.stringify({ punkty, czas: '' }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // CDN cache 1h, odświeżanie w tle — chroni limity API (np. Airly 100/dobę)
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
};
