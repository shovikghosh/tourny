package com.tournament.service;

import com.tournament.dto.CreateMatchRequest;
import com.tournament.dto.CreateTournamentRequest;
import com.tournament.dto.UpdateScoreResponse;
import com.tournament.exception.ResourceNotFoundException;
import com.tournament.model.MatchScore;
import com.tournament.model.MatchStatus;
import com.tournament.model.Tournament;
import com.tournament.model.TournamentStatus;
import com.tournament.model.Match;
import com.tournament.model.Player;
import com.tournament.model.ScoreUpdateStatus;
import com.tournament.model.PlayerSide;
import com.tournament.repository.TournamentRepository;
import com.tournament.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TournamentService {
    private static final Logger logger = LoggerFactory.getLogger(TournamentService.class);
    
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + id));
    }

    public Match getMatch(Long tournamentId, Long matchId) {
        Tournament tournament = getTournament(tournamentId);
        return tournament.getMatches().stream()
                .filter(m -> m.getId().equals(matchId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + matchId));
    }

    @Transactional
    public Tournament createTournament(Tournament tournament) {
        Assert.notNull(tournament, "Tournament must not be null");
        Assert.hasText(tournament.getName(), "Tournament name must not be empty");
        Assert.notNull(tournament.getStartDate(), "Start date must not be null");
        Assert.notNull(tournament.getEndDate(), "End date must not be null");
        Assert.isTrue(!tournament.getEndDate().isBefore(tournament.getStartDate()), 
            "End date must not be before start date");
        
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public Tournament createTournament(CreateTournamentRequest request) {
        Assert.notNull(request, "CreateTournamentRequest must not be null");
        Assert.hasText(request.getName(), "Tournament name must not be empty");
        Assert.notNull(request.getStartDate(), "Start date must not be null");
        Assert.notNull(request.getEndDate(), "End date must not be null");
        Assert.isTrue(!request.getEndDate().isBefore(request.getStartDate()), 
            "End date must not be before start date");
        
        // Create the tournament
        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setStatus(TournamentStatus.PENDING);
        
        // Add players if playerIds are provided
        if (request.getPlayerIds() != null && !request.getPlayerIds().isEmpty()) {
            for (Long playerId : request.getPlayerIds()) {
                Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));
                tournament.addPlayer(player);
            }
        }
        
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public Match createMatch(Long tournamentId, CreateMatchRequest request) {
        Assert.notNull(request, "CreateMatchRequest must not be null");
        Assert.notNull(request.getPlayer1Id(), "Player1 ID must not be null");
        Assert.notNull(request.getPlayer2Id(), "Player2 ID must not be null");
        Assert.notNull(request.getRound(), "Round must not be null");
        Assert.isTrue(request.getRound() > 0, "Round must be positive");
        Assert.isTrue(!request.getPlayer1Id().equals(request.getPlayer2Id()), 
            "Players must be different");
        // Optional validation for intended sets
        if (request.getIntendedTotalSets() != null) {
            Assert.isTrue(request.getIntendedTotalSets() > 0 && request.getIntendedTotalSets() % 2 != 0, 
                "Intended total sets must be a positive odd number (e.g., 1, 3, 5)");
        }

        Tournament tournament = getTournament(tournamentId);
        
        Player player1 = playerRepository.findById(request.getPlayer1Id())
                .orElseThrow(() -> new ResourceNotFoundException("Player 1 not found with id: " + request.getPlayer1Id()));
        Player player2 = playerRepository.findById(request.getPlayer2Id())
                .orElseThrow(() -> new ResourceNotFoundException("Player 2 not found with id: " + request.getPlayer2Id()));

        // Determine the intended sets, defaulting to 3 if not provided or invalid (e.g., 0 or even)
        int setsForMatch = (request.getIntendedTotalSets() != null && request.getIntendedTotalSets() > 0 && request.getIntendedTotalSets() % 2 != 0) 
                            ? request.getIntendedTotalSets() 
                            : 3; // Default to best-of-3

        MatchScore score = new MatchScore(setsForMatch); 
        
        Match match = Match.builder()
                .player1(player1)
                .player2(player2)
                .round(request.getRound())
                .scheduledTime(request.getScheduledTime())
                .venue(request.getVenue())
                .notes(request.getNotes())
                .status(MatchStatus.PENDING)
                .score(score) // Score now includes intendedTotalSets
                .build();

        tournament.addMatch(match);
        tournamentRepository.save(tournament);
        return match;
    }

    @Transactional
    public UpdateScoreResponse updateMatchScore(Long tournamentId, Long matchId, MatchScore scoreUpdate) {
        logger.debug("Updating score for match ID: {} in tournament ID: {}", matchId, tournamentId);
        Match match = getMatch(tournamentId, matchId);
        MatchScore managedScore = match.getScore();
        int setsBeforeUpdate = managedScore.getSets().size();
        logger.debug("Sets before update: {}", setsBeforeUpdate);

        // Apply score update data
        if (scoreUpdate.getSets() != null) {
            managedScore.getSets().clear();
            managedScore.getSets().addAll(scoreUpdate.getSets());
            logger.debug("Applied {} sets from update request.", scoreUpdate.getSets().size());
        }

        // Calculate winner and update status based on the MANAGED score object
        logger.debug("Calling managedScore.updateWinner() for match ID: {}", matchId);
        managedScore.updateWinner(); // Call on managedScore
        logger.debug("Winner after calculation on managedScore: {}", managedScore.getWinnerSide());

        logger.debug("Calling updateMatchStatus() for match ID: {}. Current status: {}", matchId, match.getStatus());
        updateMatchStatus(match, managedScore); // Pass managedScore
        logger.debug("Match status AFTER updateMatchStatus call: {}", match.getStatus());

        int setsAfterUpdate = managedScore.getSets().size();

        // Determine the granular status
        ScoreUpdateStatus status;
        if (match.getStatus() == MatchStatus.COMPLETED) {
            status = ScoreUpdateStatus.MATCH_COMPLETED;
        } else if (setsAfterUpdate > setsBeforeUpdate) {
            boolean lastSetCompleted = false;
            if (!managedScore.getSets().isEmpty()) {
                MatchScore.SetScore lastSet = managedScore.getSet(managedScore.getSets().size() - 1);
                if (lastSet != null && lastSet.getWinner() != null) {
                    lastSetCompleted = true;
                }
            }
            logger.debug("Sets increased. Last set completed: {}. Determining granular status.", lastSetCompleted);
            status = lastSetCompleted 
                ? ScoreUpdateStatus.SET_COMPLETED_MATCH_IN_PROGRESS 
                : ScoreUpdateStatus.SET_IN_PROGRESS;
        } else {
            status = ScoreUpdateStatus.SET_IN_PROGRESS;
        }
        logger.debug("Determined ScoreUpdateStatus: {}", status);

        // IMPORTANT: Log the match status just before returning
        logger.debug("Returning response for match ID: {}. Final match status in returned object: {}", matchId, match.getStatus());
        return new UpdateScoreResponse(match, status);
    }
    
    private void updateMatchStatus(Match match, MatchScore score) {
        logger.debug("Inside updateMatchStatus for match ID: {}. Checking winner...", match.getId());
        // 1. Check winner by majority sets won
        PlayerSide winner = score.getWinnerSide();
        logger.debug("Winner calculated by getWinnerSide(): {}", winner);
        if (winner != null) {
            logger.debug("Winner found ({}). Setting match status to COMPLETED.", winner);
            match.setStatus(MatchStatus.COMPLETED);
            return;
        }

        // 2. Check if all intended sets played
        int playedSets = score.getSets() != null ? score.getSets().size() : 0;
        int intendedSets = score.getIntendedTotalSets();
        logger.debug("Checking if all sets played: Played = {}, Intended = {}", playedSets, intendedSets);
        if (intendedSets > 0 && playedSets >= intendedSets) {
             logger.debug("All intended sets ({}) played. Setting match status to COMPLETED.", intendedSets);
             match.setStatus(MatchStatus.COMPLETED);
             return;
        }

        // 3. Check for transition to IN_PROGRESS
        logger.debug("Checking if match should become IN_PROGRESS. Current status: {}, Played sets: {}", match.getStatus(), playedSets);
        if (match.getStatus() == MatchStatus.PENDING && playedSets > 0) {
            logger.debug("Match was PENDING and has sets played. Setting status to IN_PROGRESS.");
            match.setStatus(MatchStatus.IN_PROGRESS);
        }
        logger.debug("Exiting updateMatchStatus for match ID: {}. Final status in method: {}", match.getId(), match.getStatus());
    }

    @Transactional
    public void deleteTournament(Long id) {
        Tournament tournament = getTournament(id);
        tournamentRepository.delete(tournament);
    }
    
    @Transactional
    public Tournament addPlayersToTournament(Long tournamentId, List<Long> playerIds) {
        Assert.notNull(playerIds, "Player IDs must not be null");
        Assert.isTrue(!playerIds.isEmpty(), "Player IDs must not be empty");
        
        Tournament tournament = getTournament(tournamentId);
        
        for (Long playerId : playerIds) {
            Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));
            
            // Check if player is already in the tournament to avoid duplicates
            if (tournament.getPlayers().stream().noneMatch(p -> p.getId().equals(playerId))) {
                tournament.addPlayer(player);
            }
        }
        
        return tournamentRepository.save(tournament);
    }
} 