import axios from 'axios';
import { Match, CreateMatchRequest, UpdateMatchScoreRequest, Tournament } from '@/types/match';

// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Create a configured axios instance that handles both absolute and relative URLs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
    // Tournament endpoints
    getTournaments: () => 
        apiClient.get<Tournament[]>(`/tournaments`).then(res => res.data),
    
    getTournament: (id: number) => 
        apiClient.get<Tournament>(`/tournaments/${id}`).then(res => res.data),
    
    createTournament: (data: any) => 
        apiClient.post<Tournament>(`/tournaments`, data).then(res => res.data),
    
    deleteTournament: (id: number) => 
        apiClient.delete(`/tournaments/${id}`),

    // Match endpoints
    createMatch: (tournamentId: number, data: CreateMatchRequest) => 
        apiClient.post<Match>(`/tournaments/${tournamentId}/matches`, data)
            .then(res => res.data),
    
    updateMatchScore: (tournamentId: number, matchId: number, data: UpdateMatchScoreRequest) => 
        apiClient.put(`/tournaments/${tournamentId}/matches/${matchId}`, data)
            .then(res => res.data),
}; 