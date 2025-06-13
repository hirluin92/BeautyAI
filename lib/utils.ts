/**
 * Formatta un numero come valuta in euro
 * @param amount Il numero da formattare
 * @returns La stringa formattata (es. "€ 10,00")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
} 