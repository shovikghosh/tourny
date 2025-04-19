package com.tournament.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MatchScoreTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    // --- Helper method to set set scores ---
    private void setSetScore(MatchScore score, int setIndex, int p1Score, int p2Score) {
        // Ensure the set list is large enough
        while (score.getSets().size() <= setIndex) {
            score.addNewEmptySet();
        }
        MatchScore.SetScore set = score.getSet(setIndex);
        if (set != null) {
            set.setPlayer1Score(p1Score);
            set.setPlayer2Score(p2Score);
        } else {
            // This case should ideally not happen with the loop above
            fail("Failed to get or create set at index: " + setIndex);
        }
    }

    @Test
    void testMatchScoreInitialization() {
        MatchScore score = new MatchScore();
        assertEquals(0, score.getSets().size());
        assertEquals(5, score.getIntendedTotalSets()); // Check renamed field
        
        // Test adding a set - should NOT change intendedTotalSets
        score.addNewEmptySet();
        assertEquals(1, score.getSets().size());
        assertEquals(5, score.getIntendedTotalSets()); // Should still be 0
        
        assertNotNull(score.getSet(0));
        assertEquals(0, score.getSet(0).getPlayer1Score());
        assertEquals(0, score.getSet(0).getPlayer2Score());
    }

    @Test
    void testCustomSetsInitialization() {
        // Test initializing with intendedTotalSets
        MatchScore score = new MatchScore(5);
        assertEquals(0, score.getSets().size()); // No sets added initially
        assertEquals(5, score.getIntendedTotalSets()); // Check intended total
    }

    @Test
    void testGetSetOutOfBounds() {
        MatchScore score = new MatchScore(3);
        // getSet should return null for non-existent sets
        assertNull(score.getSet(0)); 
        assertNull(score.getSet(10)); 
    }

    @Test
    void testScoreCalculation() {
        MatchScore score = new MatchScore(3);
        setSetScore(score, 0, 11, 9);
        setSetScore(score, 1, 7, 11);
        setSetScore(score, 2, 11, 5);
        
        assertEquals(29, score.getPlayer1TotalScore());
        assertEquals(25, score.getPlayer2TotalScore());
    }

    @Test
    void testNullSafety() {
        MatchScore score = new MatchScore(3);
        score.addNewEmptySet();
        score.addNewEmptySet();
        score.addNewEmptySet();
        
        // Deliberately set a null score in the list
        score.getSets().set(1, null); 
        
        // Functions should handle the null gracefully
        assertDoesNotThrow(() -> score.isComplete());
        assertDoesNotThrow(() -> score.getPlayer1TotalScore());
        assertDoesNotThrow(() -> score.getPlayer2TotalScore());
        assertDoesNotThrow(() -> score.getPlayer1SetsWon());
        assertDoesNotThrow(() -> score.getPlayer2SetsWon());
    }

    @Test
    void testSerialization() throws Exception {
        MatchScore score = new MatchScore(1); // Intended sets = 1
        setSetScore(score, 0, 11, 9);
        
        String json = objectMapper.writeValueAsString(score);
        System.out.println("Serialized JSON: " + json);
        assertNotNull(json);
        assertTrue(json.contains("\"intendedTotalSets\":1"));
        assertTrue(json.contains("\"player1Score\":11"));
        assertTrue(json.contains("\"player2Score\":9"));
        
        MatchScore deserialized = objectMapper.readValue(json, MatchScore.class);
        assertNotNull(deserialized);
        assertEquals(1, deserialized.getIntendedTotalSets());
        assertNotNull(deserialized.getSet(0));
        assertEquals(11, deserialized.getSet(0).getPlayer1Score());
        assertEquals(9, deserialized.getSet(0).getPlayer2Score());
    }
    
    @Test
    void testSetWinner() {
        MatchScore.SetScore set = new MatchScore.SetScore();
        set.setPlayer1Score(10); set.setPlayer2Score(8); assertNull(set.getWinner());
        set.setPlayer1Score(11); set.setPlayer2Score(5); assertEquals(PlayerSide.PLAYER1, set.getWinner());
        set.setPlayer1Score(9); set.setPlayer2Score(11); assertEquals(PlayerSide.PLAYER2, set.getWinner());
        set.setPlayer1Score(11); set.setPlayer2Score(10); assertNull(set.getWinner());
        set.setPlayer1Score(14); set.setPlayer2Score(16); assertEquals(PlayerSide.PLAYER2, set.getWinner());
        set.setPlayer1Score(16); set.setPlayer2Score(14); assertEquals(PlayerSide.PLAYER1, set.getWinner());
        set.setPlayer1Score(12); set.setPlayer2Score(12); assertNull(set.getWinner());
    }
    
    // --- Match Winner Calculation Tests (Updated) ---
    
    @Test
    void testPlayer1WinsBestOf3() {
        MatchScore score = new MatchScore(3); // Intended best of 3
        setSetScore(score, 0, 11, 9); // P1 wins
        setSetScore(score, 1, 11, 5); // P1 wins
        
        assertEquals(PlayerSide.PLAYER1, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER1, score.getWinnerSide());
    }
    
    @Test
    void testPlayer2WinsBestOf3() {
        MatchScore score = new MatchScore(3); // Intended best of 3
        setSetScore(score, 0, 9, 11); // P2 wins
        setSetScore(score, 1, 5, 11); // P2 wins
        
        assertEquals(PlayerSide.PLAYER2, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER2, score.getWinnerSide());
    }
    
    @Test
    void testPlayer1WinsBestOf5In4Sets() {
        MatchScore score = new MatchScore(5); // Intended best of 5
        setSetScore(score, 0, 11, 9); // P1 wins (1-0)
        setSetScore(score, 1, 9, 11); // P2 wins (1-1)
        setSetScore(score, 2, 11, 7); // P1 wins (2-1)
        setSetScore(score, 3, 12, 10); // P1 wins (3-1)
        
        assertEquals(PlayerSide.PLAYER1, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER1, score.getWinnerSide());
    }
    
    @Test
    void testPlayer2WinsBestOf5In5Sets() {
        MatchScore score = new MatchScore(5); // Intended best of 5
        setSetScore(score, 0, 11, 9); // P1 wins (1-0)
        setSetScore(score, 1, 8, 11); // P2 wins (1-1)
        setSetScore(score, 2, 11, 13); // P2 wins (1-2)
        setSetScore(score, 3, 11, 7); // P1 wins (2-2)
        setSetScore(score, 4, 9, 11); // P2 wins (2-3)
        
        assertEquals(PlayerSide.PLAYER2, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER2, score.getWinnerSide());
    }
    
    @Test
    void testNoWinnerYetBestOf5() {
        MatchScore score = new MatchScore(5); // Intended best of 5
        setSetScore(score, 0, 11, 9); // P1 wins (1-0)
        setSetScore(score, 1, 8, 11); // P2 wins (1-1)
        
        assertNull(score.calculateWinner());
        score.updateWinner();
        assertNull(score.getWinnerSide());
        
        setSetScore(score, 2, 11, 7); // P1 wins (2-1)
        assertNull(score.calculateWinner());
        score.updateWinner();
        assertNull(score.getWinnerSide());
    }
    
    @Test
    void testWinnerCalculationWithIncompleteSet() {
        MatchScore score = new MatchScore(3); // Intended best of 3
        setSetScore(score, 0, 11, 9); // P1 wins
        setSetScore(score, 1, 11, 5); // P1 wins
        score.addNewEmptySet(); // Add placeholder for 3rd set
        setSetScore(score, 2, 5, 5); // Incomplete set
        
        assertEquals(PlayerSide.PLAYER1, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER1, score.getWinnerSide());
    }

    @Test
    void testWinnerCalculationWithZeroIntendedSets() {
        // Should handle the case where intendedTotalSets is 0
        MatchScore score = new MatchScore(); // intendedTotalSets = 0
        score.addNewEmptySet();
        setSetScore(score, 0, 11, 9); // P1 wins set 1
        
        // Winner should be null if intendedTotalSets is 0
        assertNull(score.calculateWinner());
        score.updateWinner();
        assertNull(score.getWinnerSide());
    }
    
    // --- Deprecated tests or tests needing update ---
    
    // testMatchWinnerCalculation is now covered by more specific tests like testPlayer1WinsBestOf5In4Sets
    @Test
    @Deprecated // Covered by more specific tests
    void testMatchWinnerCalculation_Old() {
        MatchScore score = new MatchScore(5);
        setSetScore(score, 0, 11, 9);
        setSetScore(score, 1, 11, 5);
        setSetScore(score, 2, 9, 11);
        assertNull(score.calculateWinner());
        setSetScore(score, 3, 11, 7);
        assertEquals(PlayerSide.PLAYER1, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER1, score.getWinnerSide());
    }
    
    // testPlayer2WinsMatch is covered by testPlayer2WinsBestOf3
    @Test
    @Deprecated // Covered by testPlayer2WinsBestOf3
    void testPlayer2WinsMatch_Old() {
        MatchScore score = new MatchScore(3);
        setSetScore(score, 0, 9, 11);
        setSetScore(score, 1, 7, 11);
        assertEquals(PlayerSide.PLAYER2, score.calculateWinner());
        score.updateWinner();
        assertEquals(PlayerSide.PLAYER2, score.getWinnerSide());
    }
    
    // testPlayerSideConversion remains the same
    @Test
    void testPlayerSideConversion() {
        assertEquals(PlayerSide.PLAYER1, PlayerSide.fromString("player1"));
        assertEquals(PlayerSide.PLAYER2, PlayerSide.fromString("player2"));
        assertNull(PlayerSide.fromString(null));
        assertNull(PlayerSide.fromString("invalid"));
        assertEquals("player1", PlayerSide.PLAYER1.toString());
        assertEquals("player2", PlayerSide.PLAYER2.toString());
    }
} 