// API endpoint per il sistema Quantum No-Show Prediction

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/requireAuth';
import { QuantumNoShowPredictor } from '@/lib/quantum/no-show-predictor';

export async function GET(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action') || 'analyze';
    const bookingId = searchParams.get('booking_id');
    
    const predictor = new QuantumNoShowPredictor(supabase);

    switch (action) {
      case 'single':
        if (!bookingId) {
          return NextResponse.json(
            { error: 'booking_id richiesto per analisi singola' },
            { status: 400 }
          );
        }
        
        const singlePrediction = await predictor.predictNoShow(bookingId);
        return NextResponse.json({
          success: true,
          prediction: singlePrediction
        });

      case 'analyze':
        const predictions = await predictor.analyzeUpcomingBookings(
          userData.organization.id
        );
        
        return NextResponse.json({
          success: true,
          predictions,
          summary: {
            total: predictions.length,
            high_risk: predictions.filter(p => 
              p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL'
            ).length,
            avg_risk: predictions.reduce((sum, p) => sum + p.risk_score, 0) / predictions.length
          }
        });

      case 'optimize':
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const optimization = await predictor.optimizeCalendar(
          userData.organization.id, 
          date
        );
        
        return NextResponse.json({
          success: true,
          optimization
        });

      default:
        return NextResponse.json(
          { error: 'Azione non riconosciuta' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('🚨 Errore Quantum No-Show API:', error);
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// POST per marcare booking come no-show e aggiornare il modello
export async function POST(request: NextRequest) {
  try {
    const { userData, supabase } = await requireAuth();
    const body = await request.json();
    
    const { booking_id, actual_outcome, feedback } = body;
    
    if (!booking_id || !actual_outcome) {
      return NextResponse.json(
        { error: 'booking_id e actual_outcome richiesti' },
        { status: 400 }
      );
    }

    // Aggiorna il booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: actual_outcome,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .eq('organization_id', userData.organization.id);

    if (updateError) {
      throw updateError;
    }

    // Salva feedback per migliorare il modello (opzionale)
    if (feedback) {
      await supabase
        .from('quantum_feedback')
        .insert({
          booking_id,
          organization_id: userData.organization.id,
          predicted_risk: feedback.predicted_risk,
          actual_outcome,
          feedback_notes: feedback.notes,
          created_at: new Date().toISOString()
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking aggiornato e feedback salvato'
    });

  } catch (error) {
    console.error('🚨 Errore POST Quantum No-Show:', error);
    return NextResponse.json(
      { 
        error: 'Errore aggiornamento booking',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
} 