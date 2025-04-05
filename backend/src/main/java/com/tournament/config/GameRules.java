package com.tournament.config;

import org.springframework.stereotype.Component;

/**
 * Configuration class that contains the rules for table tennis matches.
 * Centralizing these values makes it easier to modify game rules in the future.
 */
@Component
public class GameRules {
    /**
     * Minimum points needed to win a set
     */
    private final int minimumPointsToWinSet = 11;
    
    /**
     * Minimum point difference needed to win a set
     */
    private final int minimumPointDifference = 2;
    
    /**
     * Get the minimum points required to win a set
     */
    public int getMinimumPointsToWinSet() {
        return minimumPointsToWinSet;
    }
    
    /**
     * Get the minimum point difference required to win a set
     */
    public int getMinimumPointDifference() {
        return minimumPointDifference;
    }
    
    /**
     * Calculate the number of sets needed to win a match (best of N)
     */
    public int getSetsNeededToWin(int totalSets) {
        return (totalSets / 2) + 1;
    }
} 