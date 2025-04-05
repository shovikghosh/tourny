package com.tournament.service;

import com.tournament.dto.CreateMatchRequest;
import com.tournament.dto.CreateTournamentRequest;
import com.tournament.exception.ResourceNotFoundException;
import com.tournament.model.MatchScore;
import com.tournament.model.MatchStatus;
import com.tournament.model.Tournament;
import com.tournament.model.TournamentStatus;
import com.tournament.model.Match;
import com.tournament.model.Player;
import com.tournament.repository.TournamentRepository;
import com.tournament.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TournamentService {
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
        Assert.isTrue(!request.getPlayer1Id().equals(request.getPlayer2Id()), 
            "Players must be different");

        Tournament tournament = getTournament(tournamentId);
        
        Player player1 = playerRepository.findById(request.getPlayer1Id())
                .orElseThrow(() -> new ResourceNotFoundException("Player 1 not found with id: " + request.getPlayer1Id()));
        Player player2 = playerRepository.findById(request.getPlayer2Id())
                .orElseThrow(() -> new ResourceNotFoundException("Player 2 not found with id: " + request.getPlayer2Id()));

        // Create a properly initialized MatchScore with 0 sets
        MatchScore score = new MatchScore();
        
        Match match = Match.builder()
                .player1(player1)
                .player2(player2)
                .round(request.getRound())
                .scheduledTime(request.getScheduledTime())
                .venue(request.getVenue())
                .notes(request.getNotes())
                .status(MatchStatus.PENDING)
                .score(score)
                .build();

        tournament.addMatch(match);
        tournamentRepository.save(tournament);
        return match;
    }

    @Transactional
    public void updateMatchScore(Long tournamentId, Long matchId, MatchScore score) {
        Match match = getMatch(tournamentId, matchId);
        
        // Ensure the match has all required sets
        ensureMatchHasRequiredSets(match, score);
        
        // Update the match score
        match.setScore(score);
        
        // Calculate and update match winner
        score.updateWinner();
        
        // Update match status based on score progress
        updateMatchStatus(match, score);
    }
    
    /**
     * Ensure the match has all the required sets before updating scores
     */
    private void ensureMatchHasRequiredSets(Match match, MatchScore score) {
        if (score.getSets() == null || score.getSets().isEmpty()) {
            return;
        }
        
        // Create sets in the match score if needed
        int neededSets = score.getSets().size();
        while (match.getScore().getSets().size() < neededSets) {
            match.getScore().addSet();
        }
    }
    
    /**
     * Update the match status based on score progress
     */
    private void updateMatchStatus(Match match, MatchScore score) {
        if (score.getWinnerSide() != null) {
            // Match has a winner, mark as completed
            match.setStatus(MatchStatus.COMPLETED);
        } else if (match.getStatus() == MatchStatus.PENDING && !score.getSets().isEmpty()) {
            // Match has started but no winner yet
            match.setStatus(MatchStatus.IN_PROGRESS);
        }
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