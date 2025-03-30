package com.tournament.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.tournament.service.TournamentService;
import com.tournament.model.Tournament;
import com.tournament.model.MatchScore;
import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
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
    
    @PutMapping("/{id}/matches/{matchId}")
    public void updateMatchScore(@PathVariable Long id, 
                               @PathVariable Long matchId,
                               @RequestBody MatchScore score) {
        tournamentService.updateMatchScore(id, matchId, score);
    }
} 