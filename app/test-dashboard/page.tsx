import RevolutionaryDashboard from '@/components/dashboard/RevolutionaryDashboard'

export default function TestDashboardPage() {
  // Dati di esempio per il dashboard
  const mockData = {
    stats: {
      activeClients: 3847,
      monthlyRevenue: 127500,
      rating: 4.97,
      aiGrowth: 247
    },
    activities: [
      {
        id: 1,
        type: 'client_registration',
        title: 'Nuovo Cliente VIP Registrato',
        description: 'Maria Rossi ha completato la registrazione premium',
        timestamp: '2 minuti fa',
        status: 'completed'
      }
    ]
  }

  return (
    <div className="min-h-screen">
      <RevolutionaryDashboard data={mockData} />
    </div>
  )
} 