package com.tournament.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
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
    private String winner; // "player1", "player2", or null if no winner yet

    @Embeddable
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SetScore {
        @Column(name = "player1_score")
        private Integer player1Score = 0;
        
        @Column(name = "player2_score")
        private Integer player2Score = 0;
        
        // Helper method to determine set winner
        public String getWinner() {
            if (player1Score == null || player2Score == null) {
                return null;
            }
            
            if (player1Score < 11 && player2Score < 11) {
                return null; // No winner yet
            }
            
            int diff = Math.abs(player1Score - player2Score);
            if (diff < 2) {
                return null; // Difference must be at least 2 points
            }
            
            return player1Score > player2Score ? "player1" : "player2";
        }
    }

    public MatchScore() {
        // Initialize with no sets by default
    }

    public MatchScore(int totalSets) {
        this.totalSets = totalSets;
        // Initialize with the specified number of sets
        for (int i = 0; i < totalSets; i++) {
            sets.add(new SetScore());
        }
    }

    public void addSet() {
        sets.add(new SetScore());
        totalSets++;
    }

    public SetScore getSet(int index) {
        if (index >= 0 && index < sets.size()) {
            return sets.get(index);
        }
        // Return a new SetScore instead of null
        return new SetScore();
    }

    public boolean isComplete() {
        return sets.stream().allMatch(set -> 
            set != null && set.getPlayer1Score() != null && set.getPlayer2Score() != null);
    }

    public int getPlayer1TotalScore() {
        return sets.stream()
            .filter(set -> set != null)
            .mapToInt(set -> set.getPlayer1Score() != null ? set.getPlayer1Score() : 0)
            .sum();
    }

    public int getPlayer2TotalScore() {
        return sets.stream()
            .filter(set -> set != null)
            .mapToInt(set -> set.getPlayer2Score() != null ? set.getPlayer2Score() : 0)
            .sum();
    }
    
    public int getPlayer1SetsWon() {
        return (int) sets.stream()
            .filter(set -> set != null)
            .filter(set -> "player1".equals(set.getWinner()))
            .count();
    }
    
    public int getPlayer2SetsWon() {
        return (int) sets.stream()
            .filter(set -> set != null)
            .filter(set -> "player2".equals(set.getWinner()))
            .count();
    }
    
    /**
     * Determines the match winner based on sets won.
     * A player must win the majority of sets to win the match.
     */
    public String calculateWinner() {
        int player1Sets = getPlayer1SetsWon();
        int player2Sets = getPlayer2SetsWon();
        
        // Calculate the minimum sets needed to win (best of N)
        int setsToWin = (totalSets / 2) + 1;
        
        if (player1Sets >= setsToWin) {
            return "player1";
        } else if (player2Sets >= setsToWin) {
            return "player2";
        }
        
        return null; // No winner yet
    }
    
    /**
     * Updates the winner field based on the current set scores.
     * Should be called whenever the score is updated.
     */
    public void updateWinner() {
        this.winner = calculateWinner();
    }
} 