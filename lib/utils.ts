import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// ✅ Next.js 15 SearchParams Utilities
export function getSearchParamValue(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: string = ''
): string {
  const value = searchParams[key]
  return typeof value === 'string' ? value : defaultValue
}

export function getSearchParamArray(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  separator: string = ','
): string[] {
  const value = searchParams[key]
  if (typeof value === 'string') {
    return value.split(separator).filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string')
  }
  return []
}

export function getSearchParamNumber(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: number = 0
): number {
  const value = searchParams[key]
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

// ✅ Next.js 15 Type Definitions
export interface NextJS15PageProps<T = Record<string, string>> {
  params: Promise<T>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface DynamicPageProps<T = Record<string, string>> {
  params: Promise<T>
}

export interface SearchablePageProps<T = Record<string, string>> {
  params: Promise<T>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// ✅ Specific page prop types
export interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export interface ServiceEditPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export interface BookingsListPageProps {
  params: Promise<Record<string, never>>
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    date?: string
    staff?: string
  }>
}

// ✅ Wrapper for safe params handling
export async function withSafeParams<T extends Record<string, string>>(
  params: Promise<T>,
  handler: (resolvedParams: T) => Promise<any>
) {
  try {
    const resolvedParams = await params
    return await handler(resolvedParams)
  } catch (error) {
    console.error('Error resolving params:', error)
    throw error
  }
}

export async function safeParamsWrapper<T extends Record<string, string>>(
  params: Promise<T>
): Promise<T | null> {
  try {
    return await params
  } catch (error) {
    console.error('Failed to resolve params:', error)
    return null
  }
} 