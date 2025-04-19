package com.tournament.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "tournament")
@EqualsAndHashCode(exclude = "tournament")
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
    @Builder.Default
    private MatchScore score = new MatchScore();

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
    
    @ManyToOne
    @JoinColumn(name = "tournament_id")
    @JsonBackReference
    private Tournament tournament;

    @PrePersist
    @PreUpdate
    public void validate() {
        if (player1 != null && player1.equals(player2)) {
            throw new IllegalArgumentException("Players must be different");
        }
        
        // Ensure score is never null
        if (score == null) {
            score = new MatchScore();
        }
    }
} 