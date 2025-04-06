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

    const updatedMatches = tournament.matches.map((match: Match) =>
      match.id === updatedMatch.id ? updatedMatch : match
    );

    setTournament({
      ...tournament,
      matches: updatedMatches,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="wtt-card p-8 text-center">
        <h3 className="text-xl font-semibold text-foreground">Tournament not found</h3>
        <p className="text-muted-foreground mt-2 mb-4">The tournament you're looking for doesn't exist or has been removed.</p>
        <Link href="/tournaments" className="wtt-button">
          Back to Tournaments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Tournament header */}
      <div className="wtt-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-foreground text-3xl">{tournament.name}</h1>
                <span className={`wtt-status-badge ${
                  tournament.status === 'COMPLETED' 
                    ? 'wtt-status-badge-completed'
                    : tournament.status === 'IN_PROGRESS'
                    ? 'wtt-status-badge-in-progress'
                    : 'wtt-status-badge-pending'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <p className="text-muted-foreground">
                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/tournaments"
                className="inline-flex items-center px-3 py-2 border border-border text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Players section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-foreground text-2xl">Players</h2>
          <Link
            href={`/tournaments/${tournament.id}/players/add`}
            className="wtt-button bg-green-600 hover:bg-green-700"
          >
            Add Players
          </Link>
        </div>
        
        {tournament.players && tournament.players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.players.map((player) => (
              <div key={player.id} className="wtt-card p-4 hover:border-primary/50 transition-colors">
                <h3 className="text-foreground font-semibold">{player.name}</h3>
                <p className="text-sm text-muted-foreground">{player.email}</p>
                {player.rank && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                      Rank: {player.rank}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="wtt-card p-8 text-center">
            <p className="text-muted-foreground mb-4">No players have been added to this tournament.</p>
            <Link href={`/tournaments/${tournament.id}/players/add`} className="wtt-button">
              Add Players
            </Link>
          </div>
        )}
      </div>

      {/* Matches section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-foreground text-2xl">Matches</h2>
          <Link
            href={`/tournaments/${tournament.id}/matches/new`}
            className="wtt-button"
          >
            Add Match
          </Link>
        </div>
        
        {tournament.matches.length === 0 ? (
          <div className="wtt-card p-8 text-center">
            <p className="text-muted-foreground mb-4">No matches have been created yet.</p>
            <Link href={`/tournaments/${tournament.id}/matches/new`} className="wtt-button">
              Create First Match
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tournament.matches.map((match: Match) => (
              <div key={match.id} className="wtt-card overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-semibold">Round {match.round}</h3>
                        <span className={`wtt-status-badge ${
                          match.status === 'COMPLETED' 
                            ? 'wtt-status-badge-completed'
                            : match.status === 'IN_PROGRESS'
                            ? 'wtt-status-badge-in-progress'
                            : 'wtt-status-badge-pending'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {match.player1.name} vs {match.player2.name}
                      </p>
                    </div>
                  </div>

                  <MatchScore
                    match={match}
                    tournamentId={tournament.id}
                    onScoreUpdate={handleMatchScoreUpdate}
                  />

                  <div className="mt-3 space-y-1">
                    {match.venue && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {match.venue}
                      </p>
                    )}
                    {match.notes && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {match.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 