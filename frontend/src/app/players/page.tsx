'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Player } from '@/types/match'
import { api } from '@/services/api'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await api.getPlayers()
        setPlayers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Players</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all players in the system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/players/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-foreground shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Player
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border shadow overflow-hidden rounded-md">
        {players.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No players found. Add a player to get started.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {players.map((player) => (
              <li key={player.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {player.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {player.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/20 text-primary">
                            Rank: {player.rank || 'Unranked'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            player.active 
                              ? 'bg-green-600/20 text-green-500' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {player.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 