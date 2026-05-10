import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const tripSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().max(500).optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    coverImage: z.string().optional().or(z.literal("")),
    isPublic: z.boolean().optional().default(false),
    totalBudget: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(0, "Budget must be positive")
    ),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const stopSchema = z
  .object({
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    arrivalDate: z.string().min(1, "Arrival date is required"),
    departureDate: z.string().min(1, "Departure date is required"),
    tripId: z.string().min(1),
  })
  .refine((d) => new Date(d.departureDate) >= new Date(d.arrivalDate), {
    message: "Departure must be after arrival",
    path: ["departureDate"],
  });

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cost: z.number().min(0, "Cost must be positive"),
  duration: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  stopId: z.string().min(1),
});

export const packingItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  tripId: z.string().min(1),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  date: z.string().optional(),
  tripId: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type StopInput = z.infer<typeof stopSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type PackingItemInput = z.infer<typeof packingItemSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
