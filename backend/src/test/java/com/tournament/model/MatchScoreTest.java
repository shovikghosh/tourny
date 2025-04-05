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

    @Test
    void testMatchScoreInitialization() {
        // Test that a new MatchScore is properly initialized
        MatchScore score = new MatchScore();
        
        // Should have 0 sets by default
        assertEquals(0, score.getSets().size());
        assertEquals(0, score.getTotalSets());
        
        // Test adding a set
        score.addSet();
        assertEquals(1, score.getSets().size());
        assertEquals(1, score.getTotalSets());
        
        // The added set should be initialized with zeros
        assertNotNull(score.getSet(0));
        assertEquals(0, score.getSet(0).getPlayer1Score());
        assertEquals(0, score.getSet(0).getPlayer2Score());
    }

    @Test
    void testCustomSetsInitialization() {
        // Test custom total sets
        MatchScore score = new MatchScore(5);
        
        assertEquals(5, score.getSets().size());
        assertEquals(5, score.getTotalSets());
    }

    @Test
    void testGetSetOutOfBounds() {
        MatchScore score = new MatchScore(0);
        
        // Test that getting a set index out of bounds returns new SetScore not null
        assertNotNull(score.getSet(10));
        assertEquals(0, score.getSet(10).getPlayer1Score());
    }

    @Test
    void testScoreCalculation() {
        MatchScore score = new MatchScore(3);
        
        // Set some scores
        score.getSet(0).setPlayer1Score(11);
        score.getSet(0).setPlayer2Score(9);
        
        score.getSet(1).setPlayer1Score(7);
        score.getSet(1).setPlayer2Score(11);
        
        score.getSet(2).setPlayer1Score(11);
        score.getSet(2).setPlayer2Score(5);
        
        // Test total scores
        assertEquals(29, score.getPlayer1TotalScore());
        assertEquals(25, score.getPlayer2TotalScore());
    }

    @Test
    void testNullSafety() {
        MatchScore score = new MatchScore(3);
        
        // Deliberately set a null score
        score.getSets().set(1, null);
        
        // Functions should handle the null gracefully
        assertDoesNotThrow(() -> score.isComplete());
        assertDoesNotThrow(() -> score.getPlayer1TotalScore());
        assertDoesNotThrow(() -> score.getPlayer2TotalScore());
    }

    @Test
    void testSerialization() throws Exception {
        MatchScore score = new MatchScore(1);
        score.getSet(0).setPlayer1Score(11);
        score.getSet(0).setPlayer2Score(9);
        
        // Test that it can be serialized to JSON
        String json = objectMapper.writeValueAsString(score);
        System.out.println("Serialized JSON: " + json);
        assertNotNull(json);
        assertTrue(json.contains("\"player1Score\":11"));
        assertTrue(json.contains("\"player2Score\":9"));
        
        // Test that it can be deserialized from JSON
        MatchScore deserialized = objectMapper.readValue(json, MatchScore.class);
        assertNotNull(deserialized);
        assertEquals(11, deserialized.getSet(0).getPlayer1Score());
        assertEquals(9, deserialized.getSet(0).getPlayer2Score());
    }
    
    @Test
    void testSetWinner() {
        MatchScore.SetScore set = new MatchScore.SetScore();
        
        // No winner when scores are below 11
        set.setPlayer1Score(10);
        set.setPlayer2Score(8);
        assertNull(set.getWinner());
        
        // Player 1 wins
        set.setPlayer1Score(11);
        set.setPlayer2Score(5);
        assertEquals("player1", set.getWinner());
        
        // Player 2 wins
        set.setPlayer1Score(9);
        set.setPlayer2Score(11);
        assertEquals("player2", set.getWinner());
        
        // No winner when difference is less than 2
        set.setPlayer1Score(11);
        set.setPlayer2Score(10);
        assertNull(set.getWinner());
        
        // Player 2 wins with larger scores
        set.setPlayer1Score(14);
        set.setPlayer2Score(16);
        assertEquals("player2", set.getWinner());
    }
    
    @Test
    void testMatchWinnerCalculation() {
        MatchScore score = new MatchScore(5); // Best of 5
        
        // Set scores for first 3 sets - player1 wins 2, player2 wins 1
        score.getSet(0).setPlayer1Score(11);
        score.getSet(0).setPlayer2Score(9);
        
        score.getSet(1).setPlayer1Score(11);
        score.getSet(1).setPlayer2Score(5);
        
        score.getSet(2).setPlayer1Score(9);
        score.getSet(2).setPlayer2Score(11);
        
        // No winner yet - need to win 3 sets (best of 5)
        assertNull(score.calculateWinner());
        
        // Player 1 wins the 4th set, reaching 3 wins
        score.getSet(3).setPlayer1Score(11);
        score.getSet(3).setPlayer2Score(7);
        
        // Now player 1 should be the winner
        assertEquals("player1", score.calculateWinner());
        
        // Update winner field
        score.updateWinner();
        assertEquals("player1", score.getWinner());
    }
    
    @Test
    void testPlayer2WinsMatch() {
        MatchScore score = new MatchScore(3); // Best of 3
        
        // Player 2 wins 2 sets
        score.getSet(0).setPlayer1Score(9);
        score.getSet(0).setPlayer2Score(11);
        
        score.getSet(1).setPlayer1Score(7);
        score.getSet(1).setPlayer2Score(11);
        
        // Player 2 should be the winner (best of 3)
        assertEquals("player2", score.calculateWinner());
        
        score.updateWinner();
        assertEquals("player2", score.getWinner());
    }
} 