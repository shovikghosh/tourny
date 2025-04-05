package com.tournament.integration;

import com.tournament.model.*;
import com.tournament.service.PlayerService;
import com.tournament.service.TournamentService;
import com.tournament.dto.CreateMatchRequest;
import com.tournament.dto.CreateTournamentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TournamentIntegrationTest {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private TournamentService tournamentService;

    private Player player1;
    private Player player2;
    private Player player3;
    private Player player4;
    private Tournament tournament;

    private String generateUniqueEmail(String prefix) {
        return prefix + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    @BeforeEach
    void setUp() {
        // Create players with unique emails
        player1 = new Player();
        player1.setName("John Doe");
        player1.setEmail(generateUniqueEmail("john"));
        player1.setRank(1);
        player1 = playerService.createPlayer(player1);

        player2 = new Player();
        player2.setName("Jane Smith");
        player2.setEmail(generateUniqueEmail("jane"));
        player2.setRank(2);
        player2 = playerService.createPlayer(player2);

        player3 = new Player();
        player3.setName("Bob Wilson");
        player3.setEmail(generateUniqueEmail("bob"));
        player3.setRank(3);
        player3 = playerService.createPlayer(player3);

        player4 = new Player();
        player4.setName("Alice Brown");
        player4.setEmail(generateUniqueEmail("alice"));
        player4.setRank(4);
        player4 = playerService.createPlayer(player4);

        // Create tournament
        tournament = new Tournament();
        tournament.setName("Test Tournament");
        tournament.setStartDate(LocalDate.now());
        tournament.setEndDate(LocalDate.now().plusDays(7));
        tournament.setStatus(TournamentStatus.PENDING);
        
        // Add players to tournament
        tournament.addPlayer(player1);
        tournament.addPlayer(player2);
        tournament.addPlayer(player3);
        tournament.addPlayer(player4);
        
        tournament = tournamentService.createTournament(tournament);
    }

    @Test
    void testCreateAndUpdateMatch() {
        // Create match request
        CreateMatchRequest request = new CreateMatchRequest();
        request.setPlayer1Id(player1.getId());
        request.setPlayer2Id(player2.getId());
        request.setRound(1);
        request.setScheduledTime(LocalDateTime.now().plusHours(1));
        request.setVenue("Test Venue");
        request.setNotes("Test Match");

        // Create match
        Match match1 = tournamentService.createMatch(tournament.getId(), request);
        
        // Initially the status should be PENDING with no sets
        assertEquals(MatchStatus.PENDING, match1.getStatus());
        assertEquals(0, match1.getScore().getSets().size());

        // Update match score - player1 wins 2 sets, player2 wins 1 set
        MatchScore score = new MatchScore();
        // Add three sets
        score.addSet();
        score.addSet();
        score.addSet();
        
        score.getSet(0).setPlayer1Score(11);
        score.getSet(0).setPlayer2Score(9);
        
        score.getSet(1).setPlayer1Score(11);
        score.getSet(1).setPlayer2Score(7);
        
        score.getSet(2).setPlayer1Score(9);
        score.getSet(2).setPlayer2Score(11);

        tournamentService.updateMatchScore(tournament.getId(), match1.getId(), score);

        // Verify match was updated
        Match updatedMatch = tournamentService.getMatch(tournament.getId(), match1.getId());
        assertNotNull(updatedMatch);
        
        // Match should be COMPLETED since player1 won 2 out of 3 sets
        assertEquals(MatchStatus.COMPLETED, updatedMatch.getStatus());
        
        // Verify individual set scores
        assertEquals(11, updatedMatch.getScore().getSet(0).getPlayer1Score());
        assertEquals(9, updatedMatch.getScore().getSet(0).getPlayer2Score());
        assertEquals(11, updatedMatch.getScore().getSet(1).getPlayer1Score());
        assertEquals(7, updatedMatch.getScore().getSet(1).getPlayer2Score());
        assertEquals(9, updatedMatch.getScore().getSet(2).getPlayer1Score());
        assertEquals(11, updatedMatch.getScore().getSet(2).getPlayer2Score());
        
        // Verify match winner calculation
        assertEquals(2, updatedMatch.getScore().getPlayer1SetsWon());
        assertEquals(1, updatedMatch.getScore().getPlayer2SetsWon());
        assertEquals(PlayerSide.PLAYER1.toString(), updatedMatch.getScore().getWinner());
        assertEquals(PlayerSide.PLAYER1, updatedMatch.getScore().getWinnerSide());
    }

    @Test
    void testMatchInProgressStatus() {
        // Create match request
        CreateMatchRequest request = new CreateMatchRequest();
        request.setPlayer1Id(player1.getId());
        request.setPlayer2Id(player2.getId());
        request.setRound(1);
        request.setScheduledTime(LocalDateTime.now().plusHours(1));
        
        // Create match
        Match match = tournamentService.createMatch(tournament.getId(), request);
        assertEquals(MatchStatus.PENDING, match.getStatus());
        
        // Update with a partial score (not enough to determine winner)
        MatchScore score = new MatchScore();
        // Set total sets to 3 to make it a best-of-3 match
        score.setTotalSets(3);
        score.addSet();
        score.getSet(0).setPlayer1Score(11);
        score.getSet(0).setPlayer2Score(9);
        
        tournamentService.updateMatchScore(tournament.getId(), match.getId(), score);
        
        // Verify match is now in progress
        Match updatedMatch = tournamentService.getMatch(tournament.getId(), match.getId());
        assertEquals(MatchStatus.IN_PROGRESS, updatedMatch.getStatus());
        assertNull(updatedMatch.getScore().getWinner());
    }

    @Test
    void testTournamentCreation() {
        // Verify tournament was created correctly
        Tournament savedTournament = tournamentService.getTournament(tournament.getId());
        assertNotNull(savedTournament);
        assertEquals("Test Tournament", savedTournament.getName());
        assertEquals(4, savedTournament.getPlayers().size());
        assertTrue(savedTournament.getPlayers().contains(player1));
        assertTrue(savedTournament.getPlayers().contains(player2));
        assertTrue(savedTournament.getPlayers().contains(player3));
        assertTrue(savedTournament.getPlayers().contains(player4));
    }

    @Test
    void testPlayerCreation() {
        // Create a new player with unique email
        Player newPlayer = new Player();
        newPlayer.setName("Test Player");
        newPlayer.setEmail(generateUniqueEmail("test"));
        newPlayer.setRank(5);
        newPlayer = playerService.createPlayer(newPlayer);

        // Verify player was created correctly
        Player savedPlayer = playerService.getPlayer(newPlayer.getId());
        assertNotNull(savedPlayer);
        assertEquals("Test Player", savedPlayer.getName());
        assertEquals(newPlayer.getEmail(), savedPlayer.getEmail());
        assertEquals(5, savedPlayer.getRank());
    }
    
    @Test
    void testCreateTournamentWithDTO() {
        // Create tournament request DTO
        CreateTournamentRequest request = new CreateTournamentRequest();
        request.setName("DTO Tournament Test");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(10));
        request.setPlayerIds(Arrays.asList(player1.getId(), player2.getId()));
        
        // Create tournament using the DTO
        Tournament createdTournament = tournamentService.createTournament(request);
        
        // Verify tournament was created correctly
        assertNotNull(createdTournament);
        assertNotNull(createdTournament.getId());
        assertEquals("DTO Tournament Test", createdTournament.getName());
        assertEquals(LocalDate.now(), createdTournament.getStartDate());
        assertEquals(LocalDate.now().plusDays(10), createdTournament.getEndDate());
        assertEquals(TournamentStatus.PENDING, createdTournament.getStatus());
        
        // Verify players were added correctly
        assertEquals(2, createdTournament.getPlayers().size());
        assertTrue(createdTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player1.getId())));
        assertTrue(createdTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player2.getId())));
    }
    
    @Test
    void testAddPlayersToTournament() {
        // Create a tournament with no players initially
        Tournament emptyTournament = new Tournament();
        emptyTournament.setName("Empty Tournament");
        emptyTournament.setStartDate(LocalDate.now());
        emptyTournament.setEndDate(LocalDate.now().plusDays(5));
        emptyTournament = tournamentService.createTournament(emptyTournament);
        
        // Verify no players initially
        assertEquals(0, emptyTournament.getPlayers().size());
        
        // Add players to tournament
        Tournament updatedTournament = tournamentService.addPlayersToTournament(
            emptyTournament.getId(), 
            Arrays.asList(player1.getId(), player3.getId(), player4.getId())
        );
        
        // Verify players were added
        assertNotNull(updatedTournament);
        assertEquals(3, updatedTournament.getPlayers().size());
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player1.getId())));
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player3.getId())));
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player4.getId())));
        
        // Add one more player
        updatedTournament = tournamentService.addPlayersToTournament(
            emptyTournament.getId(), 
            Collections.singletonList(player2.getId())
        );
        
        // Verify the additional player was added (should now have all 4)
        assertEquals(4, updatedTournament.getPlayers().size());
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player2.getId())));
    }
    
    @Test
    void testAddDuplicatePlayersToTournament() {
        // Create tournament with player1 already added
        Tournament tournament = new Tournament();
        tournament.setName("Duplicate Test Tournament");
        tournament.setStartDate(LocalDate.now());
        tournament.setEndDate(LocalDate.now().plusDays(5));
        tournament.addPlayer(player1);
        tournament = tournamentService.createTournament(tournament);
        
        // Initial count should be 1
        assertEquals(1, tournament.getPlayers().size());
        
        // Try to add player1 again along with player2
        Tournament updatedTournament = tournamentService.addPlayersToTournament(
            tournament.getId(),
            Arrays.asList(player1.getId(), player2.getId())
        );
        
        // Should only have added player2 (no duplicates)
        assertEquals(2, updatedTournament.getPlayers().size());
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player1.getId())));
        assertTrue(updatedTournament.getPlayers().stream()
            .anyMatch(p -> p.getId().equals(player2.getId())));
    }
} 