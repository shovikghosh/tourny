package com.tournament.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.tournament.service.TournamentService;
import com.tournament.model.Tournament;
import com.tournament.model.MatchScore;
import java.util.List;
import com.tournament.dto.CreateMatchRequest;
import com.tournament.model.Match;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "http://localhost:3000")
public class TournamentController {
    
    @Autowired
    private TournamentService tournamentService;
    
    @GetMapping
    public List<Tournament> getAllTournaments() {
        return tournamentService.getAllTournaments();
    }
    
    @GetMapping("/{id}")
    public Tournament getTournament(@PathVariable Long id) {
        return tournamentService.getTournament(id);
    }
    
    @PostMapping
    public Tournament createTournament(@RequestBody Tournament tournament) {
        return tournamentService.createTournament(tournament);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTournament(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok().build();
    }
    
    // Match-related endpoints
    @PostMapping("/{tournamentId}/matches")
    public ResponseEntity<Match> createMatch(
            @PathVariable Long tournamentId,
            @RequestBody CreateMatchRequest request) {
        Match match = tournamentService.createMatch(tournamentId, request);
        return ResponseEntity.ok(match);
    }
    
    @PutMapping("/{tournamentId}/matches/{matchId}")
    public ResponseEntity<Void> updateMatchScore(
            @PathVariable Long tournamentId,
            @PathVariable Long matchId,
            @RequestBody MatchScore score) {
        tournamentService.updateMatchScore(tournamentId, matchId, score);
        return ResponseEntity.ok().build();
    }
} 