package com.tournament.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateTournamentRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> playerIds;
} 