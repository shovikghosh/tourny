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
          <h1 className="text-white text-2xl font-semibold">New Tournament</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new tournament by filling out the form below.
          </p>
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
            Tournament Name
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
          <label htmlFor="startDate" className="wtt-label">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="wtt-label">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="endDate"
              id="endDate"
              required
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="wtt-label mb-0">
              Select Players
            </label>
            <Link
              href="/players/new"
              className="text-sm text-primary hover:text-primary/90"
              target="_blank"
            >
              + Add New Player
            </Link>
          </div>

          {loadingPlayers ? (
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : players.length === 0 ? (
            <div className="mt-2 text-center p-4 border rounded-md border-border bg-muted">
              <p className="text-sm text-muted-foreground">No players available. Create players first.</p>
            </div>
          ) : (
            <div className="mt-2 max-h-56 overflow-y-auto border rounded-md border-border bg-muted p-2">
              <div className="space-y-2">
                {players.map(player => (
                  <div 
                    key={player.id} 
                    className="relative flex items-start p-2 hover:bg-card rounded cursor-pointer"
                    onClick={() => handlePlayerToggle(player.id)}
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={() => {}} // Handled by the div's onClick
                        className="wtt-checkbox"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label className="text-white font-medium cursor-pointer">
                        {player.name}
                      </label>
                      <p className="text-xs text-muted-foreground">{player.email}</p>
                    </div>
                    {player.rank && (
                      <div className="ml-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/20 text-primary">
                          Rank: {player.rank}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="wtt-button"
          >
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  )
} 