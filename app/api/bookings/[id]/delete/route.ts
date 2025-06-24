// app/(dashboard)/bookings/[id]/delete/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const bookingIdSchema = z.object({
  id: z.string().uuid('ID prenotazione non valido'),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Validate booking ID
    const validatedParams = bookingIdSchema.parse({ id: params.id });
    
    // Check if booking exists
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', validatedParams.id)
      .single();

    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }

    // Delete booking
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', validatedParams.id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Errore durante l\'eliminazione della prenotazione' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Prenotazione eliminata con successo' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ID prenotazione non valido' },
        { status: 400 }
      );
    }
    
    console.error('Error in DELETE /api/bookings/[id]/delete:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
