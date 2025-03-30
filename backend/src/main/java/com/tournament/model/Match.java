package com.tournament.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player1_id", nullable = false)
    @NotNull(message = "Player 1 must not be null")
    private Player player1;

    @ManyToOne
    @JoinColumn(name = "player2_id", nullable = false)
    @NotNull(message = "Player 2 must not be null")
    private Player player2;

    @Embedded
    @NotNull(message = "Score must not be null")
    private MatchScore score;

    @Column(nullable = false)
    @NotNull(message = "Round must not be null")
    private Integer round;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status must not be null")
    private MatchStatus status = MatchStatus.PENDING;

    @Column
    private LocalDateTime scheduledTime;

    @Column
    private String venue;

    @Column
    private String notes;

    @PrePersist
    @PreUpdate
    public void validate() {
        if (player1 != null && player1.equals(player2)) {
            throw new IllegalArgumentException("Players must be different");
        }
    }
} 