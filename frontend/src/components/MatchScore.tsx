'use client';

import { useState, useEffect } from 'react';
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
    
    // Reset the current set when match data changes from outside
    useEffect(() => {
        if (match.status === 'COMPLETED') {
            setCurrentSet({ player1Score: 0, player2Score: 0 });
        }
    }, [match.status, match.score.sets.length]);

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
            
            try {
                // Update match score
                const updatedSets = [...match.score.sets, updatedSet];
                const updatedMatch = await api.updateMatchScore(tournamentId, match.id, {
                    sets: updatedSets,
                });
                
                console.log("Received updated match from API:", updatedMatch);

                // Ensure the latest set winner is reflected in the object passed upwards
                // This acts as a safeguard if the API response doesn't immediately reflect the winner of the set just finished.
                if (updatedMatch && updatedMatch.score && updatedMatch.score.sets) {
                    const lastSetIndex = updatedMatch.score.sets.length - 1;
                    if (lastSetIndex >= 0 && updatedSet.winner && !updatedMatch.score.sets[lastSetIndex].winner) {
                        // If API didn't return the winner for the last set, use the one we calculated
                        updatedMatch.score.sets[lastSetIndex].winner = updatedSet.winner;
                        console.log("Manually added winner to last set in updatedMatch"); // Debug log
                    }
                }
                
                // Reset the current set immediately only if the match is not completed
                if (updatedMatch.status !== 'COMPLETED') {
                  setCurrentSet({ player1Score: 0, player2Score: 0 });
                }
                
                // Notify parent component about the update
                onScoreUpdate(updatedMatch);
            } catch (error) {
                console.error("Failed to update match score:", error);
                // Keep the local state if the API call fails
                // Maybe show an error message to the user
            }
        } else {
            setCurrentSet(updatedSet);
        }
    };

    return (
        <div className="space-y-6">
            {/* Current set score */}
            {(match.status === 'PENDING' || match.status === 'IN_PROGRESS') && (
                <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="text-foreground font-medium mb-4 text-center">Current Set</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-bold">P1</span>
                                </div>
                                <h3 className="font-semibold text-foreground ml-2">{match.player1.name}</h3>
                            </div>
                            <p className="text-4xl font-bold text-foreground">{currentSet.player1Score}</p>
                            <button
                                onClick={() => handleScoreUpdate('player1')}
                                className="mt-3 px-4 py-2 bg-primary text-foreground rounded-md hover:bg-primary/90 transition-colors"
                                disabled={match.status !== 'PENDING' && match.status !== 'IN_PROGRESS'}
                            >
                                Add Point
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <span className="text-secondary font-bold">P2</span>
                                </div>
                                <h3 className="font-semibold text-foreground ml-2">{match.player2.name}</h3>
                            </div>
                            <p className="text-4xl font-bold text-foreground">{currentSet.player2Score}</p>
                            <button
                                onClick={() => handleScoreUpdate('player2')}
                                className="mt-3 px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                disabled={match.status !== 'PENDING' && match.status !== 'IN_PROGRESS'}
                            >
                                Add Point
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Completed sets */}
            {match.score.sets.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="text-foreground font-medium mb-4">Completed Sets</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-2 px-4 text-left text-muted-foreground">Set</th>
                                    <th className="py-2 px-4 text-center text-muted-foreground">{match.player1.name}</th>
                                    <th className="py-2 px-4 text-center text-muted-foreground">{match.player2.name}</th>
                                    <th className="py-2 px-4 text-right text-muted-foreground">Winner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {match.score.sets.map((set, index) => (
                                    <tr key={`set-${index}-${set.player1Score}-${set.player2Score}`} className="border-b border-border/50">
                                        <td className="py-2 px-4 text-left text-muted-foreground">{index + 1}</td>
                                        <td className="py-2 px-4 text-center text-foreground font-medium">{set.player1Score}</td>
                                        <td className="py-2 px-4 text-center text-foreground font-medium">{set.player2Score}</td>
                                        <td className="py-2 px-4 text-right">
                                            {set.winner && (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    set.winner === 'player1' 
                                                        ? 'bg-primary/20 text-primary' 
                                                        : 'bg-secondary/20 text-secondary'
                                                }`}>
                                                    {set.winner === 'player1' ? match.player1.name : match.player2.name}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Match winner */}
            {match.status === 'COMPLETED' && match.score.winner && (
                <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-center">
                    <h3 className="font-bold text-foreground text-xl">
                        Winner: {match.score.winner === 'player1' ? match.player1.name : match.player2.name}
                    </h3>
                </div>
            )}
        </div>
    );
} 