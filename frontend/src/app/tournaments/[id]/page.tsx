'use client'

import { useEffect, useState } from 'react'
import { Tournament } from '@/types/types'
import { tournamentApi } from '@/services/api'

export default function TournamentPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await tournamentApi.getById(parseInt(params.id))
        setTournament(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params.id])

  const handleUpdateScore = async (matchId: number, score1: number, score2: number) => {
    try {
      await tournamentApi.updateMatchScore(parseInt(params.id), matchId, { score1, score2 })
      // Refresh tournament data
      const updatedTournament = await tournamentApi.getById(parseInt(params.id))
      setTournament(updatedTournament)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (!tournament) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Not Found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Tournament not found</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {tournament.name}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
            <p>Status: {tournament.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Players
          </h3>
          <div className="mt-4">
            <ul className="divide-y divide-gray-200">
              {tournament.players.map((player) => (
                <li key={player.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-500">{player.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Matches
          </h3>
          <div className="mt-4">
            <ul className="divide-y divide-gray-200">
              {tournament.matches.map((match) => (
                <li key={match.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {match.player1.name} vs {match.player2.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Round {match.round}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        match.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : match.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                  {match.status === 'COMPLETED' ? (
                    <div className="mt-2 text-sm text-gray-500">
                      Score: {match.score1} - {match.score2}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button
                        onClick={() => handleUpdateScore(match.id, 11, 9)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Update Score
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 