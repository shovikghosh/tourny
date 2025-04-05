'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/services/api'
import { Tournament, Match } from '@/types/match'
import MatchScore from '@/components/MatchScore'
import Link from 'next/link'

export default function TournamentPage() {
  const params = useParams()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournament = async () => {
      if (!params?.id) return
      
      try {
        const data = await api.getTournament(Number(params.id))
        setTournament(data)
      } catch (error) {
        console.error('Error fetching tournament:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params?.id])

  const handleMatchScoreUpdate = (updatedMatch: Match) => {
    if (!tournament) return

    setTournament({
      ...tournament,
      matches: tournament.matches.map((match: Match) =>
        match.id === updatedMatch.id ? updatedMatch : match
      ),
    })
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!tournament) {
    return <div className="p-4">Tournament not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{tournament.name}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tournament Details</h2>
        <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
        <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
        <p>Status: {tournament.status}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Players</h2>
          <Link
            href={`/tournaments/${tournament.id}/players/add`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Players
          </Link>
        </div>
        {tournament.players && tournament.players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.players.map((player) => (
              <div key={player.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-gray-600">{player.email}</p>
                {player.rank && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Rank: {player.rank}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No players have been added to this tournament.</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Matches</h2>
          <Link
            href={`/tournaments/${tournament.id}/matches/new`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Match
          </Link>
        </div>
        <div className="grid gap-6">
          {tournament.matches.length === 0 ? (
            <p className="text-gray-500 italic">No matches have been created yet.</p>
          ) : (
            tournament.matches.map((match: Match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Round {match.round}</h3>
                    <p className="text-gray-600">
                      {match.player1.name} vs {match.player2.name}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Status: {match.status}
                  </div>
                </div>

                <MatchScore
                  match={match}
                  tournamentId={tournament.id}
                  onScoreUpdate={handleMatchScoreUpdate}
                />

                {match.venue && (
                  <p className="mt-2 text-sm text-gray-600">
                    Venue: {match.venue}
                  </p>
                )}
                {match.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    Notes: {match.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 