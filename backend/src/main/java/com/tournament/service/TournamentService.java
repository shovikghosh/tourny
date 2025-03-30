package com.tournament.service;

import com.tournament.model.MatchScore;
import com.tournament.model.MatchStatus;
import com.tournament.model.Tournament;
import com.tournament.model.Match;
import com.tournament.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    }

    @Transactional
    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public void updateMatchScore(Long tournamentId, Long matchId, MatchScore score) {
        Tournament tournament = getTournament(tournamentId);
        Match match = tournament.getMatches().stream()
                .filter(m -> m.getId().equals(matchId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        match.setScore1(score.getScore1());
        match.setScore2(score.getScore2());
        match.setStatus(MatchStatus.COMPLETED);

        tournamentRepository.save(tournament);
    }

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional
    public void deleteTournament(Long id) {
        tournamentRepository.deleteById(id);
    }
} 