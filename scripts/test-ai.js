#!/usr/bin/env node

/**
 * Script per testare l'AI WhatsApp
 * Uso: node scripts/test-ai.js
 */

const https = require('https');
const http = require('http');

// Configurazione
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  organizationId: process.env.TEST_ORG_ID || '',
  phoneNumber: process.env.TEST_PHONE || '+393331234567',
  openaiKey: process.env.OPENAI_API_KEY
};

// Colori per console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 3000),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAI(message, expectedKeywords = []) {
  log(`\n🤖 Test: "${message}"`, 'cyan');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/whatsapp/test`, 'POST', {
      message,
      organizationId: config.organizationId,
      phoneNumber: config.phoneNumber
    });

    if (response.status === 200 && response.data.success) {
      log(`✅ Successo!`, 'green');
      log(`📝 Risposta: ${response.data.response.text}`, 'blue');
      
      // Verifica parole chiave attese
      if (expectedKeywords.length > 0) {
        const foundKeywords = expectedKeywords.filter(keyword => 
          response.data.response.text.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (foundKeywords.length > 0) {
          log(`🎯 Parole chiave trovate: ${foundKeywords.join(', ')}`, 'green');
        } else {
          log(`⚠️  Parole chiave non trovate. Attese: ${expectedKeywords.join(', ')}`, 'yellow');
        }
      }
      
      return true;
    } else {
      log(`❌ Errore: ${response.status}`, 'red');
      log(`📝 Dettagli: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Errore di connessione: ${error.message}`, 'red');
    return false;
  }
}

async function testConfiguration() {
  log('\n🔧 Test Configurazione', 'magenta');
  
  // Verifica variabili ambiente
  if (!config.openaiKey) {
    log('❌ OPENAI_API_KEY non configurata', 'red');
    return false;
  }
  
  if (!config.organizationId) {
    log('❌ TEST_ORG_ID non configurato', 'red');
    return false;
  }
  
  log('✅ Variabili ambiente OK', 'green');
  
  // Test connessione server
  try {
    const response = await makeRequest(`${config.baseUrl}/api/whatsapp/test?organizationId=${config.organizationId}&phoneNumber=${config.phoneNumber}`);
    
    if (response.status === 200) {
      log('✅ Server raggiungibile', 'green');
      log(`📊 Organizzazione: ${response.data.organization?.name || 'N/A'}`, 'blue');
      log(`💆 Servizi disponibili: ${response.data.services?.length || 0}`, 'blue');
      return true;
    } else {
      log(`❌ Server non risponde correttamente: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Server non raggiungibile: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🧪 Test AI WhatsApp - Beauty AI Assistant', 'bright');
  log('==========================================', 'bright');
  
  // Test configurazione
  const configOk = await testConfiguration();
  if (!configOk) {
    log('\n❌ Configurazione non valida. Impossibile continuare.', 'red');
    process.exit(1);
  }
  
  // Test base
  log('\n📋 Test Base', 'magenta');
  await testAI('Ciao', ['ciao', 'assistente', 'aiuto']);
  await testAI('Come stai?', ['bene', 'grazie']);
  
  // Test servizi
  log('\n💆 Test Servizi', 'magenta');
  await testAI('Quali servizi offrite?', ['servizi', 'massaggio', 'facial']);
  await testAI('Info servizi', ['servizi', 'prezzi']);
  await testAI('Quanto costa un massaggio?', ['€', 'euro', 'costa']);
  
  // Test prenotazioni
  log('\n📅 Test Prenotazioni', 'magenta');
  await testAI('Vorrei prenotare un appuntamento', ['prenotare', 'appuntamento', 'servizio']);
  await testAI('Prenota un massaggio', ['massaggio', 'disponibilità', 'data']);
  await testAI('Hai disponibilità per domani?', ['disponibilità', 'orari', 'domani']);
  
  // Test gestione prenotazioni
  log('\n📋 Test Gestione Prenotazioni', 'magenta');
  await testAI('Le mie prenotazioni', ['prenotazioni', 'appuntamenti']);
  await testAI('Ho prenotazioni future?', ['prenotazioni', 'futur']);
  await testAI('Vorrei cancellare la mia prenotazione', ['cancellare', 'cancellazione']);
  
  // Test errori
  log('\n🚨 Test Gestione Errori', 'magenta');
  await testAI('Prenota per ieri', ['ieri', 'passato', 'disponibile']);
  await testAI('Servizio inesistente', ['servizio', 'disponibile', 'offriamo']);
  
  log('\n✅ Test completati!', 'green');
}

// Test specifici
async function testSpecificScenario() {
  const scenario = process.argv[2];
  
  if (!scenario) {
    await runTests();
    return;
  }
  
  log(`🧪 Test Scenario: ${scenario}`, 'magenta');
  
  switch (scenario) {
    case 'booking':
      await testAI('Ciao, vorrei prenotare un massaggio rilassante per domani alle 10:00', ['prenotazione', 'confermata']);
      break;
      
    case 'services':
      await testAI('Quali servizi di massaggio offrite?', ['massaggio', 'servizi']);
      break;
      
    case 'availability':
      await testAI('Hai disponibilità per un massaggio domani pomeriggio?', ['disponibilità', 'orari']);
      break;
      
    case 'cancellation':
      await testAI('Vorrei cancellare la mia prenotazione di domani', ['cancellare', 'cancellazione']);
      break;
      
    case 'client':
      await testAI('Ciao, sono un nuovo cliente', ['nuovo', 'cliente', 'benvenuto']);
      break;
      
    default:
      log(`❌ Scenario sconosciuto: ${scenario}`, 'red');
      log('Scenari disponibili: booking, services, availability, cancellation, client', 'yellow');
  }
}

// Gestione errori
process.on('unhandledRejection', (error) => {
  log(`❌ Errore non gestito: ${error.message}`, 'red');
  process.exit(1);
});

// Avvia test
if (require.main === module) {
  testSpecificScenario().catch(error => {
    log(`❌ Errore durante i test: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testAI, testConfiguration }; 