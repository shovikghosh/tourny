package com.tournament.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DtoTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Test
    void testCreateTournamentRequestSerialization() throws Exception {
        // Create a DTO
        CreateTournamentRequest request = new CreateTournamentRequest();
        request.setName("Test Tournament");
        request.setStartDate(LocalDate.of(2023, 1, 1));
        request.setEndDate(LocalDate.of(2023, 1, 7));
        request.setPlayerIds(Arrays.asList(1L, 2L, 3L));
        
        // Serialize to JSON
        String json = objectMapper.writeValueAsString(request);
        System.out.println("Serialized JSON: " + json);
        
        // Verify JSON contains expected fields
        assertTrue(json.contains("\"name\":\"Test Tournament\""));
        assertTrue(json.contains("\"startDate\":\"2023-01-01\""));
        assertTrue(json.contains("\"endDate\":\"2023-01-07\""));
        assertTrue(json.contains("\"playerIds\":[1,2,3]"));
        
        // Deserialize back
        CreateTournamentRequest deserialized = objectMapper.readValue(json, CreateTournamentRequest.class);
        
        // Verify deserialized object
        assertEquals("Test Tournament", deserialized.getName());
        assertEquals(LocalDate.of(2023, 1, 1), deserialized.getStartDate());
        assertEquals(LocalDate.of(2023, 1, 7), deserialized.getEndDate());
        assertEquals(Arrays.asList(1L, 2L, 3L), deserialized.getPlayerIds());
    }
    
    @Test
    void testAddPlayersRequestSerialization() throws Exception {
        // Create a DTO
        AddPlayersRequest request = new AddPlayersRequest();
        request.setPlayerIds(Arrays.asList(1L, 2L));
        
        // Serialize to JSON
        String json = objectMapper.writeValueAsString(request);
        
        // Verify JSON contains expected fields
        assertTrue(json.contains("\"playerIds\":[1,2]"));
        
        // Deserialize back
        AddPlayersRequest deserialized = objectMapper.readValue(json, AddPlayersRequest.class);
        
        // Verify deserialized object
        assertEquals(Arrays.asList(1L, 2L), deserialized.getPlayerIds());
    }
    
    @Test
    void testCreateTournamentRequestValidation() {
        // Create a request with null values
        CreateTournamentRequest request = new CreateTournamentRequest();
        
        // Check default values
        assertNull(request.getName());
        assertNull(request.getStartDate());
        assertNull(request.getEndDate());
        assertNull(request.getPlayerIds());
        
        // Set values
        request.setName("Tournament");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(1));
        List<Long> playerIds = Arrays.asList(1L, 2L);
        request.setPlayerIds(playerIds);
        
        // Verify values
        assertEquals("Tournament", request.getName());
        assertEquals(LocalDate.now(), request.getStartDate());
        assertEquals(LocalDate.now().plusDays(1), request.getEndDate());
        assertEquals(playerIds, request.getPlayerIds());
    }
} 