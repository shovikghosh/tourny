'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/api'
import { Player } from '@/types/match'
import Link from 'next/link'

export default function NewTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)

  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await api.getPlayers()
        setPlayers(data)
      } catch (err) {
        console.error('Error fetching players:', err)
      } finally {
        setLoadingPlayers(false)
      }
    }

    fetchPlayers()
  }, [])

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      } else {
        return [...prev, playerId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const tournamentData = {
      name: formData.get('name') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      playerIds: selectedPlayers
    }

    console.log('Submitting tournament data:', tournamentData)

    try {
      await api.createTournament(tournamentData)
      router.push('/tournaments')
    } catch (err) {
      console.error('Error creating tournament:', err)
      setError(err instanceof Error ? err.message : 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">New Tournament</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new tournament by filling out the form below.
          </p>
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
            Tournament Name
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
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="endDate"
              id="endDate"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Select Players
            </label>
            <Link
              href="/players/new"
              className="text-sm text-indigo-600 hover:text-indigo-900"
              target="_blank"
            >
              + Add New Player
            </Link>
          </div>
          
          <div className="mt-2">
            {loadingPlayers ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading players...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center p-4 border rounded-md border-gray-200">
                <p className="text-sm text-gray-500">No players available. Please add players first.</p>
              </div>
            ) : (
              <div className="mt-1 max-h-56 overflow-y-auto border rounded-md border-gray-300 p-2">
                <div className="space-y-2">
                  {players.map(player => (
                    <div 
                      key={player.id} 
                      className="relative flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      <div className="flex h-5 items-center">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => {}} // Handled by the div's onClick
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label className="font-medium text-gray-700 cursor-pointer">
                          {player.name}
                        </label>
                        <p className="text-xs text-gray-500">{player.email}</p>
                      </div>
                      {player.rank && (
                        <div className="ml-2">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Rank: {player.rank}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {players.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Selected: {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  )
} 