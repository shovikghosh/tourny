package com.tournament.dto;

import lombok.Data;
import java.util.List;

@Data
public class AddPlayersRequest {
    private List<Long> playerIds;
} 