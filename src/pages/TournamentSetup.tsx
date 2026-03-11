import { useTournamentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Play, Pause, RotateCcw } from "lucide-react";

export default function TournamentSetup() {
  const { tournament, setTournament, resetAll } = useTournamentStore();

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <h1 className="text-3xl font-display tracking-[0.15em] text-gold-gradient">TOURNAMENT SETUP</h1>

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg tracking-wider">CONFIGURATION</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider mb-1 block">TOURNAMENT NAME</label>
            <Input
              value={tournament.name}
              onChange={e => setTournament({ name: e.target.value.toUpperCase() })}
              className="font-display tracking-wider text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider mb-1 block">TIME CONTROL</label>
              <Input value={tournament.timeControl} onChange={e => setTournament({ timeControl: e.target.value })} className="font-mono" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider mb-1 block">BOARDS</label>
              <Input type="number" min={1} value={tournament.boards} onChange={e => setTournament({ boards: Number(e.target.value) })} className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider mb-1 block">SWISS THRESHOLD (≤ PLAYERS)</label>
              <Input type="number" min={2} value={tournament.swissThreshold} onChange={e => setTournament({ swissThreshold: Number(e.target.value) })} className="font-mono" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider mb-1 block">SWISS ROUNDS (FINAL STAGE)</label>
              <Input type="number" min={1} value={tournament.finalsRounds} onChange={e => setTournament({ finalsRounds: Number(e.target.value) })} className="font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4 mt-4">
          <h3 className="font-display text-sm tracking-wider text-primary mb-2">TOURNAMENT FLOW</h3>
          <div className="font-body text-xs text-muted-foreground tracking-wider space-y-1">
            <p>1. REGISTER ALL PLAYERS</p>
            <p>2. KNOCKOUT PHASE: RANDOM PAIRINGS, NO DRAWS, LOSERS ELIMINATED</p>
            <p>3. COLOR ALTERNATION: IF WON AS WHITE → PLAY BLACK NEXT ROUND</p>
            <p>4. WHEN ≤{tournament.swissThreshold} PLAYERS REMAIN → SWITCH TO SWISS</p>
            <p>5. SWISS PHASE: {tournament.finalsRounds} ROUNDS, POINT-BASED PAIRING</p>
            <p>6. TOP 2 FROM SWISS = CHAMPION & RUNNER-UP</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {tournament.status === 'setup' && (
          <Button onClick={() => setTournament({ status: 'running', currentRound: 0, phase: 'knockout', knockoutRound: 0 })} className="gap-2 bg-gold-gradient font-display tracking-wider">
            <Play className="h-4 w-4" /> START TOURNAMENT
          </Button>
        )}
        {tournament.status === 'running' && (
          <Button onClick={() => setTournament({ status: 'paused' })} variant="outline" className="gap-2 font-display tracking-wider">
            <Pause className="h-4 w-4" /> PAUSE
          </Button>
        )}
        {tournament.status === 'paused' && (
          <Button onClick={() => setTournament({ status: 'running' })} className="gap-2 bg-gold-gradient font-display tracking-wider">
            <Play className="h-4 w-4" /> RESUME
          </Button>
        )}
        <Button onClick={resetAll} variant="destructive" className="gap-2 font-display tracking-wider">
          <RotateCcw className="h-4 w-4" /> RESET ALL
        </Button>
      </div>
    </div>
  );
}
