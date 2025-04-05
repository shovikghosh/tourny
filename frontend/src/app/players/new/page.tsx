'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/api'
import Link from 'next/link'

export default function NewPlayerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const playerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      rank: formData.get('rank') ? parseInt(formData.get('rank') as string) : 0,
      active: formData.get('active') === 'on'
    }

    try {
      await api.createPlayer(playerData)
      router.push('/players')
    } catch (err) {
      if (err instanceof Error && err.message.includes('duplicate')) {
        setError('A player with this email already exists')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create player')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">New Player</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add a new player to the system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/players"
            className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Back to Players
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be unique in the system.</p>
        </div>

        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
            Rank
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="rank"
              id="rank"
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Lower numbers indicate higher ranks (1 is highest).</p>
        </div>

        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="active" className="font-medium text-gray-700">
              Active
            </label>
            <p className="text-gray-500">Determines if the player is eligible for new tournaments.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </div>
      </form>
    </div>
  )
} 