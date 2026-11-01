import { z } from 'zod';

export const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const guestLoginSchema = z.object({
  marriageCode: z
    .string()
    .min(3, 'Passcode must be at least 3 characters')
    .toUpperCase()
});

export const createMarriageSchema = z.object({
  partnerOneName: z.string().min(2, 'Partner 1 name is required'),
  partnerTwoName: z.string().min(2, 'Partner 2 name is required'),
  customCode: z.string().optional()
});

export const guestUploadSchema = z.object({
  uploaderName: z.string().min(2, 'Please enter your name for photo attribution'),
  uploaderEmail: z.string().email('Please enter a valid email address'),
  mediaType: z.enum(['PHOTO', 'VIDEO']).default('PHOTO')
});

export const updateEventSchema = z.object({
  customTitle: z.string().optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  venueAddress: z.string().optional(),
  liveStreamUrl: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type GuestLoginInput = z.infer<typeof guestLoginSchema>;
export type CreateMarriageInput = z.infer<typeof createMarriageSchema>;
export type GuestUploadInput = z.infer<typeof guestUploadSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

