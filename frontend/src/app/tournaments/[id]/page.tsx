'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/services/api'
import { Tournament, Match } from '@/types/match'
import MatchScore from '@/components/MatchScore'

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

      <div>
        <h2 className="text-xl font-semibold mb-4">Matches</h2>
        <div className="grid gap-6">
          {tournament.matches.map((match: Match) => (
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
          ))}
        </div>
      </div>
    </div>
  )
} 