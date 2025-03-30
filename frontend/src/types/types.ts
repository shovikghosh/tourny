export interface Player {
    id: number;
    name: string;
    email: string;
    rank?: number;
}

export interface Match {
    id: number;
    player1: Player;
    player2: Player;
    score1?: number;
    score2?: number;
    round: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Tournament {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    players: Player[];
    matches: Match[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
} 