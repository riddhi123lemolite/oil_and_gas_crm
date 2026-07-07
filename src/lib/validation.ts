import { z } from 'zod';

// Indian format validators.
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX = /^(\+91[\s-]?)?[6-9][0-9\s-]{9,13}$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export const phoneSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .refine((v) => digitsOnly(v).slice(-10).length === 10, {
    message: 'Enter a valid 10-digit mobile number',
  });

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine((v) => !v || digitsOnly(v).slice(-10).length === 10, {
    message: 'Enter a valid 10-digit mobile number',
  });

export const emailSchema = z
  .string()
  .email('Enter a valid email address')
  .optional()
  .or(z.literal(''));

export const gstinSchema = z
  .string()
  .optional()
  .refine((v) => !v || GSTIN_REGEX.test(v.toUpperCase()), {
    message: 'GSTIN must be 15 characters (e.g. 24AABCS1234L1Z5)',
  });

export const panSchema = z
  .string()
  .optional()
  .refine((v) => !v || PAN_REGEX.test(v.toUpperCase()), {
    message: 'PAN must be 10 characters (e.g. AABCS1234L)',
  });

export const pincodeSchema = z
  .string()
  .optional()
  .refine((v) => !v || PINCODE_REGEX.test(v), {
    message: 'PIN code must be 6 digits',
  });

// -------- Entity form schemas --------------------------------------------

export const leadFormSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  companyName: z.string().optional(),
  phone: phoneSchema,
  altPhone: optionalPhoneSchema,
  email: emailSchema,
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  source: z.string().min(1, 'Source is required'),
  status: z.string().min(1),
  temperature: z.string().min(1),
  estimatedValue: z.coerce.number().min(0).optional(),
  assignedToId: z.string().min(1, 'Assign this lead to a salesperson'),
  notes: z.string().optional(),
});
export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const customerFormSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: emailSchema,
  phone: phoneSchema,
  altPhone: optionalPhoneSchema,
  gstin: gstinSchema,
  pan: panSchema,
  industry: z.string().optional(),
  segment: z.string().min(1),
  creditLimit: z.coerce.number().min(0),
  paymentTermsDays: z.coerce.number().min(0).max(180),
  billingLine1: z.string().min(1, 'Billing address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: pincodeSchema,
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const itemFormSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  description: z.string().optional(),
  hsnCode: z
    .string()
    .min(4, 'HSN code is required')
    .max(8, 'HSN code is at most 8 digits'),
  category: z.string().min(1),
  group: z.string().optional(),
  unit: z.string().min(1),
  rate: z.coerce.number().positive('Rate must be greater than zero'),
  costRate: z.coerce.number().min(0).optional(),
  gstPercent: z.coerce.number().min(0).max(28),
  specifications: z.string().optional(),
  stockTotal: z.coerce.number().min(0),
  warehouse: z.string().min(1),
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;

export const taskFormSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  status: z.string().min(1),
  priority: z.string().min(1),
  type: z.string().min(1),
  assignedToId: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const routeFormSchema = z.object({
  fromLocation: z.string().min(1, 'Origin is required'),
  toLocation: z.string().min(1, 'Destination is required'),
  distanceKm: z.coerce.number().positive('Distance must be greater than zero'),
  baseRent: z.coerce.number().min(0).optional(),
  perKmRate: z.coerce.number().min(0).optional(),
  carrier: z.string().optional(),
});
export type RouteFormValues = z.infer<typeof routeFormSchema>;

export const vehicleFormSchema = z
  .object({
    registrationNo: z.string().min(1, 'Registration number is required'),
    type: z.string().min(1, 'Vehicle type is required'),
    capacityKL: z.coerce.number().positive('Capacity must be greater than zero'),
    ownerType: z.enum(['OWNED', 'CONTRACT']),
    contractMonths: z.coerce.number().optional(),
    rcExpiry: z.string().optional(),
    fitnessExpiry: z.string().optional(),
    insuranceExpiry: z.string().optional(),
    currentDriverId: z.string().optional(),
  })
  .refine((v) => v.ownerType !== 'CONTRACT' || [3, 6, 12].includes(Number(v.contractMonths)), {
    message: 'Choose the contract length (3, 6 or 12 months)',
    path: ['contractMonths'],
  });
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const driverFormSchema = z.object({
  name: z.string().min(2, 'Driver name is required'),
  phone: phoneSchema,
  licenseNo: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  experienceYears: z.coerce.number().min(0, 'Experience cannot be negative'),
  currentVehicleId: z.string().optional(),
});
export type DriverFormValues = z.infer<typeof driverFormSchema>;

export const staffFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: phoneSchema,
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.string().min(1),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
});
export type StaffFormValues = z.infer<typeof staffFormSchema>;
