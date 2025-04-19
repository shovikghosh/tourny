import { PieChart } from 'react-minimal-pie-chart';

interface MatchStatsProps {
  match: {
    player1: { name: string };
    player2: { name: string };
    score: {
      player1TotalScore: number;
      player2TotalScore: number;
      player1SetsWon: number;
      player2SetsWon: number;
    };
  };
}

export function MatchStats({ match }: MatchStatsProps) {
  // Calculate percentage of points won
  const player1Points = match.score.player1TotalScore;
  const player2Points = match.score.player2TotalScore;
  const totalPoints = player1Points + player2Points;
  
  const player1Percentage = Math.round((player1Points / totalPoints) * 100) || 0;
  const player2Percentage = Math.round((player2Points / totalPoints) * 100) || 0;
  
  return (
    <div className="wtt-card p-6">
      <h3 className="text-lg font-semibold mb-4">Match Statistics</h3>
      
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-40 h-40">
          <PieChart
            data={[
              { title: match.player1.name, value: player1Points, color: 'hsl(var(--primary))' },
              { title: match.player2.name, value: player2Points, color: 'hsl(var(--secondary))' },
            ]}
            lineWidth={20}
            paddingAngle={2}
            rounded
            label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
            labelStyle={{
              fontSize: '6px',
              fontFamily: 'sans-serif',
              fill: 'white',
            }}
            labelPosition={70}
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{match.player1.name}</span>
              <span className="text-sm font-medium">{player1Percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${player1Percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{match.player2.name}</span>
              <span className="text-sm font-medium">{player2Percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-secondary h-2 rounded-full" 
                style={{ width: `${player2Percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="pt-2 flex justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold">{match.score.player1SetsWon}</div>
              <div className="text-xs text-muted-foreground">Sets Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{match.score.player2SetsWon}</div>
              <div className="text-xs text-muted-foreground">Sets Won</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 