import React from 'react'

interface RevolutionaryDashboardProps {
  data: any // Sostituire con tipi specifici in seguito
}

export default function RevolutionaryDashboard({ data }: RevolutionaryDashboardProps) {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-16 px-8 py-5 rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-[30px] shadow-lg relative overflow-hidden max-w-7xl mx-auto">
        <div className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 via-pink-500 to-teal-400 bg-[length:400%_400%] bg-clip-text text-transparent animate-rainbowShift tracking-tight relative">
          Beauty AI Assistant
        </div>
        <div className="flex gap-5 items-center">
          <div className="relative p-4 bg-white/10 rounded-full cursor-pointer border border-white/20">
            <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <div className="absolute top-2.5 right-2.5 w-3 h-3 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full animate-notificationPulse"></div>
          </div>
          <button className="bg-gradient-to-r from-yellow-400 via-yellow-500 via-orange-600 via-amber-900 to-yellow-900 text-black py-4 px-10 rounded-full font-extrabold text-sm uppercase tracking-wider shadow-lg border-none glassmorphism-gold transition-all duration-300 hover:scale-105">
            👑 Diventa Leggenda
          </button>
        </div>
      </header>
      {/* HERO SECTION */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[56px] md:text-[72px] font-normal bg-gradient-to-r from-[#18c8d6] via-[#3b82f6] to-[#6f42c1] bg-clip-text text-transparent tracking-tight mb-6">
            Che cosa vuoi creare oggi?
          </h1>
          <div className="flex justify-center gap-4 mb-8">
            <button className="px-6 py-2 rounded-full border border-white/20 bg-transparent text-white font-medium hover:bg-white/10 transition">I tuoi progetti</button>
            <button className="px-6 py-2 rounded-full border border-purple-400 bg-transparent text-purple-300 font-medium hover:bg-purple-400/10 transition">Modelli</button>
            <button className="px-6 py-2 rounded-full border border-cyan-400 bg-transparent text-cyan-300 font-medium hover:bg-cyan-400/10 transition">Canva AI</button>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-black/60 border border-white/10 rounded-2xl px-6 py-4 shadow-lg">
              <input className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium text-lg outline-none" placeholder="Cerca tra milioni di modelli" />
              <button className="ml-4 p-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* QUICK ACTIONS */}
      <section className="mb-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap justify-center gap-6 mb-14">
          <a href="#" className="quick-action glassmorphism-action-button flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center">
              {/* Icona clipboard */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="6" y="3" width="12" height="18" rx="2" fill="#fbbf24"/>
                <rect x="9" y="6" width="6" height="2" rx="1" fill="#fff"/>
              </svg>
            </span>
            <span className="font-normal text-base uppercase tracking-wide">I tuoi progetti</span>
          </a>
          <a href="#" className="quick-action glassmorphism-action-button flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center">
              {/* Icona AI */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#38bdf8"/>
                <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="font-normal text-base uppercase tracking-wide">AI Assistant</span>
          </a>
          <a href="#" className="quick-action glassmorphism-action-button flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center">
              {/* Icona Analytics */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="10" width="4" height="10" rx="2" fill="#34d399"/>
                <rect x="10" y="6" width="4" height="14" rx="2" fill="#60a5fa"/>
                <rect x="16" y="2" width="4" height="18" rx="2" fill="#a78bfa"/>
              </svg>
            </span>
            <span className="font-normal text-base uppercase tracking-wide">Analytics Pro</span>
          </a>
          <a href="#" className="quick-action glassmorphism-action-button flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center">
              {/* Icona Beauty Creator */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#f472b6"/>
                <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="font-normal text-base uppercase tracking-wide">Beauty Creator</span>
          </a>
        </div>
      </section>
      {/* SEARCH SECTION */}
      <section className="max-w-7xl mx-auto mb-20 px-8 md:px-12">
        <div className="relative glassmorphism-search rounded-[30px] border border-white/20 overflow-hidden shadow-lg">
          <input 
            type="text" 
            className="w-full px-10 py-8 bg-transparent border-none text-white text-xl font-medium outline-none placeholder:text-white/60 placeholder:italic"
            placeholder="Cerca tra milioni di clienti, servizi e trends beauty..."
          />
          <button className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 border-none p-4 rounded-[20px] cursor-pointer shadow-lg transition-all duration-300 hover:scale-110">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="#38bdf8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </section>
      {/* STATS SECTION */}
      <section className="mb-28 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8 mb-14">
          {/* Clienti Attivi */}
          <div className="glassmorphism-stat-card text-center transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-5xl mb-6 animate-iconFloat flex justify-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" fill="#38bdf8"/>
                <rect x="4" y="16" width="16" height="4" rx="2" fill="#38bdf8"/>
              </svg>
            </div>
            <div className="text-5xl font-normal font-poppins mb-5 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">3,847</div>
            <div className="text-lg font-normal text-white/90 uppercase tracking-wide">Clienti Attivi</div>
          </div>
          {/* Fatturato Mensile */}
          <div className="glassmorphism-stat-card text-center transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-5xl mb-6 animate-iconFloat flex justify-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="8" fill="#fbbf24"/>
                <path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-5xl font-normal font-poppins mb-5 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">€127.5k</div>
            <div className="text-lg font-normal text-white/90 uppercase tracking-wide">Fatturato Mensile</div>
          </div>
          {/* Rating Perfetto */}
          <div className="glassmorphism-stat-card text-center transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-5xl mb-6 animate-iconFloat flex justify-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" fill="#facc15"/>
              </svg>
            </div>
            <div className="text-5xl font-normal font-poppins mb-5 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">4.97</div>
            <div className="text-lg font-normal text-white/90 uppercase tracking-wide">Rating Perfetto</div>
          </div>
          {/* Crescita AI */}
          <div className="glassmorphism-stat-card text-center transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-5xl mb-6 animate-iconFloat flex justify-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <path d="M4 12l8-8 8 8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="10" y="12" width="4" height="8" rx="2" fill="#34d399"/>
              </svg>
            </div>
            <div className="text-5xl font-normal font-poppins mb-5 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">+247%</div>
            <div className="text-lg font-normal text-white/90 uppercase tracking-wide">Crescita AI</div>
          </div>
        </div>
      </section>
      {/* FEATURES SECTION */}
      <section className="mb-28 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-4xl font-normal font-poppins text-center mb-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">Il Tuo Impero Beauty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {/* Quantum Booking */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-orange-400 to-red-500 shadow-lg animate-iconFloat">
              {/* Icona calendario quantistico */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="8" fill="#fbbf24"/>
                <path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Quantum Booking</h3>
            <p className="text-white/80 mb-10 leading-relaxed">AI quantistico che predice e ottimizza ogni prenotazione, eliminando i no-show e massimizzando ogni minuto</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Attiva Quantum AI
            </button>
          </div>

          {/* Client DNA */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg animate-iconFloat">
              {/* Icona DNA */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <ellipse cx="12" cy="12" rx="8" ry="10" fill="#38bdf8"/>
                <path d="M8 8c2 2 6 6 8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 8c-2 2-6 6-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Client DNA</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Profilazione avanzata con AI che legge nel pensiero dei clienti e anticipa ogni loro desiderio beauty</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Scopri DNA Clienti
            </button>
          </div>

          {/* Beauty Universe */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg animate-iconFloat">
              {/* Icona stella/universo */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#a78bfa"/>
                <polygon points="12,4 14,10 20,10 15,14 17,20 12,16 7,20 9,14 4,10 10,10" fill="#fff"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Beauty Universe</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Catalogo infinito di servizi con pricing dinamico AI e creazione automatica di nuovi trend</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Esplora Universe
            </button>
          </div>

          {/* Time Singularity */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg animate-iconFloat">
              {/* Icona orologio */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#fbbf24"/>
                <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Time Singularity</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Calendario multidimensionale che piega il tempo-spazio per creare slot impossibili e aumentare i ricavi</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Controlla il Tempo
            </button>
          </div>

          {/* Oracle Analytics */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg animate-iconFloat">
              {/* Icona grafico/oracolo */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <rect x="8" y="8" width="8" height="8" rx="4" fill="#f472b6"/>
                <path d="M12 8v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Oracle Analytics</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Visioni del futuro con AI che prevede trend, comportamenti e opportunità fino a 12 mesi nel futuro</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Vedi il Futuro
            </button>
          </div>

          {/* Neural Genesis */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg animate-iconFloat">
              {/* Icona cervello/AI */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <ellipse cx="12" cy="12" rx="10" ry="8" fill="#f472b6"/>
                <path d="M8 12c2-2 6-2 8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Neural Genesis</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Super-intelligenza che gestisce conversazioni umane perfette, vende automaticamente e conquista clienti</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Risveglia l'AI
            </button>
          </div>

          {/* Omni Presence */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg animate-iconFloat">
              {/* Icona broadcast/omni */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#38bdf8"/>
                <path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Omni Presence</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Presenza totale su ogni canale del pianeta con messaggi personalizzati che ipnotizzano e convertono</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Domina Tutti i Canali
            </button>
          </div>

          {/* Command Center */}
          <div className="glassmorphism-feature-card transition-all duration-600 cursor-pointer hover:scale-105 hover:-translate-y-5">
            <div className="w-20 h-20 rounded-[25px] flex items-center justify-center mb-10 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg animate-iconFloat">
              {/* Icona centro di controllo */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <rect x="8" y="8" width="8" height="8" rx="4" fill="#60a5fa"/>
                <path d="M12 8v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-poppins mb-5">Command Center</h3>
            <p className="text-white/80 mb-10 leading-relaxed">Centro di controllo galattico per comandare il tuo impero beauty con precisione quantistica</p>
            <button className="glassmorphism-feature-btn w-full py-4 px-10 rounded-[20px] text-white font-normal font-poppins text-base uppercase tracking-wide transition-all duration-400 hover:bg-white/20 hover:-translate-y-1">
              Prendi il Controllo
            </button>
          </div>
        </div>
      </section>
      {/* RECENT ACTIVITY SECTION */}
      <section className="mb-28 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-4xl font-normal font-poppins text-center mb-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">Attività Recenti</h2>
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {/* Activity Item 1 */}
            <div className="glassmorphism-activity-card">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg animate-iconFloat flex-shrink-0">
                  {/* Icona stella */}
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" fill="#facc15"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-normal font-poppins text-white">Nuovo Cliente VIP Registrato</h3>
                    <span className="badge-gradient-green">Completato</span>
                  </div>
                  <p className="text-white/80 text-lg mb-4 leading-relaxed">Maria Rossi ha completato la registrazione premium con abbonamento annuale. Profilo DNA analizzato e personalizzazioni applicate automaticamente.</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span>2 minuti fa</span>
                    <span>Cliente #3847</span>
                    <span>€299/anno</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Activity Item 2 */}
            <div className="glassmorphism-activity-card">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg animate-iconFloat flex-shrink-0">
                  {/* Icona calendario */}
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="24" height="24" rx="8" fill="#60a5fa"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-normal font-poppins text-white">Prenotazione Quantum Ottimizzata</h3>
                    <span className="badge-gradient-blue">In Corso</span>
                  </div>
                  <p className="text-white/80 text-lg mb-4 leading-relaxed">AI ha riorganizzato 15 prenotazioni per massimizzare l'efficienza. Creati 3 slot aggiuntivi e ridotto i tempi di attesa del 40%.</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span>15 minuti fa</span>
                    <span>15 prenotazioni</span>
                    <span>+40% efficienza</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Activity Item 3 */}
            <div className="glassmorphism-activity-card">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg animate-iconFloat flex-shrink-0">
                  {/* Icona grafico */}
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect x="8" y="8" width="16" height="16" rx="4" fill="#f472b6"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-normal font-poppins text-white">Analisi Oracle Completata</h3>
                    <span className="badge-gradient-pink">Completato</span>
                  </div>
                  <p className="text-white/80 text-lg mb-4 leading-relaxed">Predizione trend Q2 2024: aumento del 67% per trattamenti anti-aging. Raccomandazioni di pricing e marketing generate automaticamente.</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span>1 ora fa</span>
                    <span>Q2 2024</span>
                    <span>+67% trend</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Activity Item 4 */}
            <div className="glassmorphism-activity-card">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 shadow-lg animate-iconFloat flex-shrink-0">
                  {/* Icona AI */}
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <ellipse cx="16" cy="16" rx="10" ry="8" fill="#f472b6"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-normal font-poppins text-white">Conversazione Neural Genesis</h3>
                    <span className="badge-gradient-orange">In Corso</span>
                  </div>
                  <p className="text-white/80 text-lg mb-4 leading-relaxed">AI ha gestito conversazione con cliente indeciso. Vendita cross-selling completata: €450 di servizi aggiuntivi venduti automaticamente.</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span>2 ore fa</span>
                    <span>15 messaggi</span>
                    <span>+€450 venduto</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Activity Item 5 */}
            <div className="glassmorphism-activity-card">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg animate-iconFloat flex-shrink-0">
                  {/* Icona broadcast */}
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <circle cx="16" cy="16" r="10" fill="#38bdf8"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-normal font-poppins text-white">Campagna Omni Presence Lanciata</h3>
                    <span className="badge-gradient-cyan">Attivo</span>
                  </div>
                  <p className="text-white/80 text-lg mb-4 leading-relaxed">Messaggi personalizzati inviati su 8 canali simultaneamente. Tasso di apertura del 89% e conversione del 23% su Instagram Stories.</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span>4 ore fa</span>
                    <span>8 canali</span>
                    <span>23% conversione</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* PERFORMANCE METRICS SECTION */}
      <section className="mb-28 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-4xl font-normal font-poppins text-center mb-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">Metriche di Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {/* Revenue Chart */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">Fatturato Mensile</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">€127,847</div>
              <div className="text-white/60 text-sm">+23% vs mese scorso</div>
            </div>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" cx="18" cy="18" r="16"/>
                <circle className="text-green-400 animate-metricCircle" stroke="currentColor" strokeWidth="3" fill="none" cx="18" cy="18" r="16" strokeDasharray="85 100" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-normal text-white">85%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Target</span>
                <span className="text-white font-normal">€150,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Crescita</span>
                <span className="text-green-400 font-normal">+23%</span>
              </div>
            </div>
          </div>

          {/* Client Satisfaction */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">Soddisfazione Clienti</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">4.97/5</div>
              <div className="text-white/60 text-sm">+0.3 vs mese scorso</div>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="32" height="32" fill={i < 4 ? '#facc15' : 'rgba(255,255,255,0.2)'} className="" viewBox="0 0 24 24">
                    <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Recensioni</span>
                <span className="text-white font-normal">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Positivo</span>
                <span className="text-green-400 font-normal">98.5%</span>
              </div>
            </div>
          </div>

          {/* AI Efficiency */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">Efficienza AI</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">94.7%</div>
              <div className="text-white/60 text-sm">+12% vs mese scorso</div>
            </div>
            <div className="mb-6">
              <div className="w-full bg-white/10 rounded-full h-4 mb-4">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-4 rounded-full animate-metricBar" style={{width: '94.7%'}}></div>
              </div>
              <div className="text-center text-white/60 text-sm">Ottimizzazione automatica</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Tempo risparmiato</span>
                <span className="text-white font-normal">127h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Precisione</span>
                <span className="text-purple-400 font-normal">99.2%</span>
              </div>
            </div>
          </div>

          {/* Booking Optimization */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">Ottimizzazione Prenotazioni</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">+40%</div>
              <div className="text-white/60 text-sm">Efficienza aumentata</div>
            </div>
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-normal text-white mb-1">847</div>
                  <div className="text-white/60 text-sm">Prenotazioni</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-normal text-white mb-1">3.2h</div>
                  <div className="text-white/60 text-sm">Tempo medio</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">No-show rate</span>
                <span className="text-green-400 font-normal">2.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Slot creati</span>
                <span className="text-blue-400 font-normal">+23</span>
              </div>
            </div>
          </div>

          {/* Marketing ROI */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">ROI Marketing</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">847%</div>
              <div className="text-white/60 text-sm">+156% vs mese scorso</div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                    <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" fill="#facc15"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Investimento</span>
                <span className="text-white font-normal">€2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Ritorno</span>
                <span className="text-orange-400 font-normal">€24,156</span>
              </div>
            </div>
          </div>

          {/* Growth Rate */}
          <div className="glassmorphism-metric-card">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal font-poppins mb-4">Tasso di Crescita</h3>
              <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent mb-2">+247%</div>
              <div className="text-white/60 text-sm">Crescita annuale</div>
            </div>
            <div className="mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Clienti</span>
                  <span className="text-white font-normal">+1,247</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full animate-metricBar" style={{width: '85%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Servizi</span>
                  <span className="text-white font-normal">+89</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full animate-metricBar" style={{width: '92%'}}></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Fatturato</span>
                <span className="text-teal-400 font-normal">+156%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Efficienza</span>
                <span className="text-cyan-400 font-normal">+89%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CALL TO ACTION SECTION */}
      <section className="mb-28 max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-normal font-poppins mb-12 bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 via-pink-500 to-teal-400 bg-[length:600%_600%] bg-clip-text text-transparent animate-rainbowShift leading-[0.9] tracking-[-0.04em]">
              Il Futuro è Qui
            </h2>
            <p className="text-3xl font-normal text-white/90 mb-16 leading-relaxed">
              Unisciti ai <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-normal">legends</span> che stanno già dominando il mercato beauty con l'AI più potente del pianeta
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
              <button className="glassmorphism-cta-btn bg-gradient-to-r from-yellow-400 via-yellow-500 via-orange-600 via-amber-900 to-yellow-900 text-black py-8 px-16 rounded-full font-normal font-poppins text-2xl uppercase tracking-wider shadow-2xl border-none transition-all duration-500 hover:scale-110 hover:shadow-yellow-500/50">
                🚀 Attiva Super AI
              </button>
              <button className="glassmorphism-cta-btn bg-white/10 backdrop-blur-[30px] border-2 border-white/20 text-white py-8 px-16 rounded-full font-normal font-poppins text-2xl uppercase tracking-wider shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20">
                📞 Demo Live
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">10,847+</div>
                <div className="text-white/80 text-lg">Saloni Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-4">€2.4M+</div>
                <div className="text-white/80 text-lg">Fatturato Generato</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-normal font-poppins bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">99.7%</div>
                <div className="text-white/80 text-lg">Soddisfazione</div>
              </div>
            </div>
            <div className="glassmorphism-cta-box p-12">
              <h3 className="text-3xl font-normal font-poppins mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                🎯 Cosa Aspetti?
              </h3>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Ogni secondo che aspetti, i tuoi competitor si avvicinano. L'AI non dorme mai e sta già lavorando per loro. 
                <span className="text-yellow-400 font-normal">Il momento di agire è ora.</span>
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="badge-gradient-green">⚡ Setup in 5 minuti</span>
                <span className="badge-gradient-blue">🔒 Sicurezza militare</span>
                <span className="badge-gradient-pink">💰 ROI garantito</span>
                <span className="badge-gradient-orange">🎯 Supporto 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="text-center py-12 border-t border-white/20 bg-gradient-to-r from-cyan-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl font-normal font-poppins mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Beauty AI Assistant
          </div>
          <p className="text-white/60 text-lg mb-8">
            Trasforma il tuo salone in un impero beauty con l'intelligenza artificiale più avanzata del mondo
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
            <span>© 2024 Beauty AI Assistant</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
      {/* FINE FOOTER */}
      <style>{`
        @keyframes notificationPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        }
        @keyframes rainbowShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 25% 75%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 75% 25%; }
        }
        @keyframes underlineGlow {
          0%, 100% { width: 400px; opacity: 0.8; box-shadow: 0 0 20px rgba(0,212,255,0.5); }
          50% { width: 600px; opacity: 1; box-shadow: 0 0 40px rgba(0,212,255,0.8); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
} 