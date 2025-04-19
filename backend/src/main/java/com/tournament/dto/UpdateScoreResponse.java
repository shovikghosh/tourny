package com.tournament.dto;

import com.tournament.model.Match;
import com.tournament.model.ScoreUpdateStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the response after updating a match score.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScoreResponse {
    private Match updatedMatch;
    private ScoreUpdateStatus scoreUpdateStatus;
} 