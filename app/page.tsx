import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-8">
          Beauty AI Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Il gestionale intelligente per centri estetici
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition"
          >
            Registrati Gratis
          </Link>
        </div>
      </div>
    </main>
  )
}