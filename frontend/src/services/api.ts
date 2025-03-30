import axios from 'axios';
import { Tournament, MatchScore } from '@/types/types';

const API_BASE_URL = 'http://localhost:8080/api';

export const tournamentApi = {
  getAll: async (): Promise<Tournament[]> => {
    const response = await axios.get(`${API_BASE_URL}/tournaments`);
    return response.data;
  },

  getById: async (id: number): Promise<Tournament> => {
    const response = await axios.get(`${API_BASE_URL}/tournaments/${id}`);
    return response.data;
  },

  create: async (tournament: Omit<Tournament, 'id'>): Promise<Tournament> => {
    const response = await axios.post(`${API_BASE_URL}/tournaments`, tournament);
    return response.data;
  },

  updateMatchScore: async (
    tournamentId: number,
    matchId: number,
    score: MatchScore
  ): Promise<void> => {
    await axios.put(
      `${API_BASE_URL}/tournaments/${tournamentId}/matches/${matchId}`,
      score
    );
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/tournaments/${id}`);
  },
}; 