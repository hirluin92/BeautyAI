import { Metadata } from 'next'
import TimeSingularitySystem from '@/components/time-singularity/TimeSingularitySystem'

export const metadata: Metadata = {
  title: 'Time Singularity - Calendario Quantico',
  description: 'Sistema calendario multidimensionale che piega il tempo-spazio'
}

export default function TimeSingularityPage() {
  return <TimeSingularitySystem />
} 