'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/services/api'
import { Tournament, CreateMatchRequest, Player } from '@/types/match'
import Link from 'next/link'

export default function NewMatchPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params?.id ? Number(params.id) : 0
  
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  
  // Load tournament data
  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return
      
      setLoading(true)
      try {
        const data = await api.getTournament(tournamentId)
        console.log('Tournament data:', data)
        console.log('Tournament players:', data.players)
        setTournament(data)
        
        // Fetch all players regardless, so we have them available if user toggles the checkbox
        const allPlayersData = await api.getPlayers()
        console.log('All players:', allPlayersData)
        setAllPlayers(allPlayersData)
      } catch (err) {
        console.error('Error fetching tournament:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tournament')
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [tournamentId])
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const matchData: CreateMatchRequest = {
      player1Id: Number(formData.get('player1Id')),
      player2Id: Number(formData.get('player2Id')),
      round: Number(formData.get('round')),
      scheduledTime: formData.get('scheduledTime') as string || undefined,
      venue: formData.get('venue') as string || undefined,
      notes: formData.get('notes') as string || undefined
    }

    if (matchData.player1Id === matchData.player2Id) {
      setError("Players cannot play against themselves")
      setSubmitLoading(false)
      return
    }

    try {
      await api.createMatch(tournamentId, matchData)
      router.push(`/tournaments/${tournamentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create match')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Decide which players to show based on checkbox state
  const playersToShow = showAllPlayers 
    ? allPlayers 
    : (tournament?.players?.length ? tournament.players : allPlayers)

  // Function to toggle showing all players
  const toggleShowAllPlayers = () => {
    setShowAllPlayers(!showAllPlayers)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error && !tournament) {
    return (
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
    )
  }

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">New Match</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new match for {tournament.name}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Back to Tournament
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
        {tournament.players.length > 0 && allPlayers.length > tournament.players.length && (
          <div className="flex items-center mb-4">
            <input
              id="showAllPlayers"
              name="showAllPlayers"
              type="checkbox"
              checked={showAllPlayers}
              onChange={toggleShowAllPlayers}
              className="wtt-checkbox"
            />
            <label htmlFor="showAllPlayers" className="ml-2 block text-sm text-white">
              Show all players (including those not in this tournament)
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="player1Id" className="wtt-label">
              Player 1
            </label>
            <div className="mt-1">
              <select
                id="player1Id"
                name="player1Id"
                required
                className="wtt-select"
              >
                <option value="">Select Player 1</option>
                {playersToShow.length === 0 ? (
                  <option disabled value="">No players available</option>
                ) : (
                  playersToShow.map((player: Player) => (
                    <option key={`p1-${player.id}`} value={player.id}>
                      {player.name} {!tournament.players.some(p => p.id === player.id) && "⭐"}
                    </option>
                  ))
                )}
              </select>
            </div>
            {playersToShow.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                <Link href="/players/new" className="text-red-700 underline" target="_blank">
                  Add players first
                </Link>
              </p>
            )}
            {showAllPlayers && (
              <p className="mt-1 text-xs text-gray-500">⭐ indicates players not in this tournament</p>
            )}
          </div>

          <div>
            <label htmlFor="player2Id" className="wtt-label">
              Player 2
            </label>
            <div className="mt-1">
              <select
                id="player2Id"
                name="player2Id"
                required
                className="wtt-select"
              >
                <option value="">Select Player 2</option>
                {playersToShow.length === 0 ? (
                  <option disabled value="">No players available</option>
                ) : (
                  playersToShow.map((player: Player) => (
                    <option key={`p2-${player.id}`} value={player.id}>
                      {player.name} {!tournament.players.some(p => p.id === player.id) && "⭐"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="round" className="wtt-label">
            Round
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="round"
              id="round"
              required
              min="1"
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="scheduledTime" className="wtt-label">
            Scheduled Time (optional)
          </label>
          <div className="mt-1">
            <input
              type="datetime-local"
              name="scheduledTime"
              id="scheduledTime"
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="venue" className="wtt-label">
            Venue (optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="venue"
              id="venue"
              className="wtt-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="wtt-label">
            Notes (optional)
          </label>
          <div className="mt-1">
            <textarea
              name="notes"
              id="notes"
              rows={3}
              className="wtt-textarea"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitLoading}
            className="wtt-button"
          >
            {submitLoading ? 'Creating...' : 'Create Match'}
          </button>
        </div>
      </form>
    </div>
  )
} 