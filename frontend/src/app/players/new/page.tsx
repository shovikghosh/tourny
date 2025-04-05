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
          <h1 className="text-white text-2xl font-semibold">New Player</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new player by filling out the form below.
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
        <div className="rounded-md bg-red-900/20 border border-red-800 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-500">Error</h3>
              <div className="mt-2 text-sm text-red-400">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wtt-form-container">
        <div>
          <label htmlFor="name" className="wtt-label">
            Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="wtt-label">
            Email *
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              required
              className="wtt-input"
            />
          </div>
          <p className="wtt-helper-text">Must be unique in the system.</p>
        </div>

        <div>
          <label htmlFor="rank" className="wtt-label">
            Rank
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="rank"
              id="rank"
              min="1"
              className="wtt-input"
            />
          </div>
          <p className="wtt-helper-text">Lower numbers indicate higher ranks (1 is highest).</p>
        </div>

        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked
              className="wtt-checkbox"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="active" className="text-white font-medium">
              Active
            </label>
            <p className="text-muted-foreground">Determines if the player is eligible for new tournaments.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="wtt-button"
          >
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </div>
      </form>
    </div>
  )
} 