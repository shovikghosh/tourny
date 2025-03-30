package com.tournament.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private Integer rank;

    @ManyToMany(mappedBy = "players")
    private List<Tournament> tournaments = new ArrayList<>();

    @OneToMany(mappedBy = "player1")
    private List<Match> matchesAsPlayer1 = new ArrayList<>();

    @OneToMany(mappedBy = "player2")
    private List<Match> matchesAsPlayer2 = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;
} 