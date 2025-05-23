package com.tournament.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"players", "matches"})
@EqualsAndHashCode(exclude = {"players", "matches"})
@Table(name = "tournaments")
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Name must not be blank")
    private String name;

    @Column(nullable = false)
    @NotNull(message = "Start date must not be null")
    private LocalDate startDate;

    @Column(nullable = false)
    @NotNull(message = "End date must not be null")
    private LocalDate endDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status must not be null")
    private TournamentStatus status = TournamentStatus.PENDING;

    @ManyToMany
    @JoinTable(
        name = "tournament_players",
        joinColumns = @JoinColumn(name = "tournament_id"),
        inverseJoinColumns = @JoinColumn(name = "player_id")
    )
    @Builder.Default
    private List<Player> players = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tournament_id")
    @Builder.Default
    @JsonManagedReference
    private List<Match> matches = new ArrayList<>();

    public void addMatch(Match match) {
        if (matches == null) {
            matches = new ArrayList<>();
        }
        matches.add(match);
    }

    public void removeMatch(Match match) {
        if (matches != null) {
            matches.remove(match);
        }
    }

    public void addPlayer(Player player) {
        if (players == null) {
            players = new ArrayList<>();
        }
        if (!players.contains(player)) {
            players.add(player);
        }
    }

    public void removePlayer(Player player) {
        if (players != null) {
            players.remove(player);
        }
    }

    @PrePersist
    @PreUpdate
    public void validate() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must not be before start date");
        }
    }
} 