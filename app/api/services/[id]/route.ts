import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { serviceSchema } from '@/lib/validation/service'
import { z } from 'zod'

// Validation schemas
const updateServiceSchema = z.object({
  name: z.string().min(1, 'Nome servizio è obbligatorio').optional(),
  description: z.string().optional(),
  duration: z.number().min(1, 'Durata deve essere almeno 1 minuto').optional(),
  price: z.number().min(0, 'Prezzo non può essere negativo').optional(),
  is_active: z.boolean().optional(),
});

const serviceIdSchema = z.object({
  id: z.string().uuid('ID servizio non valido'),
});

// GET /api/services/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { id } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!userData || !userData.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization_id!)
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/services/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { id } = await params
    
    // Validate service ID
    const validatedParams = serviceIdSchema.parse({ id });
    
    // Get request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateServiceSchema.parse(body);
    
    // Check if service exists
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', validatedParams.id)
      .single();

    if (fetchError || !existingService) {
      return NextResponse.json(
        { error: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    // Update service
    const { data, error } = await supabase
      .from('services')
      .update(validatedData)
      .eq('id', validatedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return NextResponse.json(
        { error: 'Errore durante l\'aggiornamento del servizio' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in PATCH /api/services/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { id } = await params
    
    // Validate service ID
    const validatedParams = serviceIdSchema.parse({ id });
    
    // Check if service exists
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', validatedParams.id)
      .single();

    if (fetchError || !existingService) {
      return NextResponse.json(
        { error: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    // Check if service has bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', validatedParams.id)
      .limit(1);

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Errore nel controllo delle prenotazioni' },
        { status: 500 }
      );
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Non puoi eliminare un servizio con prenotazioni associate' },
        { status: 400 }
      );
    }

    // Delete service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', validatedParams.id);

    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json(
        { error: 'Errore durante l\'eliminazione del servizio' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Servizio eliminato con successo' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ID servizio non valido' },
        { status: 400 }
      );
    }
    
    console.error('Error in DELETE /api/services/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}