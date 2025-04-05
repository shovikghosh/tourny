'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/services/api'
import { Player, Tournament } from '@/types/match'
import Link from 'next/link'

export default function AddPlayersPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params?.id ? Number(params.id) : 0
  
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([])
  
  // Load tournament and all players
  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId) return
      
      setLoading(true)
      try {
        const [tournamentData, playersData] = await Promise.all([
          api.getTournament(tournamentId),
          api.getPlayers()
        ])
        
        setTournament(tournamentData)
        
        // Filter out players already in the tournament
        const tournamentPlayerIds = tournamentData.players.map((p: Player) => p.id)
        const availablePlayers = playersData.filter((player: Player) => 
          !tournamentPlayerIds.includes(player.id)
        )
        
        setAllPlayers(availablePlayers)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tournamentId])
  
  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      } else {
        return [...prev, playerId]
      }
    })
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (selectedPlayerIds.length === 0) {
      setError('Please select at least one player to add')
      return
    }
    
    setSubmitLoading(true)
    setError(null)

    try {
      // We need to add a new API method to add players to a tournament
      await api.addPlayersToTournament(tournamentId, selectedPlayerIds)
      router.push(`/tournaments/${tournamentId}`)
    } catch (err) {
      console.error('Error adding players:', err)
      setError(err instanceof Error ? err.message : 'Failed to add players to tournament')
    } finally {
      setSubmitLoading(false)
    }
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
    return <div>Tournament not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add Players</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add more players to {tournament.name}
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
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Players to Add
          </label>
          
          {allPlayers.length === 0 ? (
            <div className="text-center p-4 border rounded-md border-gray-200">
              <p className="text-sm text-gray-500">No additional players available to add.</p>
            </div>
          ) : (
            <div className="mt-1 max-h-56 overflow-y-auto border rounded-md border-gray-300 p-2">
              <div className="space-y-2">
                {allPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className="relative flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handlePlayerToggle(player.id)}
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.includes(player.id)}
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
          
          {allPlayers.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {selectedPlayerIds.length} player{selectedPlayerIds.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitLoading || allPlayers.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? 'Adding Players...' : 'Add Selected Players'}
          </button>
        </div>
      </form>
    </div>
  )
} 