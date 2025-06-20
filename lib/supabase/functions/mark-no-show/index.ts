// @ts-nocheck
// supabase/functions/mark-no-show/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get bookings that should be marked as no-show
    // (scheduled appointments that are more than 1 hour past their time)
    const { data: bookings, error: fetchError } = await supabaseClient
      .from('bookings_to_mark_no_show')
      .select('*')

    if (fetchError) throw fetchError

    const results = []

    for (const booking of bookings || []) {
      // Update booking status to no_show
      const { error: updateError } = await supabaseClient
        .from('bookings')
        .update({
          status: 'no_show',
          no_show: true,
          no_show_marked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id)

      if (updateError) {
        console.error(`Error updating booking ${booking.id}:`, updateError)
        results.push({
          booking_id: booking.id,
          success: false,
          error: updateError.message
        })
        continue
      }

      // Send notification to business owner about no-show
      if (Deno.env.get('NOTIFY_OWNER_EMAIL')) {
        await sendNoShowNotification(booking)
      }

      // Log the no-show event
      await supabaseClient
        .from('notification_logs')
        .insert({
          booking_id: booking.id,
          client_id: booking.client_id,
          type: 'email',
          status: 'sent',
          message: `Client ${booking.client_name} marked as no-show for ${booking.service_name} on ${formatDate(booking.start_at)} at ${booking.appointment_time}`,
          sent_at: new Date().toISOString(),
          metadata: {
            event_type: 'no_show_auto_marked'
          }
        })

      results.push({
        booking_id: booking.id,
        success: true,
        marked_at: new Date().toISOString()
      })
    }

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in mark-no-show function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT')
}

// Send notification to business owner about no-show
async function sendNoShowNotification(booking: any) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
        template_id: Deno.env.get('EMAILJS_NOSHOW_TEMPLATE_ID'),
        user_id: Deno.env.get('EMAILJS_USER_ID'),
        template_params: {
          to_email: Deno.env.get('NOTIFY_OWNER_EMAIL'),
          client_name: booking.client_name,
          service_name: booking.service_name,
          appointment_date: formatDate(booking.start_at),
          appointment_time: booking.appointment_time,
        }
      })
    })

    if (!response.ok) {
      console.error('Failed to send no-show notification email')
    }
  } catch (error) {
    console.error('Error sending no-show notification:', error)
  }
}