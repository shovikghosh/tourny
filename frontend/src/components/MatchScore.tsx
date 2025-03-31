'use client';

import { useState } from 'react';
import { Match, Set } from '@/types/match';
import { api } from '@/services/api';

interface MatchScoreProps {
    match: Match;
    tournamentId: number;
    onScoreUpdate: (updatedMatch: Match) => void;
}

export default function MatchScore({ match, tournamentId, onScoreUpdate }: MatchScoreProps) {
    const [currentSet, setCurrentSet] = useState<Set>({
        player1Score: 0,
        player2Score: 0,
    });

    const handleScoreUpdate = async (player: 'player1' | 'player2') => {
        const newScore = player === 'player1' 
            ? currentSet.player1Score + 1 
            : currentSet.player2Score + 1;

        const updatedSet = {
            ...currentSet,
            [player === 'player1' ? 'player1Score' : 'player2Score']: newScore,
        };

        // Check if set is complete (11 points and 2 points ahead)
        if (newScore >= 11 && Math.abs(newScore - (player === 'player1' ? currentSet.player2Score : currentSet.player1Score)) >= 2) {
            updatedSet.winner = player;
            
            // Create new set if match isn't complete
            if (match.score.sets.length < 4) {
                setCurrentSet({ player1Score: 0, player2Score: 0 });
            }

            // Update match score
            const updatedSets = [...match.score.sets, updatedSet];
            const updatedMatch = await api.updateMatchScore(tournamentId, match.id, {
                sets: updatedSets,
            });
            onScoreUpdate(updatedMatch);
        } else {
            setCurrentSet(updatedSet);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                    <h3 className="font-semibold">{match.player1.name}</h3>
                    <p className="text-2xl">{currentSet.player1Score}</p>
                    <button
                        onClick={() => handleScoreUpdate('player1')}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={match.status === 'COMPLETED'}
                    >
                        Add Point
                    </button>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold">{match.player2.name}</h3>
                    <p className="text-2xl">{currentSet.player2Score}</p>
                    <button
                        onClick={() => handleScoreUpdate('player2')}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={match.status === 'COMPLETED'}
                    >
                        Add Point
                    </button>
                </div>
            </div>

            {/* Display completed sets */}
            {match.score.sets.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Completed Sets:</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {match.score.sets.map((set, index) => (
                            <div key={index} className="text-center">
                                <p className="font-medium">Set {index + 1}</p>
                                <p>{set.player1Score} - {set.player2Score}</p>
                                <p className="text-sm text-gray-600">
                                    Winner: {set.winner === 'player1' ? match.player1.name : match.player2.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display match winner if completed */}
            {match.status === 'COMPLETED' && match.score.winner && (
                <div className="mt-4 text-center">
                    <h3 className="font-semibold text-lg">
                        Winner: {match.score.winner === 'player1' ? match.player1.name : match.player2.name}
                    </h3>
                </div>
            )}
        </div>
    );
} 