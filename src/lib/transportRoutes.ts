import type { TransportRoute } from '@/types';

// ---------------------------------------------------------------------------
// Transport-route reference data by country.
//
// India (IN) is driven by the live store (seeded + user-added routes). Every
// other country ships a curated set of real oil & gas haulage corridors so the
// Transport Routes page can showcase the network market-by-market.
// ---------------------------------------------------------------------------

export interface RouteCountry {
  code: string;
  name: string;
  flag: string;
}

export const ROUTE_COUNTRIES: RouteCountry[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

// [from, to, distanceKm, carrier, baseRent, perKmRate, active?]
type Row = [string, string, number, string, number, number, boolean?];

const build = (code: string, rows: Row[]): TransportRoute[] =>
  rows.map(([from, to, distanceKm, carrier, baseRent, perKmRate, active], i) => ({
    id: `intl_${code}_${i + 1}`,
    fromLocation: from,
    toLocation: to,
    distanceKm,
    carrier,
    baseRent,
    perKmRate,
    active: active ?? true,
  }));

export const INTERNATIONAL_ROUTES: Record<string, TransportRoute[]> = {
  AE: build('AE', [
    ['Jebel Ali Port', 'Abu Dhabi', 140, 'Emirates Bulk Logistics', 6800, 62],
    ['Fujairah Oil Terminal', 'Dubai', 130, 'Gulf Tankers LLC', 6400, 60],
    ['Ruwais Refinery', 'Abu Dhabi', 240, 'ADNOC Distribution', 9800, 55],
    ['Sharjah', 'Al Ain', 160, 'Sharjah Freight Co', 5200, 48],
    ['Dubai', 'Fujairah', 130, 'Emirates Bulk Logistics', 6100, 58, false],
  ]),
  SA: build('SA', [
    ['Ras Tanura', 'Dammam', 75, 'Aramco Logistics', 4200, 52],
    ['Jubail', 'Riyadh', 420, 'Bahri Transport', 14500, 46],
    ['Yanbu', 'Jeddah', 350, 'Red Sea Carriers', 12800, 44],
    ['Riyadh', 'Dammam', 400, 'Saudi Bulk Transport', 13600, 45],
    ['Jeddah', 'Makkah', 80, 'Al Mawarid Transport', 4600, 50],
  ]),
  QA: build('QA', [
    ['Ras Laffan', 'Doha', 80, 'Qatar Fuel (WOQOD)', 4300, 54],
    ['Mesaieed', 'Doha', 45, 'Milaha Logistics', 3100, 58],
    ['Doha', 'Al Khor', 55, 'Gulf Warehousing', 3400, 52],
    ['Ras Laffan', 'Mesaieed', 120, 'Qatar Navigation', 5600, 50],
  ]),
  KW: build('KW', [
    ['Mina Al Ahmadi', 'Kuwait City', 40, 'KOTC Transport', 3000, 60],
    ['Shuaiba', 'Ahmadi', 25, 'Kuwait Bulk Carriers', 2400, 64],
    ['Kuwait City', 'Jahra', 32, 'Gulf Petro Logistics', 2700, 58],
    ['Ahmadi', 'Kuwait City', 38, 'KOTC Transport', 2900, 60],
  ]),
  OM: build('OM', [
    ['Sohar Port', 'Muscat', 230, 'Oman Oil Transport', 9200, 47],
    ['Muscat', 'Duqm', 550, 'Salalah Freight', 17800, 42],
    ['Salalah', 'Duqm', 380, 'Oman Logistics Co', 13200, 43],
    ['Sohar', 'Al Buraimi', 250, 'Al Madina Logistics', 9600, 46, false],
  ]),
  BH: build('BH', [
    ['Sitra Refinery', 'Manama', 15, 'Bapco Transport', 1900, 66],
    ['Manama', 'Awali', 25, 'Gulf Bahrain Logistics', 2300, 62],
    ['Sitra', 'Hidd', 20, 'Bahrain Bulk Co', 2100, 64],
  ]),
  US: build('US', [
    ['Houston, TX', 'Cushing, OK', 780, 'Gulf Coast Carriers', 28500, 38],
    ['Corpus Christi, TX', 'Houston, TX', 340, 'Lone Star Freight', 15200, 41],
    ['Port Arthur, TX', 'Dallas, TX', 460, 'American Bulk Transport', 18600, 40],
    ['Cushing, OK', 'Chicago, IL', 1200, 'Midwest Pipeline Logistics', 39800, 35],
    ['New Orleans, LA', 'Houston, TX', 560, 'Delta Tanker Lines', 21400, 39],
  ]),
  GB: build('GB', [
    ['Southampton', 'London', 130, 'Thames Fuel Logistics', 7400, 56],
    ['Grangemouth', 'Glasgow', 40, 'Scottish Bulk Carriers', 3600, 60],
    ['Immingham', 'Leeds', 110, 'Humber Freight Co', 6800, 54],
    ['Aberdeen', 'Edinburgh', 210, 'North Sea Logistics', 9400, 50],
    ['Fawley Refinery', 'Birmingham', 210, 'Midlands Tanker Transport', 9600, 51],
  ]),
  CA: build('CA', [
    ['Edmonton, AB', 'Hardisty, AB', 200, 'Prairie Bulk Transport', 9000, 44],
    ['Sarnia, ON', 'Toronto, ON', 290, 'Great Lakes Carriers', 11800, 43],
    ['Hardisty, AB', 'Vancouver, BC', 1150, 'Rocky Mountain Freight', 38200, 34],
    ['Edmonton, AB', 'Calgary, AB', 300, 'AltaFuel Logistics', 12100, 42],
  ]),
};
