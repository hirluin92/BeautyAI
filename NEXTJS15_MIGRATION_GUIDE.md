# Next.js 15 Migration Guide - Beauty AI Assistant

## 🚀 **Overview**

Questo documento descrive le modifiche implementate per garantire la compatibilità con Next.js 15, in particolare per il nuovo comportamento di `params` e `searchParams` che ora sono **Promise**.

## ⚠️ **Breaking Changes in Next.js 15**

### **Params e SearchParams sono ora Promise**

**BEFORE (Next.js 14):**
```typescript
export default async function Page({ params, searchParams }) {
  const { id } = params
  const search = searchParams.search || ''
}
```

**AFTER (Next.js 15):**
```typescript
export default async function Page({ params, searchParams }) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
}
```

## 🔧 **Modifiche Implementate**

### 1. **Utility Functions** (`lib/utils.ts`)

Aggiunte funzioni helper per gestire i searchParams in modo sicuro:

```typescript
// ✅ Safe parameter extraction
export function getSearchParamValue(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: string = ''
): string

export function getSearchParamArray(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  separator: string = ','
): string[]

export function getSearchParamNumber(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  defaultValue: number = 0
): number
```

### 2. **Type Definitions**

Nuove interfacce TypeScript per type safety:

```typescript
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
```

### 3. **Pagine Aggiornate**

#### **Pagine con Params Dinamici**
- ✅ `app/(dashboard)/services/[id]/edit/page.tsx`
- ✅ `app/(dashboard)/clients/[id]/page.tsx`
- ✅ `app/(dashboard)/clients/[id]/edit/page.tsx`
- ✅ `app/(dashboard)/bookings/[id]/page.tsx`
- ✅ `app/(dashboard)/bookings/[id]/edit/page.tsx`
- ✅ `app/(dashboard)/services/[id]/page.tsx`
- ✅ `app/staff/[id]/page.tsx`
- ✅ `app/staff/[id]/edit/page.tsx`
- ✅ `app/(dashboard)/clients/[id]/bookings/page.tsx`

#### **Pagine con SearchParams**
- ✅ `app/(dashboard)/clients/page.tsx` - Ricerca e filtri
- ✅ `app/(dashboard)/bookings/page.tsx` - Paginazione e filtri

## 📝 **Pattern di Implementazione**

### **Pagine con Solo Params**

```typescript
import { DynamicPageProps } from '@/lib/utils'

export default async function DetailPage({ params }: DynamicPageProps<{ id: string }>) {
  const { id } = await params
  
  // Fetch data using id
  const data = await fetchData(id)
  
  return <Component data={data} />
}
```

### **Pagine con Solo SearchParams**

```typescript
import { SearchablePageProps, getSearchParamValue } from '@/lib/utils'

export default async function ListPage({ searchParams }: SearchablePageProps) {
  const resolvedSearchParams = await searchParams
  
  const search = getSearchParamValue(resolvedSearchParams, 'search', '')
  const page = getSearchParamNumber(resolvedSearchParams, 'page', 1)
  
  // Fetch data with filters
  const data = await fetchData({ search, page })
  
  return <Component data={data} />
}
```

### **Pagine con Entrambi**

```typescript
import { NextJS15PageProps, getSearchParamValue } from '@/lib/utils'

export default async function ComplexPage({ 
  params, 
  searchParams 
}: NextJS15PageProps<{ id: string }>) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  
  const tab = getSearchParamValue(resolvedSearchParams, 'tab', 'details')
  
  // Fetch data using both params and searchParams
  const data = await fetchData(id, { tab })
  
  return <Component data={data} activeTab={tab} />
}
```

## 🛡️ **Error Handling**

### **Safe Params Wrapper**

```typescript
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
```

### **Usage Example**

```typescript
export default async function SafePage({ params }: DynamicPageProps<{ id: string }>) {
  return await withSafeParams(params, async ({ id }) => {
    const data = await fetchData(id)
    return <Component data={data} />
  })
}
```

## 🔍 **Client Components**

I componenti client-side che usano `useSearchParams` **NON** necessitano modifiche:

```typescript
'use client'

import { useSearchParams } from 'next/navigation'

export default function ClientComponent() {
  const searchParams = useSearchParams() // ✅ Non è una Promise
  
  const search = searchParams.get('search') || ''
  
  return <div>Search: {search}</div>
}
```

## 📊 **Benefici delle Modifiche**

### ✅ **Type Safety**
- TypeScript completo per params e searchParams
- Compile-time error detection
- IntelliSense migliorato

### ✅ **Performance**
- Lazy loading dei parametri
- Migliore gestione della memoria
- Streaming più efficiente

### ✅ **Developer Experience**
- Utility functions riutilizzabili
- Pattern consistenti
- Error handling robusto

### ✅ **Future-Proof**
- Compatibilità con Next.js 15+
- Preparato per future features
- Migrazione graduale possibile

## 🚨 **Punti di Attenzione**

### **1. Error Handling**
Sempre gestire gli errori quando si await params/searchParams:

```typescript
try {
  const { id } = await params
} catch (error) {
  console.error('Failed to resolve params:', error)
  notFound()
}
```

### **2. Type Safety**
Usare sempre le interfacce TypeScript appropriate:

```typescript
// ✅ Correct
interface PageProps {
  params: Promise<{ id: string }>
}

// ❌ Avoid
interface PageProps {
  params: { id: string }
}
```

### **3. Performance**
Non await params/searchParams se non necessari:

```typescript
// ✅ Efficient
export default async function Page({ params }) {
  if (someCondition) {
    const { id } = await params
    // Use id
  }
}

// ❌ Inefficient
export default async function Page({ params }) {
  const { id } = await params // Always awaited even if not used
  if (someCondition) {
    // Use id
  }
}
```

## 🔄 **Migration Checklist**

- [x] Aggiornare tutte le pagine dinamiche con `await params`
- [x] Aggiornare pagine con searchParams con `await searchParams`
- [x] Implementare utility functions per type safety
- [x] Aggiungere error handling appropriato
- [x] Testare tutte le route aggiornate
- [x] Verificare compatibilità TypeScript
- [x] Documentare i pattern di utilizzo

## 📚 **Risorse Aggiuntive**

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [TypeScript Configuration](https://nextjs.org/docs/app/building-your-application/typescript)

---

**Data Migrazione:** Dicembre 2024  
**Versione Next.js:** 15.0.0  
**Status:** ✅ Completata 