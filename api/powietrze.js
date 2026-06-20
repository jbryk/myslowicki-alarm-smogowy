// Natywna funkcja serverless Vercela: /api/powietrze
// Agreguje jakość powietrza: GIOŚ (bez klucza) + Airly + LookO2 + Syngeos (env-key).

const MYS = { lat: 50.2074, lng: 19.1374 };
const BBOX = { latMin: 50.13, latMax: 50.29, lngMin: 19.05, lngMax: 19.30 };

const GIOS_STACJE = [
  { id: 17318, nazwa: 'Katowice, ul. Dudy-Gracza', lat: 50.258483, lng: 19.036217 },
  { id: 837, nazwa: 'Sosnowiec, ul. Lubelska', lat: 50.285956, lng: 19.184399 },
  { id: 814, nazwa: 'Katowice, ul. Kossutha', lat: 50.264611, lng: 18.975028 },
  { id: 841, nazwa: 'Tychy, ul. Tołstoja', lat: 50.099903, lng: 18.990236 },
];
const GIOS_KOLOR = ['#57b108', '#b0dd10', '#ffd911', '#e58100', '#e50000', '#990000'];

function pick(o, ...keys) {
  if (!o) return undefined;
  const lower = {};
  for (const k of Object.keys(o)) lower[k.toLowerCase()] = o[k];
  for (const k of keys) if (lower[k.toLowerCase()] !== undefined) return lower[k.toLowerCase()];
  return undefined;
}
const liczba = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Indeks jakości powietrza z poziomów pyłów (progi GIOŚ)
function indeksZPylow(pm10, pm25) {
  const l10 = pm10 == null ? -1 : pm10 <= 20 ? 0 : pm10 <= 50 ? 1 : pm10 <= 80 ? 2 : pm10 <= 110 ? 3 : pm10 <= 150 ? 4 : 5;
  const l25 = pm25 == null ? -1 : pm25 <= 13 ? 0 : pm25 <= 35 ? 1 : pm25 <= 55 ? 2 : pm25 <= 75 ? 3 : pm25 <= 110 ? 4 : 5;
  const lvl = Math.max(l10, l25);
  const nazwy = ['bardzo dobry', 'dobry', 'umiarkowany', 'dostateczny', 'zły', 'bardzo zły'];
  return lvl < 0 ? { kolor: '#9aa7b0', nazwa: null } : { kolor: GIOS_KOLOR[lvl], nazwa: nazwy[lvl] };
}

async function pobierzGios() {
  return Promise.all(
    GIOS_STACJE.map(async (s) => {
      try {
        const r = await fetch(`https://api.gios.gov.pl/pjp-api/v1/rest/aqindex/getIndex/${s.id}`);
        if (!r.ok) throw new Error('http');
        const d = await r.json();
        const a = d.AqIndex || {};
        const lvl = a['Wartość indeksu'];
        const kolor = typeof lvl === 'number' && lvl >= 0 && lvl <= 5 ? GIOS_KOLOR[lvl] : '#9aa7b0';
        return {
          zrodlo: 'GIOŚ', nazwa: s.nazwa, lat: s.lat, lng: s.lng,
          indeks: a['Nazwa kategorii indeksu'] ?? null, kolor, pm10: null, pm25: null,
          url: `https://powietrze.gios.gov.pl/pjp/current/station_details/info/${s.id}`,
        };
      } catch {
        return { zrodlo: 'GIOŚ', nazwa: s.nazwa, lat: s.lat, lng: s.lng, indeks: null, kolor: '#9aa7b0', pm10: null, pm25: null };
      }
    })
  );
}

async function pobierzAirly() {
  const key = process.env.AIRLY_API_KEY;
  if (!key) return [];
  const headers = { apikey: key, Accept: 'application/json' };
  try {
    const inst = await fetch(
      `https://airapi.airly.eu/v2/installations/nearest?lat=${MYS.lat}&lng=${MYS.lng}&maxDistanceKM=6&maxResults=12`,
      { headers }
    );
    if (!inst.ok) return [];
    const lista = await inst.json();
    const punkty = await Promise.all(
      lista.map(async (i) => {
        try {
          const m = await fetch(
            `https://airapi.airly.eu/v2/measurements/installation?installationId=${i.id}&indexType=AIRLY_CAQI`,
            { headers }
          );
          const md = await m.json();
          const cur = md.current || {};
          const idx = (cur.indexes || [])[0] || {};
          const val = (n) => {
            const v = (cur.values || []).find((x) => x.name === n);
            return v ? Math.round(v.value) : null;
          };
          const adr = i.address || {};
          return {
            zrodlo: 'Airly',
            nazwa: [adr.street, adr.city].filter(Boolean).join(', ') || 'Czujnik Airly',
            lat: i.location.latitude, lng: i.location.longitude,
            indeks: idx.description ?? null, kolor: idx.color || '#9aa7b0',
            pm10: val('PM10'), pm25: val('PM25'), url: 'https://airly.org/map/pl/',
          };
        } catch { return null; }
      })
    );
    return punkty.filter(Boolean);
  } catch { return []; }
}

async function pobierzLooko2() {
  const token = process.env.LOOKO2_TOKEN;
  if (!token) return [];
  try {
    const r = await fetch(`http://api.looko2.com/?method=GetAll&token=${token}`);
    if (!r.ok) return [];
    const arr = await r.json();
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const d of arr) {
      const lat = liczba(pick(d, 'Lat', 'Latitude', 'lat'));
      const lng = liczba(pick(d, 'Lon', 'Lng', 'Longitude', 'lon'));
      if (lat == null || lng == null) continue;
      if (lat < BBOX.latMin || lat > BBOX.latMax || lng < BBOX.lngMin || lng > BBOX.lngMax) continue;
      const ijp = liczba(pick(d, 'IJP'));
      const kolor = pick(d, 'Color', 'Kolor') || (ijp != null && ijp >= 0 && ijp <= 5 ? GIOS_KOLOR[ijp] : '#9aa7b0');
      out.push({
        zrodlo: 'LookO2', nazwa: String(pick(d, 'Name', 'Device') || 'Czujnik LookO2'),
        lat, lng, indeks: pick(d, 'IJPString', 'IJPDescription') ?? null, kolor,
        pm10: liczba(pick(d, 'PM10')), pm25: liczba(pick(d, 'PM25', 'PM2.5')), url: 'https://looko2.com/',
      });
    }
    return out;
  } catch { return []; }
}

// Syngeos — publiczny (nieoficjalny) endpoint, bez klucza
async function pobierzSyngeos() {
  try {
    const list = await fetch('https://api.syngeos.pl/api/public/devices');
    if (!list.ok) return [];
    const arr = await list.json();
    if (!Array.isArray(arr)) return [];
    const inBox = arr
      .filter((o) => {
        const c = o.coordinates;
        return Array.isArray(c) && c.length === 2 &&
          c[0] >= BBOX.latMin && c[0] <= BBOX.latMax && c[1] >= BBOX.lngMin && c[1] <= BBOX.lngMax;
      })
      .slice(0, 12);
    const punkty = await Promise.all(
      inBox.map(async (dev) => {
        try {
          const r = await fetch(`https://api.syngeos.pl/api/public/data/device/${dev.id}`);
          const d = await r.json();
          if (!d || !Array.isArray(d.sensors)) return null;
          const val = (name) => {
            const s = d.sensors.find((x) => x.name === name);
            const v = s && s.data && s.data[0] ? s.data[0].value : null;
            return typeof v === 'number' ? Math.round(v) : null;
          };
          const pm10 = val('pm10');
          const pm25 = val('pm2_5');
          const idx = indeksZPylow(pm10, pm25);
          return {
            zrodlo: 'Syngeos',
            nazwa: [d.address, d.city].filter(Boolean).join(', ') || 'Czujnik Syngeos',
            lat: d.coordinates[0], lng: d.coordinates[1],
            indeks: idx.nazwa, kolor: idx.kolor, pm10, pm25,
            url: 'https://panel.syngeos.pl/',
          };
        } catch { return null; }
      })
    );
    return punkty.filter(Boolean);
  } catch { return []; }
}

export default async function handler(req, res) {
  const [gios, airly, looko2, syngeos] = await Promise.all([
    pobierzGios(), pobierzAirly(), pobierzLooko2(), pobierzSyngeos(),
  ]);
  const punkty = [...gios, ...airly, ...looko2, ...syngeos];
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(JSON.stringify({ punkty }));
}
