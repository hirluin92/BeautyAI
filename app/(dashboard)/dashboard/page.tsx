// app/(dashboard)/dashboard/page.tsx - Con Debugging Migliorato
import { requireAuth } from '@/lib/supabase/requireAuth'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Euro,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react'
import { QuantumDashboard } from '@/components/dashboard/quantum-dashboard'

export default function DashboardPage() {
  return <QuantumDashboard />
}