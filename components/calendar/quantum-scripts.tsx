'use client'

import { useEffect } from 'react'

export default function QuantumScripts() {
  useEffect(() => {
    // System Variables
    let draggedQuantumAppointment: HTMLElement | null = null
    let currentNeuralInsightIndex = 0
    let quantumSystemOnline = true

    // Neural Network Background Generator
    function generateNeuralNetwork() {
      const neuralNetwork = document.getElementById('neuralNetwork')
      if (!neuralNetwork) return
      
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Clear existing network
      neuralNetwork.innerHTML = ''
      
      // Generate neural nodes
      for (let i = 0; i < 25; i++) {
        const node = document.createElement('div')
        node.className = 'neural-node'
        node.style.left = Math.random() * width + 'px'
        node.style.top = Math.random() * height + 'px'
        node.style.animationDelay = Math.random() * 3 + 's'
        neuralNetwork.appendChild(node)
      }
      
      // Generate connections between nodes
      const nodes = neuralNetwork.querySelectorAll('.neural-node')
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.8) { // 20% chance of connection
            const connection = document.createElement('div')
            connection.className = 'neural-connection'
            
            const node1 = nodes[i] as HTMLElement
            const node2 = nodes[j] as HTMLElement
            const node1Rect = node1.getBoundingClientRect()
            const node2Rect = node2.getBoundingClientRect()
            
            const distance = Math.sqrt(
              Math.pow(node2Rect.left - node1Rect.left, 2) + 
              Math.pow(node2Rect.top - node1Rect.top, 2)
            )
            
            if (distance < 300) { // Only connect nearby nodes
              const angle = Math.atan2(
                node2Rect.top - node1Rect.top,
                node2Rect.left - node1Rect.left
              ) * 180 / Math.PI
              
              connection.style.width = distance + 'px'
              connection.style.left = node1Rect.left + 'px'
              connection.style.top = node1Rect.top + 'px'
              connection.style.transform = `rotate(${angle}deg)`
              connection.style.animationDelay = Math.random() * 4 + 's'
              
              neuralNetwork.appendChild(connection)
            }
          }
        }
      }
    }

    // Quantum Particles Generator
    function generateQuantumParticles() {
      const particlesContainer = document.getElementById('quantumParticles')
      if (!particlesContainer) return
      
      const interval = setInterval(() => {
        if (particlesContainer.children.length < 15) {
          const particle = document.createElement('div')
          particle.className = 'particle'
          particle.style.left = Math.random() * window.innerWidth + 'px'
          particle.style.animationDuration = (Math.random() * 5 + 5) + 's'
          
          particlesContainer.appendChild(particle)
          
          // Remove particle after animation
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle)
            }
          }, 10000)
        }
      }, 500)

      return () => clearInterval(interval)
    }

    // Neural AI Insights Rotation
    const neuralInsights = [
      "> ANALISI PREDITTIVA: Sistema quantico in modalità operativa avanzata. Neural networks sincronizzate al 97.3%. Pattern comportamentali ottimizzati.",
      "> QUANTUM ANALYTICS: Matrice temporale analizzata. Slot ottimali identificati. Efficienza calendariato aumentata del +34% rispetto baseline standard.",
      "> NEURAL PREDICTION: Algoritmi predittivi attivi. Probabilità no-show calcolate in tempo reale. Sistema anti-abbandono quantum operativo.",
      "> AI TREND ANALYSIS: Pattern rilevati: incremento richieste premium +47%. Consiglio attivazione protocolli quantum beauty experience.",
      "> QUANTUM OPTIMIZATION: Slot mercoledì-venerdì presentano efficienza neuromorfa 94.2%. ROI previsto incrementato del +67% con ottimizzazione AI.",
      "> NEURAL BEHAVIORAL PATTERN: Clienti VIP mostrano preferenza 89% per time-slots post-15:00. Sistema ha riconfigurato automaticamente priorità quantum."
    ]

    function rotateNeuralInsights() {
      const insightElement = document.getElementById('neuralInsights')
      if (!insightElement) return
      
      // Quantum fade effect
      insightElement.style.opacity = '0'
      insightElement.style.transform = 'translateY(15px) rotateX(10deg)'
      
      setTimeout(() => {
        insightElement.textContent = neuralInsights[currentNeuralInsightIndex]
        insightElement.style.opacity = '1'
        insightElement.style.transform = 'translateY(0) rotateX(0deg)'
        currentNeuralInsightIndex = (currentNeuralInsightIndex + 1) % neuralInsights.length
      }, 600)
    }

    // Quantum Drag & Drop System
    function setupDragAndDrop() {
      document.querySelectorAll('.appointment-quantum').forEach(appointment => {
        appointment.addEventListener('dragstart', handleQuantumDragStart)
        appointment.addEventListener('dragend', handleQuantumDragEnd)
        appointment.addEventListener('click', handleQuantumAppointmentClick)
      })

      document.querySelectorAll('.calendar-quantum-cell').forEach(cell => {
        cell.addEventListener('dragover', handleQuantumDragOver)
        cell.addEventListener('drop', handleQuantumDrop)
        cell.addEventListener('dragenter', handleQuantumDragEnter)
        cell.addEventListener('dragleave', handleQuantumDragLeave)
        cell.addEventListener('click', handleQuantumCellClick)
      })
    }

    function handleQuantumDragStart(e: Event) {
      const target = e.target as HTMLElement
      draggedQuantumAppointment = target
      target.classList.add('dragging')
      if (e instanceof DragEvent && e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
      }
      showQuantumNotification('Modalità Quantum Drag attivata', 'info')
    }

    function handleQuantumDragEnd(e: Event) {
      const target = e.target as HTMLElement
      target.classList.remove('dragging')
      document.querySelectorAll('.calendar-quantum-cell').forEach(cell => {
        cell.classList.remove('drop-target')
      })
    }

    function handleQuantumDragOver(e: Event) {
      e.preventDefault()
      if (e instanceof DragEvent && e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }
    }

    function handleQuantumDragEnter(e: Event) {
      e.preventDefault()
      const target = e.target as HTMLElement
      if (!target.querySelector('.appointment-quantum')) {
        target.classList.add('drop-target')
        target.style.boxShadow = 'inset 0 0 25px rgba(0, 212, 255, 0.4)'
      }
    }

    function handleQuantumDragLeave(e: Event) {
      const target = e.target as HTMLElement
      const relatedTarget = (e as any).relatedTarget as HTMLElement
      if (!target.contains(relatedTarget)) {
        target.classList.remove('drop-target')
        target.style.boxShadow = ''
      }
    }

    function handleQuantumDrop(e: Event) {
      e.preventDefault()
      const target = e.target as HTMLElement
      target.classList.remove('drop-target')
      target.style.boxShadow = ''
      
      if (draggedQuantumAppointment && target !== draggedQuantumAppointment.parentNode && !target.querySelector('.appointment-quantum')) {
        const newAppointment = draggedQuantumAppointment.cloneNode(true) as HTMLElement
        target.appendChild(newAppointment)
        target.classList.add('has-appointment')
        
        const parentNode = draggedQuantumAppointment.parentNode as HTMLElement
        parentNode.classList.remove('has-appointment')
        draggedQuantumAppointment.remove()
        
        // Update quantum time
        const newTime = target.dataset.time
        const timeElement = newAppointment.querySelector('.appointment-time')
        if (timeElement && newTime) {
          const originalDuration = calculateQuantumDuration(timeElement.textContent || '')
          timeElement.textContent = `${newTime}-${addQuantumTime(newTime, originalDuration)}`
        }
        
        setupQuantumAppointmentEvents(newAppointment)
        showQuantumNotification('🚀 Appuntamento riorganizzato con successo!', 'success')
        
        setTimeout(() => {
          showQuantumNotification('🧠 Neural AI ha ottimizzato il calendario. Efficienza +3.7%', 'info')
        }, 2500)
      }
    }

    function handleQuantumAppointmentClick(e: Event) {
      e.stopPropagation()
      const appointment = e.currentTarget as HTMLElement
      const timeElement = appointment.querySelector('.appointment-time')
      const clientElement = appointment.querySelector('.appointment-client')
      const serviceElement = appointment.querySelector('.appointment-service')
      const quantumElement = appointment.querySelector('.quantum-indicator')
      
      const data = {
        time: timeElement?.textContent || '',
        client: clientElement?.textContent || '',
        service: serviceElement?.textContent || '',
        quantum: quantumElement?.textContent || '',
        type: appointment.classList.contains('facial') ? 'Quantum Facial Treatment' : 
              appointment.classList.contains('massage') ? 'Neural Massage Therapy' :
              appointment.classList.contains('manicure') ? 'Holographic Nail Art' : 'AI Hair Styling'
      }
      
      showQuantumAppointmentDetails(data)
    }

    function handleQuantumCellClick(e: Event) {
      const target = e.target as HTMLElement
      if (e.target === e.currentTarget) {
        const day = target.dataset.day
        const time = target.dataset.time
        showQuantumNotification(`🎯 Quantum Slot selezionato: Dimensione ${day}, Temporal ${time}`, 'info')
        
        // Add quantum selection effect
        target.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)'
        setTimeout(() => {
          target.style.background = ''
        }, 1500)
      }
    }

    function setupQuantumAppointmentEvents(appointment: HTMLElement) {
      appointment.addEventListener('dragstart', handleQuantumDragStart)
      appointment.addEventListener('dragend', handleQuantumDragEnd)
      appointment.addEventListener('click', handleQuantumAppointmentClick)
    }

    function showQuantumAppointmentDetails(data: any) {
      const modal = document.getElementById('quantumModal')
      const modalContent = document.getElementById('quantumModalContent')
      
      if (!modal || !modalContent) return
      
      modalContent.innerHTML = `
        <div style="margin-bottom: 2.5rem;">
          <div style="background: var(--neural-surface); padding: 2.5rem; border-radius: 20px; margin-bottom: 2rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--quantum-blue); animation: quantumScan 3s ease-in-out infinite;"></div>
            <div style="display: grid; gap: 1.5rem;">
              <div><strong style="color: var(--node-color); font-family: var(--font-neural);">TEMPORAL:</strong> <span style="color: #ffffff; font-weight: 600;">${data.time}</span></div>
              <div><strong style="color: var(--node-color); font-family: var(--font-neural);">CLIENT.ID:</strong> <span style="color: #ffffff; font-weight: 600;">${data.client}</span></div>
              <div><strong style="color: var(--node-color); font-family: var(--font-neural);">SERVICE.TYPE:</strong> <span style="color: #ffffff; font-weight: 600;">${data.service}</span></div>
              <div><strong style="color: var(--node-color); font-family: var(--font-neural);">QUANTUM.STATUS:</strong> <span style="color: #ffffff; font-weight: 600;">${data.quantum}</span></div>
              <div><strong style="color: var(--node-color); font-family: var(--font-neural);">CATEGORY:</strong> <span style="color: #ffffff; font-weight: 600;">${data.type}</span></div>
            </div>
          </div>
          
          <div style="background: var(--quantum-blue); padding: 2rem; border-radius: 20px; color: white; margin-bottom: 2rem; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: quantumPulse 4s ease-in-out infinite;"></div>
            <h5 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-neural); position: relative; z-index: 1;">
              🧠 <span>NEURAL AI QUANTUM ANALYSIS</span>
            </h5>
            <p style="opacity: 0.9; line-height: 1.8; position: relative; z-index: 1; font-weight: 500;">Cliente ad alta fedeltà quantica con neural score 97.8/100. Probabilità di ripetere il servizio entro 30 giorni temporali: 94.7%. Algoritmo quantico consiglia: proporre pacchetto trattamenti neurali con 18% di sconto dimensionale.</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
            <button class="btn-quantum-action edit" onclick="editQuantumAppointment()">
              QUANTUM EDIT
            </button>
            <button class="btn-quantum-action remind" onclick="sendQuantumReminder()">
              NEURAL REMIND
            </button>
            <button class="btn-quantum-action reschedule" onclick="rescheduleQuantumAppointment()">
              QUANTUM SHIFT
            </button>
            <button class="btn-quantum-action ai-optimize" onclick="aiOptimizeAppointment()">
              AI OPTIMIZE
            </button>
            <button class="btn-quantum-action hologram" onclick="createHologramBackup()">
              HOLOGRAM BACKUP
            </button>
            <button class="btn-quantum-action delete" onclick="quantumDelete()">
              QUANTUM DELETE
            </button>
          </div>
        </div>
      `
      
      modal.classList.add('active')
    }

    // Modal Functions (Global per permettere onclick)
    ;(window as any).editQuantumAppointment = function() {
      showQuantumNotification('🧠 Modalità Neural Edit attivata', 'info')
      closeQuantumModal()
    }

    ;(window as any).sendQuantumReminder = function() {
      showQuantumNotification('📱 Quantum WhatsApp reminder inviato con successo!', 'success')
      closeQuantumModal()
    }

    ;(window as any).rescheduleQuantumAppointment = function() {
      showQuantumNotification('⚛️ Procedura Quantum Reschedule avviata...', 'warning')
      closeQuantumModal()
    }

    ;(window as any).aiOptimizeAppointment = function() {
      showQuantumNotification('🤖 AI sta ottimizzando l\'appuntamento...', 'info')
      setTimeout(() => {
        showQuantumNotification('✨ Ottimizzazione completata! Efficienza +15%', 'success')
      }, 2000)
      closeQuantumModal()
    }

    ;(window as any).createHologramBackup = function() {
      showQuantumNotification('🌟 Creazione backup olografico...', 'info')
      setTimeout(() => {
        showQuantumNotification('💎 Backup olografico creato con successo!', 'success')
      }, 1500)
      closeQuantumModal()
    }

    ;(window as any).quantumDelete = function() {
      if (confirm('Sei sicuro di voler eliminare questo appuntamento dalla dimensione quantica?')) {
        showQuantumNotification('🗑️ Appuntamento eliminato dalla matrice temporale. Cliente notificato via quantum entanglement.', 'info')
        closeQuantumModal()
      }
    }

    function closeQuantumModal() {
      const modal = document.getElementById('quantumModal')
      if (modal) {
        modal.classList.remove('active')
      }
    }

    // Quantum Actions
    function setupQuantumActions() {
      const quantumAdd = document.getElementById('quantumAdd')
      const neuralAI = document.getElementById('neuralAI')
      const quantumAnalytics = document.getElementById('quantumAnalytics')
      const neuralSettings = document.getElementById('neuralSettings')

      quantumAdd?.addEventListener('click', showQuantumAddModal)
      neuralAI?.addEventListener('click', showNeuralAIAssistant)
      quantumAnalytics?.addEventListener('click', showQuantumAnalytics)
      neuralSettings?.addEventListener('click', showNeuralSettings)
    }

    function showQuantumAddModal() {
      showQuantumNotification('🚀 Sistema Quantum Creation in caricamento...', 'info')
      setTimeout(() => {
        showQuantumNotification('✨ Sistema pronto. Campi ottimizzati dal Neural Engine.', 'success')
      }, 1800)
    }

    function showNeuralAIAssistant() {
      showQuantumNotification('🧠 Neural AI Assistant si sta materializzando...', 'info')
      setTimeout(() => {
        showQuantumNotification('⚡ Connessione neurale stabilita. Pronto per assistenza quantica.', 'success')
      }, 2200)
    }

    function showQuantumAnalytics() {
      showQuantumNotification('📊 Caricamento Quantum Analytics...', 'info')
      setTimeout(() => {
        showQuantumNotification('📈 Dashboard quantiche sincronizzate. Dati neurali aggiornati.', 'success')
      }, 2000)
    }

    function showNeuralSettings() {
      showQuantumNotification('⚙️ Pannello Neural Settings in preparazione...', 'info')
      setTimeout(() => {
        showQuantumNotification('🔧 Impostazioni quantiche caricate.', 'success')
      }, 1600)
    }

    // Calendar Neural Controls
    function setupNeuralControls() {
      const aiOptimize = document.getElementById('aiOptimize')
      const predictiveMode = document.getElementById('predictiveMode')
      const quantumSync = document.getElementById('quantumSync')

      aiOptimize?.addEventListener('click', () => {
        showQuantumNotification('🤖 AI sta ottimizzando il calendario quantico...', 'info')
        setTimeout(() => {
          showQuantumNotification('✨ Ottimizzazione completata! Efficienza aumentata del 23%', 'success')
        }, 3000)
      })

      predictiveMode?.addEventListener('click', () => {
        showQuantumNotification('🔮 Modalità Predictive attivata. Scanning future patterns...', 'info')
        setTimeout(() => {
          showQuantumNotification('🌟 Previsioni generate! 47 opportunità rilevate.', 'success')
        }, 2500)
      })

      quantumSync?.addEventListener('click', () => {
        showQuantumNotification('⚛️ Sincronizzazione Quantum in corso...', 'info')
        setTimeout(() => {
          showQuantumNotification('💫 Sync completato! Tutti i dispositivi quantici allineati.', 'success')
        }, 2000)
      })
    }

    // Utility Functions
    function calculateQuantumDuration(timeString: string): number {
      const [start, end] = timeString.split('-')
      const startMinutes = timeToMinutes(start)
      const endMinutes = timeToMinutes(end)
      return endMinutes - startMinutes
    }

    function timeToMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    function addQuantumTime(time: string, minutesToAdd: number): string {
      const totalMinutes = timeToMinutes(time) + minutesToAdd
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    // Quantum Notification System
    function showQuantumNotification(message: string, type: string = 'info') {
      const notification = document.createElement('div')
      notification.className = `quantum-notification ${type}`
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 8px; height: 8px; background: var(--node-color); border-radius: 50%; animation: neuralPulse 1.5s ease-in-out infinite;"></div>
          <div style="flex: 1;">${message}</div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.classList.add('show')
      }, 100)
      
      setTimeout(() => {
        notification.classList.remove('show')
        setTimeout(() => notification.remove(), 500)
      }, 4500)
    }

    // Quantum Metrics Animation
    function updateQuantumMetrics() {
      const metrics = {
        revenue: document.getElementById('quantumRevenue'),
        bookings: document.getElementById('quantumBookings'),
        efficiency: document.getElementById('quantumEfficiency'),
        satisfaction: document.getElementById('quantumSatisfaction')
      }

      if (Math.random() > 0.6) {
        const currentRevenue = metrics.revenue?.textContent?.replace('€', '').replace(',', '')
        if (currentRevenue && metrics.revenue) {
          const currentValue = parseInt(currentRevenue)
          const newRevenue = currentValue + Math.floor(Math.random() * 150) + 75
          animateQuantumValue(metrics.revenue, currentValue, newRevenue, '€')
        }
        
        const currentBookings = metrics.bookings?.textContent
        if (currentBookings && metrics.bookings) {
          const currentValue = parseInt(currentBookings)
          if (Math.random() > 0.7) {
            animateQuantumValue(metrics.bookings, currentValue, currentValue + Math.floor(Math.random() * 3) + 1)
          }
        }
        
        const currentEfficiency = metrics.efficiency?.textContent?.replace('%', '')
        if (currentEfficiency && metrics.efficiency) {
          const currentValue = parseFloat(currentEfficiency)
          if (currentValue < 99.5) {
            const newEfficiency = Math.min(currentValue + (Math.random() * 0.5), 99.9)
            animateQuantumValue(metrics.efficiency, currentValue, newEfficiency, '%')
          }
        }
      }
    }

    function animateQuantumValue(element: HTMLElement, start: number, end: number, prefix: string = '') {
      const duration = 2000
      const startTime = performance.now()
      
      function animate(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const current = start + (end - start) * progress
        let formatted: string
        
        if (prefix === '%') {
          formatted = current.toFixed(1)
        } else {
          formatted = Math.floor(current).toLocaleString()
        }
        
        element.textContent = `${prefix}${formatted}${prefix === '€' ? '' : prefix}`
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Add quantum glow effect on completion
          element.style.textShadow = '0 0 30px rgba(255, 255, 255, 0.8)'
          setTimeout(() => {
            element.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)'
          }, 500)
        }
      }
      
      requestAnimationFrame(animate)
    }

    // Navigation Events
    function setupNavigation() {
      const prevWeek = document.getElementById('prevWeek')
      const nextWeek = document.getElementById('nextWeek')
      const newAppointment = document.getElementById('newAppointment')

      prevWeek?.addEventListener('click', () => {
        showQuantumNotification('⏪ Dimensione temporale precedente caricata', 'info')
      })

      nextWeek?.addEventListener('click', () => {
        showQuantumNotification('⏩ Dimensione temporale successiva caricata', 'info')
      })

      newAppointment?.addEventListener('click', showQuantumAddModal)
    }

    // Modal Close Events
    function setupModalEvents() {
      const closeQuantumModalBtn = document.getElementById('closeQuantumModal')
      const quantumModal = document.getElementById('quantumModal')

      closeQuantumModalBtn?.addEventListener('click', closeQuantumModal)
      quantumModal?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeQuantumModal()
      })
    }

    // Keyboard Shortcuts
    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeQuantumModal()
        }
        if (e.key === 'q' && e.ctrlKey) {
          e.preventDefault()
          showQuantumAddModal()
          showQuantumNotification('⚡ Quantum Shortcut attivata: Ctrl+Q', 'info')
        }
        if (e.key === 'n' && e.ctrlKey && e.altKey) {
          e.preventDefault()
          showNeuralAIAssistant()
          showQuantumNotification('🧠 Neural AI Shortcut: Ctrl+Alt+N', 'info')
        }
      })
    }

    // Window Resize Optimization
    function setupResizeHandler() {
      let resizeTimeout: NodeJS.Timeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          generateNeuralNetwork()
          showQuantumNotification('🔄 Layout quantico ottimizzato per nuove dimensioni', 'info')
        }, 800)
      })
    }

    // Quantum System Initialization
    function initializeQuantumSystem() {
      console.log('🚀 Beauty AI Quantum System Initializing...')
      console.log('🧠 Neural networks: QUANTUM ONLINE')
      console.log('⚛️ Quantum engine: SYNCHRONIZED')
      console.log('📊 Analytics matrix: OPTIMIZED')
      console.log('📅 Calendar quantum grid: ACTIVE')
      console.log('✨ System Status: QUANTUM READY')
      
      // Initialize neural network
      generateNeuralNetwork()
      const cleanupParticles = generateQuantumParticles()
      
      // Start neural insights rotation
      const insightsInterval = setInterval(rotateNeuralInsights, 10000)
      
      // Start quantum metrics updates
      const metricsInterval = setInterval(updateQuantumMetrics, 25000)
      
      // Setup all events
      setupDragAndDrop()
      setupQuantumActions()
      setupNeuralControls()
      setupNavigation()
      setupModalEvents()
      setupKeyboardShortcuts()
      setupResizeHandler()
      
      // Welcome notification
      setTimeout(() => {
        showQuantumNotification('🚀 Beauty AI Quantum Revolution caricato con successo!', 'success')
      }, 1200)
      
      setTimeout(() => {
        showQuantumNotification('🧠 Neural Engine sincronizzato. Tutte le funzioni quantiche operative.', 'info')
      }, 3000)

      // Cleanup function
      return () => {
        clearInterval(insightsInterval)
        clearInterval(metricsInterval)
        if (typeof cleanupParticles === 'function') cleanupParticles()
      }
    }

    // Auto-save quantum simulation
    let autoSaveInterval: NodeJS.Timeout
    function startQuantumAutoSave() {
      autoSaveInterval = setInterval(() => {
        const saveIndicator = document.createElement('div')
        saveIndicator.style.cssText = `
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--glass-bg);
          backdrop-filter: blur(25px);
          border: 1px solid var(--glass-border);
          color: var(--node-color);
          padding: 1.2rem 2.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: var(--font-neural);
          opacity: 0;
          transition: all 0.4s ease;
          z-index: 10000;
          box-shadow: var(--neural-glow);
        `
        saveIndicator.textContent = '💾 Quantum Auto-save completato'
        document.body.appendChild(saveIndicator)
        
        setTimeout(() => saveIndicator.style.opacity = '1', 100)
        setTimeout(() => {
          saveIndicator.style.opacity = '0'
          setTimeout(() => saveIndicator.remove(), 400)
        }, 3000)
      }, 75000)
    }

    // Initialize everything
    const cleanup = initializeQuantumSystem()
    startQuantumAutoSave()

    // Cleanup on unmount
    return () => {
      cleanup()
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
      }
      console.log('🌟 Beauty AI Quantum System shutting down gracefully...')
    }

  }, [])

  return null
} 