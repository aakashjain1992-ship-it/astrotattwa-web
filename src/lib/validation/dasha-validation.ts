/**
 * Dasha API Validation Schemas
 * 
 * Zod schemas for validating dasha calculation requests
 * 
 * @version 1.0.0
 * @created February 11, 2026
 */

import { z } from 'zod';

/**
 * Valid Vimshottari dasha planets
 */
const DASHA_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

/**
 * Antardasha query parameters schema
 */
export const antardashaQuerySchema = z.object({
  mahadashaLord: z.enum(DASHA_PLANETS, {
    required_error: 'Mahadasha lord is required',
    invalid_type_error: 'Invalid mahadasha lord',
  }),
  mahadashaStart: z
    .string({ required_error: 'Mahadasha start date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid mahadasha start date format',
    }),
  mahadashaEnd: z
    .string({ required_error: 'Mahadasha end date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid mahadasha end date format',
    }),
  moonLongitude: z.coerce
    .number({
      required_error: 'Moon longitude is required',
      invalid_type_error: 'Moon longitude must be a number',
    })
    .min(0, 'Moon longitude must be between 0 and 360')
    .max(360, 'Moon longitude must be between 0 and 360'),
});

/**
 * Pratyantar dasha query parameters schema
 */
export const pratyantarQuerySchema = z.object({
  mahadashaLord: z.enum(DASHA_PLANETS),
  mahadashaStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  mahadashaEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
  antardashaLord: z.enum(DASHA_PLANETS),
  antardashaStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  antardashaEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
  moonLongitude: z.coerce.number().min(0).max(360),
});

/**
 * Sookshma dasha query parameters schema
 */
export const sookshmaQuerySchema = z.object({
  mahadashaLord: z.enum(DASHA_PLANETS),
  mahadashaStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  mahadashaEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
  antardashaLord: z.enum(DASHA_PLANETS),
  antardashaStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  antardashaEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
  pratyantarLord: z.enum(DASHA_PLANETS),
  pratyantarStart: z.string().refine((val) => !isNaN(Date.parse(val))),
  pratyantarEnd: z.string().refine((val) => !isNaN(Date.parse(val))),
  moonLongitude: z.coerce.number().min(0).max(360),
});

/**
 * Current dasha query parameters schema
 */
export const currentDashaQuerySchema = z.object({
  birthUtc: z
    .string({ required_error: 'Birth UTC is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid birth UTC format',
    }),
  nakLord: z.enum(DASHA_PLANETS, {
    required_error: 'Nakshatra lord is required',
  }),
  balanceYears: z.coerce
    .number({
      required_error: 'Balance years is required',
      invalid_type_error: 'Balance years must be a number',
    })
    .min(0, 'Balance years cannot be negative'),
  balanceMonths: z.coerce
    .number({
      required_error: 'Balance months is required',
      invalid_type_error: 'Balance months must be a number',
    })
    .min(0, 'Balance months cannot be negative')
    .max(11, 'Balance months must be between 0 and 11'),
  balanceDays: z.coerce
    .number({
      required_error: 'Balance days is required',
      invalid_type_error: 'Balance days must be a number',
    })
    .min(0, 'Balance days cannot be negative')
    .max(30, 'Balance days must be between 0 and 30'),
});

/**
 * Type exports
 */
export type AntardashaQuery = z.infer<typeof antardashaQuerySchema>;
export type PratyantarQuery = z.infer<typeof pratyantarQuerySchema>;
export type SookshmaQuery = z.infer<typeof sookshmaQuerySchema>;
export type CurrentDashaQuery = z.infer<typeof currentDashaQuerySchema>;
