import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchScoreComponent from '../MatchScore'; // Renamed import to avoid conflict
import { Match, Player, Set, MatchScore } from '@/types/match'; // Import MatchScore type
import { api } from '@/services/api';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import actual theme provider

// Mock the API module
jest.mock('@/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Use the actual ThemeProvider for accurate rendering
const theme = createTheme(); // Create a default theme
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Mock data
const mockPlayer1: Player = { id: 1, name: 'Alice', email: 'alice@example.com', rank: 1500, active: true };
const mockPlayer2: Player = { id: 2, name: 'Bob', email: 'bob@example.com', rank: 1450, active: true };

// Define a base mock score - Adjust based on your actual MatchScore type definition
const baseMockScore: MatchScore = {
  sets: [] as Set[],
  winner: undefined,
  // Assuming these exist based on previous errors/usage. 
  // **Verify these against your actual `MatchScore` type in `match.ts`**
  player1TotalScore: 0,
  player2TotalScore: 0,
  player1SetsWon: 0,
  player2SetsWon: 0,
  intendedTotalSets: 3,
};

const mockMatch: Match = {
  id: 101,
  player1: mockPlayer1,
  player2: mockPlayer2,
  round: 1,
  status: 'IN_PROGRESS',
  score: baseMockScore, // Use the typed score object
  tournament: { id: 1, name: 'Test Tournament', startDate: '', endDate: '', players: [], matches: [], status: 'IN_PROGRESS' },
  scheduledTime: new Date().toISOString(),
  venue: 'Main Hall'
};

describe('<MatchScoreComponent />', () => { // Use renamed component
  let onScoreUpdateMock: jest.Mock;

  beforeEach(() => {
    onScoreUpdateMock = jest.fn();
    mockedApi.updateMatchScore.mockClear();
    
    const updatedScore = { 
      ...baseMockScore,
      sets: [{ player1Score: 1, player2Score: 0 }] as Set[]
    };
    mockedApi.updateMatchScore.mockResolvedValue({
      updatedMatch: { ...mockMatch, score: updatedScore },
      scoreUpdateStatus: 'SET_IN_PROGRESS',
    });
  });

  it('renders player names and initial scores', () => {
    render(
      <MockThemeProvider>
        <MatchScoreComponent match={mockMatch} tournamentId={1} onScoreUpdate={onScoreUpdateMock} />
      </MockThemeProvider>
    );

    expect(screen.getByText(mockPlayer1.name)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer2.name)).toBeInTheDocument();
    const scoreDisplays = screen.getAllByRole('heading', { level: 3 });
    expect(scoreDisplays[0]).toHaveTextContent('0'); 
    expect(scoreDisplays[1]).toHaveTextContent('0');
  });

  it('allows direct score input and triggers update on blur if set completes', async () => {
     const completedSet: Set = { player1Score: 11, player2Score: 5, winner: 'player1' };
     // Define the expected score state AFTER the update
     const expectedScoreState: MatchScore = { 
        ...baseMockScore, 
        sets: [completedSet], 
        player1SetsWon: 1, // Assuming this gets updated
        // Recalculate total scores if necessary
        player1TotalScore: 11, 
        player2TotalScore: 5,
     };
     const updatedMatchState: Match = { 
        ...mockMatch, 
        score: expectedScoreState
     };
     mockedApi.updateMatchScore.mockResolvedValueOnce({
        updatedMatch: updatedMatchState,
        scoreUpdateStatus: 'SET_COMPLETED_MATCH_IN_PROGRESS',
      });

    render(
      <MockThemeProvider>
        <MatchScoreComponent match={mockMatch} tournamentId={1} onScoreUpdate={onScoreUpdateMock} />
      </MockThemeProvider>
    );

    const scoreDisplayP1 = screen.getByText(mockPlayer1.name).closest('.MuiGrid-item')?.querySelector('h3');
    expect(scoreDisplayP1).toHaveTextContent('0');
    fireEvent.click(scoreDisplayP1!); 

    const inputFieldP1 = await screen.findByDisplayValue('');
    fireEvent.change(inputFieldP1, { target: { value: '11' } });
    expect(inputFieldP1).toHaveValue('11'); 

    const scoreDisplayP2 = screen.getByText(mockPlayer2.name).closest('.MuiGrid-item')?.querySelector('h3');
    fireEvent.click(scoreDisplayP2!); 
    const inputFieldP2 = await screen.findByDisplayValue(''); // Find the new input
    fireEvent.change(inputFieldP2, { target: { value: '5' } });
    fireEvent.blur(inputFieldP2); 
    await screen.findByText('5'); 

    fireEvent.blur(inputFieldP1);

    await waitFor(() => {
      expect(mockedApi.updateMatchScore).toHaveBeenCalledTimes(1);
    });
    // Construct the expected payload based on component logic
    const expectedPayload = { 
        sets: [ { player1Score: 11, player2Score: 5, winner: 'player1' } ] 
    };
    expect(mockedApi.updateMatchScore).toHaveBeenCalledWith(1, 101, expectedPayload);

    await waitFor(() => {
        expect(onScoreUpdateMock).toHaveBeenCalledWith(updatedMatchState);
    });

    const finalScoreDisplays = screen.getAllByRole('heading', { level: 3 });
    expect(finalScoreDisplays[0]).toHaveTextContent('0'); 
    expect(finalScoreDisplays[1]).toHaveTextContent('0');
  });
}); 