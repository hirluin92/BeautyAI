import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Il nome è obbligatorio'),
  category: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Prezzo non valido'),
  duration_minutes: z.number().min(1, 'Durata non valida'),
  is_active: z.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>; 