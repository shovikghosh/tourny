package com.tournament.config;

import com.tournament.model.*;
import com.tournament.repository.PlayerRepository;
import com.tournament.repository.TournamentRepository;
import com.tournament.repository.MatchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
@Profile("development") // Only run in development profile
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking if initial data needs to be loaded...");

        if (playerRepository.count() == 0 && tournamentRepository.count() == 0) {
            logger.info("No existing data found. Initializing sample data...");
            createSampleData();
            logger.info("Sample data initialized successfully.");
        } else {
            logger.info("Data already exists. Skipping initialization.");
        }
    }

    private void createSampleData() {
        // Create Players
        Player player1 = new Player();
        player1.setName("Alice");
        player1.setEmail("alice@example.com");
        player1.setRank(1);
        player1.setActive(true);

        Player player2 = new Player();
        player2.setName("Bob");
        player2.setEmail("bob@example.com");
        player2.setRank(2);
        player2.setActive(true);

        Player player3 = new Player();
        player3.setName("Charlie");
        player3.setEmail("charlie@example.com");
        player3.setRank(3);
        player3.setActive(true);
        
        Player player4 = new Player();
        player4.setName("Diana");
        player4.setEmail("diana@example.com");
        player4.setRank(4);
        player4.setActive(true);

        List<Player> players = playerRepository.saveAll(Arrays.asList(player1, player2, player3, player4));
        Player savedPlayer1 = players.get(0);
        Player savedPlayer2 = players.get(1);
        Player savedPlayer3 = players.get(2);
        Player savedPlayer4 = players.get(3);

        // Create a Tournament
        Tournament tournament = new Tournament();
        tournament.setName("Spring Championship");
        tournament.setStartDate(LocalDate.now());
        tournament.setEndDate(LocalDate.now().plusDays(2));
        tournament.setStatus(TournamentStatus.PENDING);
        tournament.setPlayers(players);

        Tournament savedTournament = tournamentRepository.save(tournament);

        // Create Matches
        Match match1 = new Match();
        match1.setTournament(savedTournament);
        match1.setPlayer1(savedPlayer1);
        match1.setPlayer2(savedPlayer2);
        match1.setRound(1);
        match1.setStatus(MatchStatus.PENDING);
        match1.setScore(new MatchScore()); // Initial score
        match1.setVenue("Table 1");

        Match match2 = new Match();
        match2.setTournament(savedTournament);
        match2.setPlayer1(savedPlayer3);
        match2.setPlayer2(savedPlayer4);
        match2.setRound(1);
        match2.setStatus(MatchStatus.PENDING);
        match2.setScore(new MatchScore()); // Initial score
        match2.setVenue("Table 2");

        matchRepository.saveAll(Arrays.asList(match1, match2));
    }
} 