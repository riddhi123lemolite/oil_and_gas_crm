// Realistic Indian data pools used by the seed generator.

export const FIRST_NAMES = [
  'Rajesh', 'Amit', 'Priya', 'Sunil', 'Vikram', 'Anjali', 'Deepak', 'Kavita',
  'Suresh', 'Neha', 'Manoj', 'Pooja', 'Arvind', 'Sneha', 'Ramesh', 'Divya',
  'Sanjay', 'Meena', 'Harish', 'Rekha', 'Naveen', 'Anita', 'Praveen', 'Shweta',
  'Gopal', 'Lakshmi', 'Mahesh', 'Geeta', 'Yogesh', 'Nisha', 'Kiran', 'Asha',
  'Jagdish', 'Sunita', 'Dinesh', 'Madhuri', 'Ashok', 'Pallavi', 'Vinod', 'Ritu',
  'Karan', 'Simran', 'Jaspreet', 'Gurpreet', 'Murugan', 'Lakshmanan', 'Venkat',
  'Srinivas', 'Bhavesh', 'Hardik', 'Chetan', 'Jignesh', 'Paresh', 'Tushar',
];

export const LAST_NAMES = [
  'Patel', 'Sharma', 'Shah', 'Mehta', 'Desai', 'Iyer', 'Reddy', 'Nair',
  'Gupta', 'Singh', 'Kumar', 'Verma', 'Joshi', 'Rao', 'Pillai', 'Menon',
  'Agarwal', 'Trivedi', 'Chauhan', 'Bhatt', 'Pandey', 'Mishra', 'Naidu',
  'Chowdhury', 'Banerjee', 'Mukherjee', 'Das', 'Kulkarni', 'Deshmukh', 'Jain',
  'Malhotra', 'Kapoor', 'Bose', 'Pawar', 'Sethi', 'Goyal', 'Saxena', 'Thakkar',
];

export const COMPANY_PREFIX = [
  'Shree Krishna', 'Shree Ganesh', 'Annapurna', 'Maruti', 'Bharat', 'Reliance',
  'Krishna', 'Patel', 'Jai Hind', 'Om Sai', 'Balaji', 'Ganpati', 'Sai Ram',
  'Shiv Shakti', 'Laxmi', 'Surya', 'Gokul', 'Hari Om', 'Tirupati', 'Vishnu',
  'Adani', 'Sterling', 'National', 'Western', 'Eastern', 'Deccan', 'Capital',
  'Premier', 'Unique', 'Royal', 'Apex', 'Pioneer', 'Universal', 'Galaxy',
];

export const COMPANY_TYPE = [
  'Petroleum', 'Petrochemicals', 'Lubricants', 'Polymers', 'Solvents',
  'Energy Solutions', 'Chemicals', 'Trading Co.', 'Industries', 'Enterprises',
  'Transport Lines', 'Logistics', 'Distributors', 'Agencies', 'Oils & Fats',
  'Plastics', 'Resins', 'Petro Products', 'Fuels', 'Specialities',
];

export const COMPANY_SUFFIX = ['Pvt Ltd', 'Pvt Ltd', 'Ltd', 'LLP', '& Co.', ''];

export const CITIES: { city: string; state: string; pincode: string }[] = [
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
  { city: 'Surat', state: 'Gujarat', pincode: '395003' },
  { city: 'Vadodara', state: 'Gujarat', pincode: '390007' },
  { city: 'Rajkot', state: 'Gujarat', pincode: '360001' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
  { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  { city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001' },
  { city: 'Raipur', state: 'Chhattisgarh', pincode: '492001' },
  { city: 'Ranchi', state: 'Jharkhand', pincode: '834001' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001' },
  { city: 'Kochi', state: 'Kerala', pincode: '682001' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
];

export const INDUSTRIES = [
  'Petroleum Trading', 'Transport & Logistics', 'Manufacturing', 'Textiles',
  'Plastics & Polymers', 'Paints & Coatings', 'Pharmaceuticals', 'Power & Energy',
  'Construction', 'Automobile', 'Agro Processing', 'Chemical Processing',
  'Petrol Pump / Retail Fuel', 'FMCG', 'Adhesives', 'Rubber Products',
];

export interface SeedItem {
  name: string;
  description: string;
  hsnCode: string;
  category: string;
  group: string;
  unit: string;
  minRate: number;
  maxRate: number;
  gst: number;
  spec: string;
}

export const ITEM_CATALOG: SeedItem[] = [
  { name: 'HSD BS-VI', description: 'High Speed Diesel — BS-VI grade', hsnCode: '27101931', category: 'OIL_FUEL', group: 'Diesel', unit: 'KL', minRate: 85000, maxRate: 98000, gst: 18, spec: 'BS-VI compliant, 10 PPM sulphur' },
  { name: 'HSD 10 PPM', description: 'High Speed Diesel — Low sulphur', hsnCode: '27101931', category: 'OIL_FUEL', group: 'Diesel', unit: 'KL', minRate: 86000, maxRate: 97000, gst: 18, spec: 'Ultra low sulphur diesel' },
  { name: 'Motor Spirit (Petrol)', description: 'MS — premium grade', hsnCode: '27101239', category: 'OIL_FUEL', group: 'Petrol', unit: 'KL', minRate: 90000, maxRate: 99000, gst: 18, spec: 'RON 91, BS-VI' },
  { name: 'LDO', description: 'Light Diesel Oil — industrial', hsnCode: '27101944', category: 'OIL_FUEL', group: 'Industrial Fuel', unit: 'KL', minRate: 72000, maxRate: 84000, gst: 18, spec: 'For industrial burners' },
  { name: 'Transformer Oil', description: 'Electrical grade transformer oil', hsnCode: '27101980', category: 'OIL_FUEL', group: 'Specialty Oil', unit: 'KL', minRate: 95000, maxRate: 130000, gst: 18, spec: 'IS 335, low pour point' },
  { name: 'Furnace Oil', description: 'Heavy fuel oil for furnaces', hsnCode: '27101950', category: 'OIL_FUEL', group: 'Industrial Fuel', unit: 'MT', minRate: 42000, maxRate: 54000, gst: 18, spec: 'Viscosity 180 cSt' },
  { name: 'Engine Oil 15W-40', description: 'Multigrade diesel engine oil', hsnCode: '27101981', category: 'LUBRICANT', group: 'Lubricants', unit: 'L', minRate: 220, maxRate: 420, gst: 18, spec: 'API CI-4, 15W-40' },
  { name: 'Gear Oil EP-90', description: 'Extreme pressure gear oil', hsnCode: '27101981', category: 'LUBRICANT', group: 'Lubricants', unit: 'L', minRate: 180, maxRate: 340, gst: 18, spec: 'API GL-5, EP-90' },
  { name: 'Hydraulic Oil 68', description: 'Anti-wear hydraulic oil', hsnCode: '27101981', category: 'LUBRICANT', group: 'Lubricants', unit: 'L', minRate: 200, maxRate: 380, gst: 18, spec: 'ISO VG 68' },
  { name: 'Industrial Lubricant Drum', description: 'Industrial grade — 210L drum', hsnCode: '27101981', category: 'LUBRICANT', group: 'Lubricants', unit: 'DRUM', minRate: 35000, maxRate: 120000, gst: 18, spec: '210 litre sealed drum' },
  { name: 'Greases — Lithium', description: 'Lithium complex grease', hsnCode: '27101981', category: 'LUBRICANT', group: 'Lubricants', unit: 'KG', minRate: 160, maxRate: 290, gst: 18, spec: 'NLGI Grade 3' },
  { name: 'MEG', description: 'Mono Ethylene Glycol — Industrial Grade', hsnCode: '29053100', category: 'GLYCOL', group: 'Glycols', unit: 'KG', minRate: 58, maxRate: 72, gst: 18, spec: 'Purity ≥ 99.8%, IS 12346' },
  { name: 'DEG', description: 'Di Ethylene Glycol', hsnCode: '29094100', category: 'GLYCOL', group: 'Glycols', unit: 'KG', minRate: 62, maxRate: 78, gst: 18, spec: 'Purity ≥ 99.5%' },
  { name: 'TEG', description: 'Tri Ethylene Glycol', hsnCode: '29094400', category: 'GLYCOL', group: 'Glycols', unit: 'KG', minRate: 85, maxRate: 105, gst: 18, spec: 'Purity ≥ 99.5%' },
  { name: 'Propylene Glycol', description: 'Mono Propylene Glycol — USP', hsnCode: '29053200', category: 'GLYCOL', group: 'Glycols', unit: 'KG', minRate: 95, maxRate: 135, gst: 18, spec: 'USP/IP grade' },
  { name: 'Toluene', description: 'Industrial solvent — Toluene', hsnCode: '29023000', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 65, maxRate: 88, gst: 18, spec: 'Purity ≥ 99.5%' },
  { name: 'Benzene', description: 'Aromatic solvent — Benzene', hsnCode: '29022000', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 55, maxRate: 78, gst: 18, spec: 'Purity ≥ 99.9%' },
  { name: 'Mixed Xylene', description: 'Mixed Xylene isomers', hsnCode: '29024400', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 70, maxRate: 92, gst: 18, spec: 'Industrial grade' },
  { name: 'MDC', description: 'Methylene Dichloride', hsnCode: '29031200', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 85, maxRate: 115, gst: 18, spec: 'Purity ≥ 99.9%' },
  { name: 'Acetone', description: 'Industrial solvent — Acetone', hsnCode: '29141100', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 72, maxRate: 98, gst: 18, spec: 'Purity ≥ 99.5%' },
  { name: 'IPA', description: 'Iso Propyl Alcohol', hsnCode: '29051220', category: 'SOLVENT', group: 'Solvents', unit: 'KG', minRate: 88, maxRate: 120, gst: 18, spec: 'Purity ≥ 99.7%' },
  { name: 'HDPE Reprocessed', description: 'HDPE granules — reprocessed', hsnCode: '39012000', category: 'PLASTIC_GRANULE', group: 'Granules', unit: 'MT', minRate: 78000, maxRate: 105000, gst: 18, spec: 'Blow grade, reprocessed' },
  { name: 'HDPE Virgin 5502', description: 'HDPE Blow 5502 — virgin', hsnCode: '39012000', category: 'PLASTIC_GRANULE', group: 'Granules', unit: 'MT', minRate: 95000, maxRate: 125000, gst: 18, spec: 'Blow grade 5502, virgin' },
  { name: 'LDPE Virgin 1020', description: 'LDPE 1020 — virgin', hsnCode: '39011010', category: 'PLASTIC_GRANULE', group: 'Granules', unit: 'MT', minRate: 110000, maxRate: 140000, gst: 18, spec: 'Film grade 1020' },
  { name: 'PP H110MA', description: 'Polypropylene H110MA', hsnCode: '39021000', category: 'PLASTIC_GRANULE', group: 'Granules', unit: 'MT', minRate: 95000, maxRate: 118000, gst: 18, spec: 'Homopolymer, injection' },
  { name: 'LLDPE', description: 'Linear Low Density Polyethylene', hsnCode: '39014010', category: 'PLASTIC_GRANULE', group: 'Granules', unit: 'MT', minRate: 98000, maxRate: 122000, gst: 18, spec: 'Film grade' },
  { name: 'LAB SA', description: 'Linear Alkyl Benzene — Sulphonic Acid', hsnCode: '34021100', category: 'SPECIALTY', group: 'Specialty Chemicals', unit: 'KG', minRate: 72, maxRate: 95, gst: 18, spec: 'Active matter ≥ 96%' },
  { name: 'Unsaturated Polyester Resin', description: 'UPR — general purpose', hsnCode: '39073100', category: 'SPECIALTY', group: 'Specialty Chemicals', unit: 'MT', minRate: 105000, maxRate: 140000, gst: 18, spec: 'GP grade, orthophthalic' },
  { name: 'White Oil', description: 'Light liquid paraffin — pharma', hsnCode: '27101990', category: 'SPECIALTY', group: 'Specialty Chemicals', unit: 'KG', minRate: 110, maxRate: 165, gst: 18, spec: 'IP/USP grade' },
  { name: 'Wax — Paraffin', description: 'Fully refined paraffin wax', hsnCode: '27122090', category: 'SPECIALTY', group: 'Specialty Chemicals', unit: 'KG', minRate: 95, maxRate: 145, gst: 18, spec: 'Melting point 58-60°C' },
];

export const WAREHOUSES = [
  'Hazira Terminal, Surat',
  'Kandla Depot, Gujarat',
  'JNPT Warehouse, Navi Mumbai',
  'Ennore Terminal, Chennai',
  'Vizag Storage, Andhra Pradesh',
];

export const CARRIERS = [
  'Maruti Transport',
  'Bharat Roadlines',
  'Patel Cargo Movers',
  'Shree Logistics',
  'Western Tanker Services',
  'Deccan Carriers',
  'Highway Petro Logistics',
];

export const LOST_REASONS = [
  'Price too high',
  'Lost to competitor',
  'Budget not approved',
  'Project on hold',
  'No requirement currently',
  'Credit terms not agreeable',
  'Quality concerns',
];

export const TASK_TITLES = [
  'Follow up on pending quotation',
  'Call to confirm tanker dispatch',
  'Send updated price list',
  'Collect outstanding payment',
  'Site visit for new enquiry',
  'Negotiate freight charges',
  'Share GST invoice copy',
  'Verify GSTIN details',
  'Discuss bulk order requirement',
  'Arrange product sample dispatch',
  'Reconcile customer ledger',
  'Schedule meeting with procurement head',
];
