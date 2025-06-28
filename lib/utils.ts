import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function getSearchParamValue(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: string = ''
): string {
  const value = searchParams[key]
  if (Array.isArray(value)) return value[0] || defaultValue
  if (typeof value === 'string') return value
  return defaultValue
}

export function getSearchParamArray(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  separator: string = ','
): string[] {
  const value = searchParams[key]
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(separator).filter(Boolean)
  return []
}

export function getSearchParamNumber(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: number = 0
): number {
  const value = searchParams[key]
  if (Array.isArray(value)) return parseInt(value[0] || '', 10) || defaultValue
  if (typeof value === 'string') return parseInt(value, 10) || defaultValue
  return defaultValue
}

export interface SearchablePageProps<T = Record<string, string>> {
  params?: Promise<T>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
