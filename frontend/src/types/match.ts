export interface Set {
    player1Score: number;
    player2Score: number;
    winner?: 'player1' | 'player2';
}

export interface Player {
    id: number;
    name: string;
    email: string;
    rank: number;
    active: boolean;
}

export interface Match {
    id: number;
    player1: Player;
    player2: Player;
    round: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    scheduledTime?: string;
    venue?: string;
    notes?: string;
    score: {
        sets: Set[];
        winner?: 'player1' | 'player2';
    };
}

export interface Tournament {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    players: Player[];
    matches: Match[];
}

export interface CreateMatchRequest {
    player1Id: number;
    player2Id: number;
    round: number;
    scheduledTime?: string;
    venue?: string;
    notes?: string;
}

export interface UpdateMatchScoreRequest {
    sets: Set[];
} 