package com.tournament.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.tournament.service.TournamentService;
import com.tournament.model.Tournament;
import com.tournament.model.MatchScore;
import java.util.List;
import com.tournament.dto.CreateMatchRequest;
import com.tournament.dto.CreateTournamentRequest;
import com.tournament.dto.AddPlayersRequest;
import com.tournament.model.Match;
import org.springframework.http.ResponseEntity;
import com.tournament.dto.UpdateScoreResponse;

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
    public ResponseEntity<Tournament> getTournament(@PathVariable Long id) {
        Tournament tournament = tournamentService.getTournament(id);
        return ResponseEntity.ok(tournament);
    }
    
    @PostMapping
    public Tournament createTournament(@RequestBody CreateTournamentRequest request) {
        return tournamentService.createTournament(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTournament(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok().build();
    }
    
    // Player-related endpoints
    @PostMapping("/{tournamentId}/players")
    public ResponseEntity<Tournament> addPlayersToTournament(
            @PathVariable Long tournamentId,
            @RequestBody AddPlayersRequest request) {
        Tournament tournament = tournamentService.addPlayersToTournament(tournamentId, request.getPlayerIds());
        return ResponseEntity.ok(tournament);
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
    public ResponseEntity<UpdateScoreResponse> updateMatchScore(
            @PathVariable Long tournamentId,
            @PathVariable Long matchId,
            @RequestBody MatchScore score) {
        UpdateScoreResponse response = tournamentService.updateMatchScore(tournamentId, matchId, score);
        return ResponseEntity.ok(response);
    }
} 