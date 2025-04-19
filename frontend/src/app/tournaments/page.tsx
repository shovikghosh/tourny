'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tournament } from '@/types/match'
import { api } from '@/services/api'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.getTournaments()
        setTournaments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-foreground">Tournaments</h1>
          <p className="text-muted-foreground">Manage your table tennis tournaments</p>
        </div>
        <Link
          href="/tournaments/new"
          className="wtt-button"
        >
          Create Tournament
        </Link>
      </div>

      {/* Tournaments grid */}
      {tournaments.length === 0 ? (
        <div className="wtt-card p-8 text-center">
          <div className="mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tournaments yet</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first tournament</p>
          <Link href="/tournaments/new" className="wtt-button">
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <Link 
              key={tournament.id} 
              href={`/tournaments/${tournament.id}`} 
              className="wtt-card-interactive h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
                  {tournament.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`wtt-status-badge ${
                    tournament.status === 'COMPLETED' 
                      ? 'wtt-status-badge-completed'
                      : tournament.status === 'IN_PROGRESS'
                      ? 'wtt-status-badge-in-progress'
                      : 'wtt-status-badge-pending'
                  }`}>
                    {tournament.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    {tournament.players.length} Players
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {tournament.matches.length} Matches
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 