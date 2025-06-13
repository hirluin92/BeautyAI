'use client'

export default function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
        <span className="mr-3">🚪</span>
        Esci
      </button>
    </form>
  )
} 