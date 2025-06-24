import { z } from 'zod';

export const bookingSchema = z.object({
  id: z.string().uuid('ID booking non valido').optional(),
  client_id: z.string().uuid('ID cliente non valido'),
  service_id: z.string().uuid('ID servizio non valido'),
  staff_id: z.string().uuid('ID staff non valido').optional().or(z.literal('')),
  date: z.string().min(1, 'Data richiesta'),
  time: z.string().min(1, 'Orario richiesto'),
  start_at: z.string().datetime({ message: 'Data/ora non valida' }).optional(),
  end_at: z.string().datetime({ message: 'Data/ora non valida' }).optional(),
  price: z.number().min(0, 'Prezzo non valido'),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>; 