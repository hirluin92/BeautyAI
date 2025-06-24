import { z } from 'zod';

export const clientSchema = z.object({
  full_name: z.string().min(2, 'Il nome è obbligatorio'),
  phone: z.string().min(8, 'Il telefono è obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  whatsapp_phone: z.string().optional(),
  birth_date: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>; 