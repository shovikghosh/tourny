package com.tournament.service;

import com.tournament.model.Player;
import com.tournament.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player getPlayer(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));
    }

    @Transactional
    public Player createPlayer(Player player) {
        return playerRepository.save(player);
    }

    @Transactional
    public Player updatePlayer(Long id, Player playerDetails) {
        Player player = getPlayer(id);
        
        player.setName(playerDetails.getName());
        player.setEmail(playerDetails.getEmail());
        player.setRank(playerDetails.getRank());
        player.setActive(playerDetails.isActive());
        
        return playerRepository.save(player);
    }

    @Transactional
    public void deletePlayer(Long id) {
        Player player = getPlayer(id);
        playerRepository.delete(player);
    }
} 