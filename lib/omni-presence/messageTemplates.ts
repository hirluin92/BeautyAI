export interface MessageTemplate {
  id: string
  name: string
  type: 'welcome' | 'promotion' | 'reminder' | 'reactivation'
  channels: string[]
  content: {
    whatsapp?: {
      text: string
      media?: string
    }
    email?: {
      subject: string
      html: string
      text: string
    }
    sms?: {
      text: string
    }
  }
  variables: string[]
}

export const defaultTemplates: MessageTemplate[] = [
  {
    id: 'welcome-new-client',
    name: 'Benvenuto Nuovo Cliente',
    type: 'welcome',
    channels: ['whatsapp', 'email'],
    content: {
      whatsapp: {
        text: `🌟 Benvenuta/o {{clientName}}! 

Grazie per aver scelto {{salonName}}! 

✨ Ti aspettano esperienze beauty indimenticabili
🎁 Sconto 20% sulla prima prenotazione
📱 Prenota facilmente via WhatsApp

Non vediamo l'ora di coccolarti! 💆‍♀️`
      },
      email: {
        subject: 'Benvenuta/o in {{salonName}} - Sconto 20% per te!',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">Benvenuta/o {{clientName}}!</h1>
          <p>Grazie per aver scelto <strong>{{salonName}}</strong>!</p>
          <p>Ti aspettano esperienze beauty indimenticabili con i nostri trattamenti esclusivi.</p>
          <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h2>🎁 SCONTO 20% SULLA PRIMA PRENOTAZIONE</h2>
            <p>Usa il codice: <strong>BENVENUTO20</strong></p>
          </div>
          <p>Prenota subito il tuo trattamento:</p>
          <a href="{{bookingLink}}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">PRENOTA ORA</a>
        </div>`,
        text: `Benvenuta/o {{clientName}}! Grazie per aver scelto {{salonName}}! Sconto 20% sulla prima prenotazione con codice BENVENUTO20.`
      }
    },
    variables: ['clientName', 'salonName', 'bookingLink']
  },
  {
    id: 'promotion-summer-treatments',
    name: 'Promozione Trattamenti Estivi',
    type: 'promotion',
    channels: ['whatsapp', 'email', 'instagram'],
    content: {
      whatsapp: {
        text: `☀️ ESTATE 2024 - OFFERTA SPECIALE! 

{{clientName}}, è tempo di prepararsi all'estate! 

🌺 Pacchetto "Glow Estivo":
• Pulizia viso deep
• Scrub corpo energizzante  
• Manicure summer style

💰 Prezzo speciale: €89 (invece di €120)
⏰ Valido fino al 31 luglio

Prenoti subito? Rispondo qui! 💬`
      },
      email: {
        subject: '☀️ Pacchetto Glow Estivo - Sconto 26% per {{clientName}}',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FFA726, #FF7043);">
          <div style="color: white; padding: 40px 20px; text-align: center;">
            <h1>☀️ ESTATE 2024</h1>
            <h2>Pacchetto "Glow Estivo"</h2>
          </div>
          <div style="background: white; padding: 30px;">
            <p>Ciao {{clientName}},</p>
            <p>È tempo di prepararsi all'estate con il nostro <strong>Pacchetto Glow Estivo</strong>!</p>
            
            <div style="background: #FFF3E0; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #FF7043;">🌺 Cosa include:</h3>
              <ul>
                <li>Pulizia viso deep purificante</li>
                <li>Scrub corpo energizzante</li>
                <li>Manicure summer style</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 24px; color: #FF7043; font-weight: bold;">
                €89 <span style="text-decoration: line-through; color: #999;">€120</span>
              </div>
              <div style="color: #FF7043; font-weight: bold;">RISPARMIA 26%!</div>
            </div>
            
            <div style="text-align: center;">
              <a href="{{bookingLink}}" style="background: linear-gradient(135deg, #FF7043, #FFA726); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">PRENOTA SUBITO</a>
            </div>
            
            <p style="text-align: center; margin-top: 20px; color: #999;">
              Offerta valida fino al 31 luglio 2024
            </p>
          </div>
        </div>`,
        text: `Estate 2024 - Pacchetto Glow Estivo per {{clientName}}! Pulizia viso + Scrub corpo + Manicure a €89 invece di €120. Valido fino al 31 luglio.`
      }
    },
    variables: ['clientName', 'salonName', 'bookingLink']
  },
  {
    id: 'reminder-appointment-24h',
    name: 'Promemoria Appuntamento 24h',
    type: 'reminder',
    channels: ['whatsapp', 'sms'],
    content: {
      whatsapp: {
        text: `📅 Promemoria Appuntamento

Ciao {{clientName}}! 👋

Ti ricordiamo il tuo appuntamento:
🗓️ {{appointmentDate}}
⏰ {{appointmentTime}}
💆‍♀️ {{serviceName}}
👤 {{staffName}}

📍 {{salonAddress}}

Confermi la tua presenza? 
Rispondi con ✅ per confermare o ❌ per cancellare.

Ci vediamo presto! 💫`
      },
      sms: {
        text: `Promemoria: appuntamento domani {{appointmentDate}} alle {{appointmentTime}} per {{serviceName}} con {{staffName}}. Conferma rispondendo SI. {{salonName}}`
      }
    },
    variables: ['clientName', 'appointmentDate', 'appointmentTime', 'serviceName', 'staffName', 'salonAddress', 'salonName']
  },
  {
    id: 'reactivation-inactive-clients',
    name: 'Riattivazione Clienti Inattivi',
    type: 'reactivation',
    channels: ['whatsapp', 'email'],
    content: {
      whatsapp: {
        text: `💔 Ci manchi {{clientName}}!

È da un po' che non ci vediamo da {{salonName}}... 

🎁 Per il tuo ritorno, abbiamo preparato qualcosa di speciale:

✨ SCONTO 30% su tutti i trattamenti
💆‍♀️ Consulenza gratuita
🌟 Nuovo trattamento anti-age

Valido solo per te fino al {{expiryDate}}!

Torniamo a coccolarti? 💕
Rispondi per prenotare! 📱`
      },
      email: {
        subject: '💔 Ci manchi {{clientName}} - Sconto 30% per il tuo ritorno',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #8B5CF6, #EC4899);">
            <h1 style="color: white; margin: 0;">💔 Ci manchi!</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p>Ciao {{clientName}},</p>
            <p>È da un po' che non ci vediamo da <strong>{{salonName}}</strong> e ci manchi davvero!</p>
            
            <div style="background: #F3E8FF; border-left: 4px solid #8B5CF6; padding: 20px; margin: 20px 0;">
              <h3 style="color: #8B5CF6; margin-top: 0;">🎁 Offerta Speciale di Benvenuto</h3>
              <ul style="margin: 0;">
                <li><strong>30% di sconto</strong> su tutti i trattamenti</li>
                <li><strong>Consulenza gratuita</strong> con i nostri esperti</li>
                <li><strong>Prova</strong> il nostro nuovo trattamento anti-age</li>
              </ul>
            </div>
            
            <p>Questa offerta è riservata solo a te e valida fino al <strong>{{expiryDate}}</strong>!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{bookingLink}}" style="background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">PRENOTA SUBITO</a>
            </div>
            
            <p>Non vediamo l'ora di rivederti e di coccolarti di nuovo! 💕</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
              <p>{{salonName}} - {{salonAddress}}<br>
              Tel: {{salonPhone}} | Email: {{salonEmail}}</p>
            </div>
          </div>
        </div>`,
        text: `Ci manchi {{clientName}}! Sconto 30% per il tuo ritorno da {{salonName}}. Valido fino al {{expiryDate}}. Prenota: {{bookingLink}}`
      }
    },
    variables: ['clientName', 'salonName', 'expiryDate', 'bookingLink', 'salonAddress', 'salonPhone', 'salonEmail']
  }
]

export function renderTemplate(template: MessageTemplate, variables: Record<string, string>, channel: string): string {
  const content = template.content[channel as keyof typeof template.content]
  if (!content) return ''
  
  let text = ''
  if (channel === 'whatsapp' || channel === 'sms') {
    text = (content as any).text || ''
  } else if (channel === 'email') {
    text = (content as any).html || (content as any).text || ''
  }
  
  // Replace variables
  template.variables.forEach(variable => {
    const value = variables[variable] || `{{${variable}}}`
    text = text.replace(new RegExp(`{{${variable}}}`, 'g'), value)
  })
  
  return text
} 