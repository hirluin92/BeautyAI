/**
 * Configurazione per i test AI
 * Questo file contiene dati di esempio per testare l'AI
 */

const testConfig = {
  // Organizzazione di test
  organization: {
    name: 'Centro Estetico Test',
    address: 'Via Roma 123, Milano',
    working_hours: {
      mon: { open: '09:00', close: '19:00' },
      tue: { open: '09:00', close: '19:00' },
      wed: { open: '09:00', close: '19:00' },
      thu: { open: '09:00', close: '19:00' },
      fri: { open: '09:00', close: '19:00' },
      sat: { open: '09:00', close: '17:00' },
      sun: { open: '10:00', close: '16:00' }
    }
  },

  // Servizi di test
  services: [
    {
      name: 'Massaggio Rilassante',
      category: 'Massaggi',
      price: 50.00,
      duration_minutes: 60,
      description: 'Massaggio rilassante per alleviare lo stress'
    },
    {
      name: 'Massaggio Sportivo',
      category: 'Massaggi',
      price: 60.00,
      duration_minutes: 60,
      description: 'Massaggio per sportivi e recupero muscolare'
    },
    {
      name: 'Facial Anti-Age',
      category: 'Trattamenti Viso',
      price: 45.00,
      duration_minutes: 45,
      description: 'Trattamento anti-età per il viso'
    },
    {
      name: 'Manicure',
      category: 'Manicure e Pedicure',
      price: 25.00,
      duration_minutes: 30,
      description: 'Manicure completa con smalto'
    },
    {
      name: 'Pedicure',
      category: 'Manicure e Pedicure',
      price: 35.00,
      duration_minutes: 45,
      description: 'Pedicure completa con smalto'
    }
  ],

  // Clienti di test
  clients: [
    {
      full_name: 'Maria Rossi',
      phone: '+393331234567',
      email: 'maria.rossi@email.com',
      whatsapp_phone: '+393331234567'
    },
    {
      full_name: 'Giulia Bianchi',
      phone: '+393339876543',
      email: 'giulia.bianchi@email.com',
      whatsapp_phone: '+393339876543'
    }
  ],

  // Prenotazioni di test
  bookings: [
    {
      service_name: 'Massaggio Rilassante',
      client_phone: '+393331234567',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Domani
      price: 50.00
    },
    {
      service_name: 'Facial Anti-Age',
      client_phone: '+393339876543',
      start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dopo domani
      price: 45.00
    }
  ],

  // Messaggi di test per l'AI
  testMessages: {
    greeting: [
      'Ciao',
      'Buongiorno',
      'Salve',
      'Come stai?'
    ],
    booking: [
      'Vorrei prenotare un appuntamento',
      'Prenota un massaggio',
      'Hai disponibilità per domani?',
      'Posso prenotare per venerdì?'
    ],
    services: [
      'Quali servizi offrite?',
      'Info servizi',
      'Quanto costa un massaggio?',
      'Avete trattamenti per il viso?'
    ],
    cancellation: [
      'Vorrei cancellare la mia prenotazione',
      'Cancella l\'appuntamento di domani',
      'Non posso venire, devo disdire'
    ],
    clientInfo: [
      'Le mie prenotazioni',
      'Ho prenotazioni future?',
      'Quando ho l\'ultimo appuntamento?'
    ]
  },

  // Risposte attese dall'AI
  expectedResponses: {
    greeting: ['ciao', 'assistente', 'aiuto', 'benvenuto'],
    booking: ['prenotare', 'appuntamento', 'disponibilità', 'data'],
    services: ['servizi', 'massaggio', 'prezzi', 'offriamo'],
    cancellation: ['cancellare', 'cancellazione', 'disdire'],
    clientInfo: ['prenotazioni', 'appuntamenti', 'futur']
  }
};

// Funzione per creare dati di test nel database
async function createTestData(supabase) {
  console.log('🔧 Creazione dati di test...');

  try {
    // 1. Crea organizzazione
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: testConfig.organization.name,
        address: testConfig.organization.address,
        working_hours: testConfig.organization.working_hours,
        plan_type: 'premium'
      })
      .select('id')
      .single();

    if (orgError) throw orgError;

    console.log(`✅ Organizzazione creata: ${org.id}`);

    // 2. Crea servizi
    for (const service of testConfig.services) {
      const { error: serviceError } = await supabase
        .from('services')
        .insert({
          organization_id: org.id,
          ...service
        });

      if (serviceError) {
        console.error(`❌ Errore creazione servizio ${service.name}:`, serviceError);
      } else {
        console.log(`✅ Servizio creato: ${service.name}`);
      }
    }

    // 3. Crea clienti
    for (const client of testConfig.clients) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          organization_id: org.id,
          ...client
        });

      if (clientError) {
        console.error(`❌ Errore creazione cliente ${client.full_name}:`, clientError);
      } else {
        console.log(`✅ Cliente creato: ${client.full_name}`);
      }
    }

    // 4. Crea prenotazioni
    for (const booking of testConfig.bookings) {
      // Trova servizio e cliente
      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('organization_id', org.id)
        .eq('name', booking.service_name)
        .single();

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', org.id)
        .eq('phone', booking.client_phone)
        .single();

      if (service && client) {
        const endAt = new Date(booking.start_at.getTime() + 60 * 60 * 1000); // +1 ora

        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            organization_id: org.id,
            client_id: client.id,
            service_id: service.id,
            start_at: booking.start_at.toISOString(),
            end_at: endAt.toISOString(),
            price: booking.price,
            status: 'confirmed',
            source: 'manual'
          });

        if (bookingError) {
          console.error(`❌ Errore creazione prenotazione:`, bookingError);
        } else {
          console.log(`✅ Prenotazione creata per ${booking.service_name}`);
        }
      }
    }

    console.log('✅ Dati di test creati con successo!');
    return org.id;

  } catch (error) {
    console.error('❌ Errore nella creazione dati di test:', error);
    throw error;
  }
}

// Funzione per pulire i dati di test
async function cleanupTestData(supabase, organizationId) {
  console.log('🧹 Pulizia dati di test...');

  try {
    // Elimina in ordine per rispettare le foreign key
    await supabase.from('bookings').delete().eq('organization_id', organizationId);
    await supabase.from('chat_messages').delete().eq('organization_id', organizationId);
    await supabase.from('chat_sessions').delete().eq('organization_id', organizationId);
    await supabase.from('clients').delete().eq('organization_id', organizationId);
    await supabase.from('services').delete().eq('organization_id', organizationId);
    await supabase.from('organizations').delete().eq('id', organizationId);

    console.log('✅ Dati di test eliminati con successo!');
  } catch (error) {
    console.error('❌ Errore nella pulizia dati di test:', error);
  }
}

module.exports = {
  testConfig,
  createTestData,
  cleanupTestData
}; 