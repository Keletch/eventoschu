import { z } from "zod";

/**
 * Schema base para registros
 */
export const registrationSchema = z.object({
  first_name: z.string().trim().min(2, "Nombre muy corto").max(50, "Nombre muy largo"),
  last_name: z.string().trim().min(2, "Apellido muy corto").max(50, "Apellido muy largo"),
  email: z.string().trim().email("Email inválido").toLowerCase(),
  phone: z.string().trim().min(6, "Teléfono muy corto").max(20, "Teléfono muy largo").regex(/^[0-9\s-]+$/, "Formato de teléfono inválido"),
  phone_code: z.string().trim().min(1).max(10),
  residence_country: z.string().trim().max(100).optional(),
  selected_events: z.array(z.string()).min(1, "Debes seleccionar al menos una gira"),
});

/**
 * Tipos derivados
 */
export type RegistrationInput = z.infer<typeof registrationSchema>;
