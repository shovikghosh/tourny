package com.tournament.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class MatchScore {
    private List<SetScore> sets = new ArrayList<>();
    private int totalSets = 3; // Default number of sets

    @Data
    public static class SetScore {
        private Integer player1Score;
        private Integer player2Score;
    }

    public MatchScore() {
        // Initialize with empty sets
        for (int i = 0; i < totalSets; i++) {
            sets.add(new SetScore());
        }
    }

    public MatchScore(int totalSets) {
        this.totalSets = totalSets;
        // Initialize with empty sets
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
        return null;
    }

    public boolean isComplete() {
        return sets.stream().allMatch(set -> 
            set.getPlayer1Score() != null && set.getPlayer2Score() != null);
    }

    public int getPlayer1TotalScore() {
        return sets.stream()
            .mapToInt(set -> set.getPlayer1Score() != null ? set.getPlayer1Score() : 0)
            .sum();
    }

    public int getPlayer2TotalScore() {
        return sets.stream()
            .mapToInt(set -> set.getPlayer2Score() != null ? set.getPlayer2Score() : 0)
            .sum();
    }
} 