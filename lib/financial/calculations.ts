export function calculateVAT(amount: number, fiscalDoc: string) {
  if (fiscalDoc === 'none') {
    return {
      baseAmount: amount,
      vatAmount: 0,
      vatApplicable: false,
      warning: "Nessuna IVA da versare (no documento fiscale)"
    }
  }
  
  const VAT_RATE = 0.22 // 22% IVA standard
  const baseAmount = amount / (1 + VAT_RATE)
  const vatAmount = amount - baseAmount
  
  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    vatApplicable: true,
    warning: null
  }
}

export function calculateTaxReserves(totalRevenue: number, vatAmount: number) {
  const netRevenue = totalRevenue - vatAmount
  
  return {
    vatToReserve: Math.round(vatAmount * 100) / 100,
    irpefToReserve: Math.round(netRevenue * 0.20 * 100) / 100, // 20% IRPEF stimata
    inpsToReserve: Math.round(netRevenue * 0.2448 * 100) / 100, // 24.48% INPS
    netEffective: Math.round((netRevenue * 0.5552) * 100) / 100 // Quello che rimane (55.52%)
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
} 