package com.tournament.service;

import com.tournament.dto.CreateMatchRequest;
import com.tournament.exception.ResourceNotFoundException;
import com.tournament.model.MatchScore;
import com.tournament.model.MatchStatus;
import com.tournament.model.Tournament;
import com.tournament.model.Match;
import com.tournament.model.Player;
import com.tournament.repository.TournamentRepository;
import com.tournament.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;

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

        Match match = Match.builder()
                .player1(player1)
                .player2(player2)
                .round(request.getRound())
                .scheduledTime(request.getScheduledTime())
                .venue(request.getVenue())
                .notes(request.getNotes())
                .status(MatchStatus.PENDING)
                .score(new MatchScore())
                .build();

        tournament.addMatch(match);
        tournament = tournamentRepository.save(tournament);

        return match;
    }

    @Transactional
    public void updateMatchScore(Long tournamentId, Long matchId, MatchScore score) {
        Assert.notNull(score, "MatchScore must not be null");
        
        Tournament tournament = getTournament(tournamentId);
        Match match = getMatch(tournamentId, matchId);

        match.setScore(score);
        match.setStatus(score.isComplete() ? MatchStatus.COMPLETED : MatchStatus.IN_PROGRESS);

        tournamentRepository.save(tournament);
    }

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional
    public void deleteTournament(Long id) {
        if (!tournamentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tournament not found with id: " + id);
        }
        tournamentRepository.deleteById(id);
    }
} 