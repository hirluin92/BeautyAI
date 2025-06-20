'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      theme="light"
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        className: 'toast-notification',
      }}
    />
  )
}