package com.tournament.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Embeddable
@Data
public class MatchScore {
    @ElementCollection
    @CollectionTable(name = "match_sets", joinColumns = @JoinColumn(name = "match_id"))
    private List<SetScore> sets = new ArrayList<>();
    
    @Column(name = "intended_total_sets")
    private int intendedTotalSets;
    
    @Column(name = "winner")
    private String winner; // Stored as string in DB for compatibility
    
    // Constants for game rules
    private static final int MIN_POINTS_TO_WIN = 11;
    private static final int MIN_POINT_DIFFERENCE = 2;

    @Embeddable
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SetScore {
        @Column(name = "player1_score")
        private Integer player1Score = 0;
        
        @Column(name = "player2_score")
        private Integer player2Score = 0;
        
        /**
         * Determine the winner of this set based on standard table tennis rules.
         * @return PlayerSide of the winner or null if no winner yet
         */
        public PlayerSide getWinner() {
            if (player1Score == null || player2Score == null) {
                return null;
            }
            
            // Check if minimum points are reached
            if (player1Score < MIN_POINTS_TO_WIN && player2Score < MIN_POINTS_TO_WIN) {
                return null; // No winner yet - neither player reached minimum points
            }
            
            // Check for minimum point difference
            int diff = Math.abs(player1Score - player2Score);
            if (diff < MIN_POINT_DIFFERENCE) {
                return null; // No winner yet - point difference too small
            }
            
            // Determine winner based on scores
            if (player1Score > player2Score) {
                return PlayerSide.PLAYER1;
            } else if (player2Score > player1Score) {
                return PlayerSide.PLAYER2;
            } else {
                // This case should theoretically not be reached if rules are followed,
                // but handle it defensively.
                return null;
            }
        }
        
        /**
         * Get score for the specified player side
         */
        public Integer getScoreForPlayer(PlayerSide side) {
            return side == PlayerSide.PLAYER1 ? player1Score : player2Score;
        }
    }

    /**
     * Default constructor initializes with no sets and unspecified intended total sets.
     */
    public MatchScore() {
        this.intendedTotalSets = 5; // Indicates format not yet set or single set match?
    }

    /**
     * Constructor that initializes for a specific match format (e.g., best of 3 or 5).
     * @param intendedTotalSets The total number of sets intended for the match (e.g., 3 or 5).
     */
    public MatchScore(int intendedTotalSets) {
        this.intendedTotalSets = intendedTotalSets;
        // Note: We don't pre-populate the sets list anymore based on intendedTotalSets.
        // Sets are added as they are played.
    }

    /**
     * Add a new set score to this match score.
     * Does NOT change intendedTotalSets.
     */
    public void addSet(SetScore set) {
        if (set != null) {
            this.sets.add(set);
        }
    }

    /**
     * Add a new empty set score placeholder.
     * Does NOT change intendedTotalSets.
     */
    public void addNewEmptySet() {
         this.sets.add(new SetScore());
    }
    
    /**
     * Get a set at the specified index.
     * Returns null if index is out of range or set doesn't exist.
     */
    public SetScore getSet(int index) {
        if (index >= 0 && index < sets.size()) {
            return sets.get(index);
        }
        return null; // Return null if set doesn't exist at index
    }

    /**
     * Check if the score is complete with all sets having valid scores
     */
    public boolean isComplete() {
        return sets.stream()
            .allMatch(set -> set != null && 
                      set.getPlayer1Score() != null && 
                      set.getPlayer2Score() != null);
    }

    /**
     * Get the total score for player 1 across all sets
     */
    public int getPlayer1TotalScore() {
        return getTotalScoreForPlayer(PlayerSide.PLAYER1);
    }

    /**
     * Get the total score for player 2 across all sets
     */
    public int getPlayer2TotalScore() {
        return getTotalScoreForPlayer(PlayerSide.PLAYER2);
    }
    
    /**
     * Get total score for a specific player across all sets
     */
    private int getTotalScoreForPlayer(PlayerSide side) {
        return sets.stream()
            .filter(set -> set != null)
            .mapToInt(set -> Optional.ofNullable(side == PlayerSide.PLAYER1 ? 
                       set.getPlayer1Score() : 
                       set.getPlayer2Score())
                     .orElse(0))
            .sum();
    }
    
    /**
     * Get the number of sets won by player 1
     */
    public int getPlayer1SetsWon() {
        return getSetsWonByPlayer(PlayerSide.PLAYER1);
    }
    
    /**
     * Get the number of sets won by player 2
     */
    public int getPlayer2SetsWon() {
        return getSetsWonByPlayer(PlayerSide.PLAYER2);
    }
    
    /**
     * Get number of sets won by a specific player
     */
    private int getSetsWonByPlayer(PlayerSide side) {
        return (int) sets.stream()
            .filter(set -> set != null && side.equals(set.getWinner()))
            .count();
    }
    
    /**
     * Get the winner of the match as a PlayerSide enum
     */
    public PlayerSide getWinnerSide() {
        return PlayerSide.fromString(winner);
    }
    
    /**
     * Set the winner of the match from a PlayerSide enum
     */
    public void setWinnerSide(PlayerSide side) {
        this.winner = side != null ? side.toString() : null;
    }
    
    /**
     * Determine the match winner based on sets won and the intended match format.
     * @return PlayerSide of the match winner, or null if no winner yet
     */
    public PlayerSide calculateWinner() {
        if (intendedTotalSets <= 0) {
            return null;
        }

        int player1Sets = getPlayer1SetsWon();
        int player2Sets = getSetsWonByPlayer(PlayerSide.PLAYER2);
        
        int setsToWin = (intendedTotalSets / 2) + 1;
        
        if (player1Sets >= setsToWin) {
            return PlayerSide.PLAYER1;
        } else if (player2Sets >= setsToWin) {
            return PlayerSide.PLAYER2;
        }
        
        return null; // No winner yet
    }
    
    /**
     * Update the winner field based on the current set scores and match format.
     */
    public void updateWinner() {
        PlayerSide winnerSide = calculateWinner();
        setWinnerSide(winnerSide);
    }
} 