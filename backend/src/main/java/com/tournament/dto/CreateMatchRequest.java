package com.tournament.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateMatchRequest {
    private Long player1Id;
    private Long player2Id;
    private Integer round;
    private Integer intendedTotalSets;
    private LocalDateTime scheduledTime;
    private String venue;
    private String notes;
} 