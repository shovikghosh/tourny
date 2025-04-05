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
        
        // Should have default 3 sets
        assertEquals(3, score.getSets().size());
        
        // Each set should be non-null with initialized scores
        for (int i = 0; i < 3; i++) {
            assertNotNull(score.getSet(i));
            assertNotNull(score.getSet(i).getPlayer1Score());
            assertNotNull(score.getSet(i).getPlayer2Score());
            assertEquals(0, score.getSet(i).getPlayer1Score());
            assertEquals(0, score.getSet(i).getPlayer2Score());
        }
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
        MatchScore score = new MatchScore(3);
        
        // Test that getting a set index out of bounds returns new SetScore not null
        assertNotNull(score.getSet(10));
        assertEquals(0, score.getSet(10).getPlayer1Score());
    }

    @Test
    void testScoreCalculation() {
        MatchScore score = new MatchScore();
        
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
        MatchScore score = new MatchScore();
        
        // Deliberately set a null score
        score.getSets().set(1, null);
        
        // Functions should handle the null gracefully
        assertDoesNotThrow(() -> score.isComplete());
        assertDoesNotThrow(() -> score.getPlayer1TotalScore());
        assertDoesNotThrow(() -> score.getPlayer2TotalScore());
    }

    @Test
    void testSerialization() throws Exception {
        MatchScore score = new MatchScore();
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
} 