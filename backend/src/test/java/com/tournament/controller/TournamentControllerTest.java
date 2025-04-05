package com.tournament.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tournament.dto.AddPlayersRequest;
import com.tournament.dto.CreateTournamentRequest;
import com.tournament.model.Player;
import com.tournament.model.Tournament;
import com.tournament.model.TournamentStatus;
import com.tournament.service.PlayerService;
import com.tournament.service.TournamentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class TournamentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private TournamentService tournamentService;

    private Player player1;
    private Player player2;
    private Tournament tournament;

    private String generateUniqueEmail(String prefix) {
        return prefix + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    @BeforeEach
    void setUp() {
        // Create test players
        player1 = new Player();
        player1.setName("Test Player 1");
        player1.setEmail(generateUniqueEmail("player1"));
        player1.setRank(1);
        player1 = playerService.createPlayer(player1);

        player2 = new Player();
        player2.setName("Test Player 2");
        player2.setEmail(generateUniqueEmail("player2"));
        player2.setRank(2);
        player2 = playerService.createPlayer(player2);

        // Create test tournament
        tournament = new Tournament();
        tournament.setName("Test Tournament");
        tournament.setStartDate(LocalDate.now());
        tournament.setEndDate(LocalDate.now().plusDays(7));
        tournament.setStatus(TournamentStatus.PENDING);
        tournament = tournamentService.createTournament(tournament);
    }

    @Test
    void testCreateTournamentEndpoint() throws Exception {
        CreateTournamentRequest request = new CreateTournamentRequest();
        request.setName("API Tournament Test");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(10));
        request.setPlayerIds(Arrays.asList(player1.getId(), player2.getId()));

        mockMvc.perform(post("/api/tournaments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(notNullValue())))
                .andExpect(jsonPath("$.name", is("API Tournament Test")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.players", hasSize(2)))
                .andExpect(jsonPath("$.players[*].id", containsInAnyOrder(
                        player1.getId().intValue(), 
                        player2.getId().intValue())))
                .andExpect(jsonPath("$.players[*].name", containsInAnyOrder(
                        player1.getName(), 
                        player2.getName())));
    }

    @Test
    void testAddPlayersToTournamentEndpoint() throws Exception {
        // Create request to add players
        AddPlayersRequest request = new AddPlayersRequest();
        request.setPlayerIds(Arrays.asList(player1.getId(), player2.getId()));

        mockMvc.perform(post("/api/tournaments/{tournamentId}/players", tournament.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(tournament.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Test Tournament")))
                .andExpect(jsonPath("$.players", hasSize(2)))
                .andExpect(jsonPath("$.players[*].id", containsInAnyOrder(
                        player1.getId().intValue(), 
                        player2.getId().intValue())));
    }

    @Test
    void testGetTournamentWithPlayers() throws Exception {
        // First add players to the tournament
        tournamentService.addPlayersToTournament(
                tournament.getId(), 
                Arrays.asList(player1.getId(), player2.getId()));

        // Then test the GET endpoint
        mockMvc.perform(get("/api/tournaments/{id}", tournament.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(tournament.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Test Tournament")))
                .andExpect(jsonPath("$.players", hasSize(2)))
                .andExpect(jsonPath("$.players[*].id", containsInAnyOrder(
                        player1.getId().intValue(), 
                        player2.getId().intValue())));
    }
} 