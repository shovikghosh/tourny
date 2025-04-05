package com.tournament.model;

/**
 * Represents the sides of players in a match.
 */
public enum PlayerSide {
    PLAYER1,
    PLAYER2;
    
    @Override
    public String toString() {
        return this.name().toLowerCase();
    }
    
    /**
     * Get PlayerSide from a string representation
     */
    public static PlayerSide fromString(String side) {
        if (side == null) {
            return null;
        }
        
        return "player1".equalsIgnoreCase(side) ? PLAYER1 : 
               "player2".equalsIgnoreCase(side) ? PLAYER2 : null;
    }
} 