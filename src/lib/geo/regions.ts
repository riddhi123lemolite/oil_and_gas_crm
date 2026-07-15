// ============================================================================
// Geographic groupings for the India analytics module.
//
// The choropleth geometry (public/geo/india-states.geo.json) already uses
// modern state names that match the CRM's own state strings (see
// INDIAN_STATES in lib/constants). A small alias map guards against a few
// legacy spellings so live/imported data still lines up with the map.
// ============================================================================

export type Region =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central'
  | 'Northeast';

export const REGIONS: Region[] = [
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Northeast',
];

/** Every state/UT present in the map geometry, grouped by sales region. */
export const REGION_BY_STATE: Record<string, Region> = {
  // North
  Delhi: 'North',
  Haryana: 'North',
  Punjab: 'North',
  'Himachal Pradesh': 'North',
  Uttarakhand: 'North',
  'Uttar Pradesh': 'North',
  Rajasthan: 'North',
  'Jammu and Kashmir': 'North',
  Ladakh: 'North',
  Chandigarh: 'North',
  // West
  Gujarat: 'West',
  Maharashtra: 'West',
  Goa: 'West',
  'Dadra and Nagar Haveli and Daman and Diu': 'West',
  // Central
  'Madhya Pradesh': 'Central',
  Chhattisgarh: 'Central',
  // South
  Karnataka: 'South',
  Kerala: 'South',
  'Tamil Nadu': 'South',
  Telangana: 'South',
  'Andhra Pradesh': 'South',
  Puducherry: 'South',
  Lakshadweep: 'South',
  'Andaman and Nicobar Islands': 'South',
  // East
  'West Bengal': 'East',
  Bihar: 'East',
  Jharkhand: 'East',
  Odisha: 'East',
  Sikkim: 'East',
  // Northeast
  Assam: 'Northeast',
  Meghalaya: 'Northeast',
  Manipur: 'Northeast',
  Mizoram: 'Northeast',
  Nagaland: 'Northeast',
  Tripura: 'Northeast',
  'Arunachal Pradesh': 'Northeast',
};

/** Legacy → canonical spellings, so older data still maps to the geometry. */
const STATE_ALIASES: Record<string, string> = {
  Orissa: 'Odisha',
  Pondicherry: 'Puducherry',
  Uttaranchal: 'Uttarakhand',
  'NCT of Delhi': 'Delhi',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Tamilnadu': 'Tamil Nadu',
};

/** Resolve any incoming state string to the name used by the map geometry. */
export function normalizeStateName(raw: string): string {
  const trimmed = raw?.trim() ?? '';
  return STATE_ALIASES[trimmed] ?? trimmed;
}

export function regionOf(state: string): Region | undefined {
  return REGION_BY_STATE[normalizeStateName(state)];
}
