import { z } from "zod";

// --- Shared Schemas ---

export const MongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const EmailSchema = z.string().email("Invalid email address").max(255);

export const PasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100);

export const PhoneSchema = z.string()
  .min(5, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^\+?[0-9\-\s()]+$/, "Invalid phone number format");

// --- Feature Schemas ---

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"), // Don't enforce length on login, just existence
  rememberMe: z.boolean().optional(),
});

export const SignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: EmailSchema,
  password: PasswordSchema,
});

export const RestaurantOnboardingSchema = z.object({
  userId: MongoIdSchema,
  restaurantName: z.string().min(2).max(100),
  restaurantType: z.string().min(2).max(50),
  cuisineType: z.string().min(2).max(50),
  phone: PhoneSchema,
  email: EmailSchema,
  country: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(255),
  pinCode: z.string().min(2).max(20),
  totalTables: z.number().int().min(1).max(500),
  staffCount: z.number().int().min(1).max(1000),
  openingHours: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  closingHours: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/**
 * Utility to safely parse JSON body with Zod
 */
export async function validateBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ success: true; data: T } | { success: false; error: any }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return { success: false, error: result.error.format() };
    }
    
    return { success: true, data: result.data };
  } catch (e) {
    return { success: false, error: "Invalid JSON payload" };
  }
}
