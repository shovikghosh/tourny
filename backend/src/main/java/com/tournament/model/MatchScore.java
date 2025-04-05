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
    
    @Column
    private int totalSets = 0; // Default to 0 sets initially
    
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
            
            // Both players must have valid scores
            if (player1Score < MIN_POINTS_TO_WIN && player2Score < MIN_POINTS_TO_WIN) {
                return null; // No winner yet - neither player reached minimum points
            }
            
            int diff = Math.abs(player1Score - player2Score);
            if (diff < MIN_POINT_DIFFERENCE) {
                return null; // No winner yet - point difference too small
            }
            
            // Determine winner based on higher score
            return player1Score > player2Score ? PlayerSide.PLAYER1 : PlayerSide.PLAYER2;
        }
        
        /**
         * Get score for the specified player side
         */
        public Integer getScoreForPlayer(PlayerSide side) {
            return side == PlayerSide.PLAYER1 ? player1Score : player2Score;
        }
    }

    /**
     * Default constructor initializes with no sets
     */
    public MatchScore() {
        // Empty constructor - initializes with no sets by default
    }

    /**
     * Constructor that initializes with a specific number of sets
     */
    public MatchScore(int totalSets) {
        this.totalSets = totalSets;
        for (int i = 0; i < totalSets; i++) {
            sets.add(new SetScore());
        }
    }

    /**
     * Add a new set to this match
     */
    public void addSet() {
        sets.add(new SetScore());
        totalSets++;
    }

    /**
     * Get a set at the specified index, or a new empty set if index is out of range
     */
    public SetScore getSet(int index) {
        if (index >= 0 && index < sets.size()) {
            return sets.get(index);
        }
        return new SetScore(); // Return a new SetScore instead of null
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
            .filter(set -> set != null)
            .filter(set -> side.equals(set.getWinner()))
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
     * Determine the match winner based on sets won.
     * A player must win the majority of sets to win the match.
     * @return PlayerSide of the match winner, or null if no winner yet
     */
    public PlayerSide calculateWinner() {
        int player1Sets = getPlayer1SetsWon();
        int player2Sets = getPlayer2SetsWon();
        
        // If no totalSets is specified or not enough sets are played yet,
        // don't calculate a winner
        if (totalSets == 0) {
            return null;
        }
        
        // Calculate the minimum sets needed to win (best of N)
        int setsToWin = (totalSets / 2) + 1;
        
        if (player1Sets >= setsToWin) {
            return PlayerSide.PLAYER1;
        } else if (player2Sets >= setsToWin) {
            return PlayerSide.PLAYER2;
        }
        
        return null; // No winner yet
    }
    
    /**
     * Update the winner field based on the current set scores.
     * Should be called whenever the score is updated.
     */
    public void updateWinner() {
        PlayerSide winnerSide = calculateWinner();
        setWinnerSide(winnerSide);
    }
} 