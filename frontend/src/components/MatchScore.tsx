'use client';

import { useState, useEffect } from 'react';
import { Match, Set, UpdateMatchScoreRequest } from '@/types/match';
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

        // Create the updated set object based on the new score
        const potentiallyUpdatedSet = {
            ...currentSet,
            [player === 'player1' ? 'player1Score' : 'player2Score']: newScore,
        };

        // --- Determine if this point completes the set --- 
        let setCompletedByThisPoint = false;
        let thisSetWinner: ('player1' | 'player2' | undefined) = undefined;
        if (newScore >= 11 && Math.abs(newScore - (player === 'player1' ? potentiallyUpdatedSet.player2Score : potentiallyUpdatedSet.player1Score)) >= 2) {
            setCompletedByThisPoint = true;
            thisSetWinner = player;
            potentiallyUpdatedSet.winner = thisSetWinner; // Set winner on the temporary object
        }

        if (setCompletedByThisPoint) {
            // --- If set is completed by this point --- 
            try {
                // Prepare the score payload to send to the backend
                // Includes all previous sets plus the one just completed
                const scorePayload: UpdateMatchScoreRequest = {
                    sets: [...match.score.sets, potentiallyUpdatedSet],
                    // We could potentially send intendedTotalSets here if we allow changing match format
                };

                // Call the API
                const response = await api.updateMatchScore(tournamentId, match.id, scorePayload);
                
                console.log("API Response:", response); // Debug log

                // Handle based on the status returned from backend
                switch (response.scoreUpdateStatus) {
                    case 'MATCH_COMPLETED':
                        // Match is over, no need to reset currentSet for scoring
                        setCurrentSet({ player1Score: 0, player2Score: 0 }); // Clear local input 
                        break;
                    case 'SET_COMPLETED_MATCH_IN_PROGRESS':
                        // Set finished, match continues. Reset for next set.
                        setCurrentSet({ player1Score: 0, player2Score: 0 }); 
                        break;
                    case 'SET_IN_PROGRESS': // Should not happen if setCompletedByThisPoint is true, but handle defensively
                         setCurrentSet(potentiallyUpdatedSet); // Keep current score if backend says set not over
                         break;
                }
                
                // Notify parent component with the full updated match state from backend
                onScoreUpdate(response.updatedMatch);
                
            } catch (error) {
                console.error("Failed to update match score:", error);
                // Revert local state? Show error?
                // For now, we don't update the parent state on error.
            }

        } else {
             // --- If set is NOT completed by this point --- 
            // Just update the local state for the current set
            setCurrentSet(potentiallyUpdatedSet); 
            // No API call needed yet, just update local display
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
                                {match.score.sets.map((set, index) => {
                                    // --- DEBUG LOGGING ---
                                    console.log(`Rendering Set ${index + 1}:`, JSON.stringify(set)); 
                                    // --- END DEBUG LOGGING ---
                                    return (
                                        <tr key={`set-${index}-${set?.player1Score}-${set?.player2Score}`} className="border-b border-border/50">
                                            <td className="py-2 px-4 text-left text-muted-foreground">{index + 1}</td>
                                            <td className="py-2 px-4 text-center text-foreground font-medium">{set?.player1Score ?? 'N/A'}</td>
                                            <td className="py-2 px-4 text-center text-foreground font-medium">{set?.player2Score ?? 'N/A'}</td>
                                            <td className="py-2 px-4 text-right">
                                                {set?.winner && (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        set.winner?.toLowerCase() === 'player1' 
                                                            ? 'bg-primary/20 text-primary' 
                                                            : 'bg-secondary/20 text-secondary'
                                                    }`}>
                                                        {set.winner?.toLowerCase() === 'player1' ? match.player1.name : match.player2.name}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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