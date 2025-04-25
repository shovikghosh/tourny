'use client';

import { useState, useEffect } from 'react';
import { Match, Set, UpdateMatchScoreRequest } from '@/types/match';
import { api } from '@/services/api';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    TextField, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Avatar, 
    Chip, 
    Grid, 
    IconButton,
    InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Check as CheckIcon } from '@mui/icons-material';

interface MatchScoreProps {
    match: Match;
    tournamentId: number;
    onScoreUpdate: (updatedMatch: Match) => void;
}

export default function MatchScore({ match, tournamentId, onScoreUpdate }: MatchScoreProps) {
    const [currentSet, setCurrentSet] = useState<Set>({
        player1Score: 0,
        player2Score: 0,
    });
    
    // State to track if a score is being edited
    const [isEditingPlayer1, setIsEditingPlayer1] = useState(false);
    const [isEditingPlayer2, setIsEditingPlayer2] = useState(false);
    
    // Reset the current set when match data changes from outside
    useEffect(() => {
        if (match.status === 'COMPLETED') {
            setCurrentSet({ player1Score: 0, player2Score: 0 });
        }
    }, [match.status, match.score.sets.length]);

    const handleScoreUpdate = async (player: 'player1' | 'player2') => {
        const newScore = player === 'player1' 
            ? currentSet.player1Score + 1 
            : currentSet.player2Score + 1;

        // Create the updated set object based on the new score
        const potentiallyUpdatedSet = {
            ...currentSet,
            [player === 'player1' ? 'player1Score' : 'player2Score']: newScore,
        };

        await updateScore(potentiallyUpdatedSet);
    };

    const handleDirectScoreInput = (player: 'player1' | 'player2', value: string) => {
        // Handle direct input of score values
        const numValue = value === '' ? 0 : parseInt(value, 10);
        const validValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
        
        const updatedSet = {
            ...currentSet,
            [`${player}Score`]: validValue,
        };
        
        setCurrentSet(updatedSet);
    };

    const handleScoreInputBlur = async (player: 'player1' | 'player2') => {
        // When input loses focus, update the score if needed
        if (player === 'player1') {
            setIsEditingPlayer1(false);
        } else {
            setIsEditingPlayer2(false);
        }
        
        await updateScore(currentSet);
    };

    const handleScoreInputKeyDown = async (e: React.KeyboardEvent, player: 'player1' | 'player2') => {
        if (e.key === 'Enter') {
            if (player === 'player1') {
                setIsEditingPlayer1(false);
            } else {
                setIsEditingPlayer2(false);
            }
            
            await updateScore(currentSet);
        }
    };

    const updateScore = async (newSetState: Set) => {
        // Determine if this set is completed with these scores
        let setCompletedByThisPoint = false;
        let thisSetWinner: ('player1' | 'player2' | undefined) = undefined;
        
        const player1Score = newSetState.player1Score || 0;
        const player2Score = newSetState.player2Score || 0;
        
        // Only determine a winner when both scores are present and valid
        // This ensures we don't prematurely select a winner when only one score has been entered
        if (player1Score >= 11 && player2Score > 0 && Math.abs(player1Score - player2Score) >= 2) {
            setCompletedByThisPoint = true;
            thisSetWinner = 'player1';
            newSetState.winner = thisSetWinner;
        } else if (player2Score >= 11 && player1Score > 0 && Math.abs(player2Score - player1Score) >= 2) {
            setCompletedByThisPoint = true;
            thisSetWinner = 'player2';
            newSetState.winner = thisSetWinner;
        }

        if (setCompletedByThisPoint) {
            try {
                // Prepare the score payload to send to the backend
                const scorePayload: UpdateMatchScoreRequest = {
                    sets: [...match.score.sets, newSetState],
                };

                // Call the API
                const response = await api.updateMatchScore(tournamentId, match.id, scorePayload);
                
                console.log("API Response:", response);

                // Handle based on the status returned from backend
                switch (response.scoreUpdateStatus) {
                    case 'MATCH_COMPLETED':
                    case 'SET_COMPLETED_MATCH_IN_PROGRESS':
                        // Set finished, reset for next set or match over
                        setCurrentSet({ player1Score: 0, player2Score: 0 });
                        break;
                    case 'SET_IN_PROGRESS':
                        setCurrentSet(newSetState);
                        break;
                }
                
                // Notify parent component with the full updated match state from backend
                onScoreUpdate(response.updatedMatch);
                
            } catch (error) {
                console.error("Failed to update match score:", error);
            }
        } else {
            // If set is NOT completed by these scores, just update the local state
            setCurrentSet(newSetState);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Current set score */}
            {(match.status === 'PENDING' || match.status === 'IN_PROGRESS') && (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                            Current Set
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2 
                                    }}>
                                        <Avatar 
                                            sx={{ 
                                                bgcolor: 'primary.main', 
                                                color: 'primary.contrastText',
                                                width: 36,
                                                height: 36,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            P1
                                        </Avatar>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ ml: 1, fontWeight: 'medium' }}
                                        >
                                            {match.player1.name}
                                        </Typography>
                                    </Box>
                                    
                                    {isEditingPlayer1 ? (
                                        <TextField
                                            type="number"
                                            variant="standard"
                                            InputProps={{
                                                inputProps: { min: 0 },
                                                sx: { 
                                                    fontSize: '2.5rem', 
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    width: '6rem'
                                                },
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton 
                                                            onClick={() => handleScoreInputBlur('player1')}
                                                            edge="end"
                                                        >
                                                            <CheckIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            value={isEditingPlayer1 && currentSet.player1Score === 0 ? '' : currentSet.player1Score}
                                            onChange={(e) => handleDirectScoreInput('player1', e.target.value)}
                                            onBlur={() => handleScoreInputBlur('player1')}
                                            onKeyDown={(e) => handleScoreInputKeyDown(e, 'player1')}
                                            autoFocus
                                        />
                                    ) : (
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center' 
                                            }}
                                        >
                                            <Typography 
                                                variant="h3" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    '&:hover': { color: 'primary.main' }
                                                }}
                                                onClick={() => setIsEditingPlayer1(true)}
                                            >
                                                {currentSet.player1Score}
                                            </Typography>
                                            <IconButton 
                                                size="small" 
                                                sx={{ ml: 1 }}
                                                onClick={() => setIsEditingPlayer1(true)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleScoreUpdate('player1')}
                                        disabled={match.status !== 'PENDING' && match.status !== 'IN_PROGRESS'}
                                        sx={{ mt: 2, width: '100%' }}
                                    >
                                        Add Point
                                    </Button>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2 
                                    }}>
                                        <Avatar 
                                            sx={{ 
                                                bgcolor: 'secondary.main', 
                                                color: 'secondary.contrastText',
                                                width: 36,
                                                height: 36,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            P2
                                        </Avatar>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ ml: 1, fontWeight: 'medium' }}
                                        >
                                            {match.player2.name}
                                        </Typography>
                                    </Box>
                                    
                                    {isEditingPlayer2 ? (
                                        <TextField
                                            type="number"
                                            variant="standard"
                                            InputProps={{
                                                inputProps: { min: 0 },
                                                sx: { 
                                                    fontSize: '2.5rem', 
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    width: '6rem'
                                                },
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton 
                                                            onClick={() => handleScoreInputBlur('player2')}
                                                            edge="end"
                                                        >
                                                            <CheckIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            value={isEditingPlayer2 && currentSet.player2Score === 0 ? '' : currentSet.player2Score}
                                            onChange={(e) => handleDirectScoreInput('player2', e.target.value)}
                                            onBlur={() => handleScoreInputBlur('player2')}
                                            onKeyDown={(e) => handleScoreInputKeyDown(e, 'player2')}
                                            autoFocus
                                        />
                                    ) : (
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center' 
                                            }}
                                        >
                                            <Typography 
                                                variant="h3" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    '&:hover': { color: 'secondary.main' }
                                                }}
                                                onClick={() => setIsEditingPlayer2(true)}
                                            >
                                                {currentSet.player2Score}
                                            </Typography>
                                            <IconButton 
                                                size="small" 
                                                sx={{ ml: 1 }}
                                                onClick={() => setIsEditingPlayer2(true)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}

                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleScoreUpdate('player2')}
                                        disabled={match.status !== 'PENDING' && match.status !== 'IN_PROGRESS'}
                                        sx={{ mt: 2, width: '100%' }}
                                    >
                                        Add Point
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Completed sets */}
            {match.score.sets.length > 0 && (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Completed Sets
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Set</TableCell>
                                        <TableCell align="center">{match.player1.name}</TableCell>
                                        <TableCell align="center">{match.player2.name}</TableCell>
                                        <TableCell align="right">Winner</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {match.score.sets.map((set, index) => (
                                        <TableRow key={`set-${index}-${set?.player1Score}-${set?.player2Score}`}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'medium' }}>
                                                {set?.player1Score ?? 'N/A'}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'medium' }}>
                                                {set?.player2Score ?? 'N/A'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {set?.winner && (
                                                    <Chip
                                                        label={set.winner?.toLowerCase() === 'player1' 
                                                            ? match.player1.name 
                                                            : match.player2.name
                                                        }
                                                        size="small"
                                                        color={set.winner?.toLowerCase() === 'player1' ? "primary" : "secondary"}
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Match winner */}
            {match.status === 'COMPLETED' && match.score.winner && (
                <Card 
                    sx={{ 
                        borderRadius: 2,
                        background: 'linear-gradient(to right, #3f51b5, #f50057)',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Winner: {match.score.winner === 'player1' ? match.player1.name : match.player2.name}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
} 