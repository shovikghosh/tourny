import axios from 'axios';
import { Match, CreateMatchRequest, UpdateMatchScoreRequest, Tournament } from '@/types/match';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL environment variable is not defined');
}

export const api = {
    // Tournament endpoints
    getTournaments: () => 
        axios.get<Tournament[]>(`${API_BASE_URL}/tournaments`).then(res => res.data),
    
    getTournament: (id: number) => 
        axios.get<Tournament>(`${API_BASE_URL}/tournaments/${id}`).then(res => res.data),
    
    createTournament: (data: any) => 
        axios.post<Tournament>(`${API_BASE_URL}/tournaments`, data).then(res => res.data),
    
    deleteTournament: (id: number) => 
        axios.delete(`${API_BASE_URL}/tournaments/${id}`),

    // Match endpoints
    createMatch: (tournamentId: number, data: CreateMatchRequest) => 
        axios.post<Match>(`${API_BASE_URL}/tournaments/${tournamentId}/matches`, data)
            .then(res => res.data),
    
    updateMatchScore: (tournamentId: number, matchId: number, data: UpdateMatchScoreRequest) => 
        axios.put(`${API_BASE_URL}/tournaments/${tournamentId}/matches/${matchId}`, data)
            .then(res => res.data),
}; 