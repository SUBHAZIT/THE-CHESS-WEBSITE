import { useTournamentStore } from "@/lib/store";
import { getRankedPlayers } from "@/lib/tournament-engine";
import { Medal, Download, Trophy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  const { players, tournament } = useTournamentStore();
  const ranked = getRankedPlayers(players);
  const phase = tournament.phase || 'knockout';

  const handleExportCSV = () => {
    const csv = [
      "RANK,ID,NAME,POINTS,WINS,DRAWS,LOSSES,BUCHHOLZ,STATUS",
      ...ranked.map((p, i) =>
        `${i + 1},${p.id},${p.name},${p.points},${p.wins},${p.draws},${p.losses},${p.buchholz},${p.status}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display tracking-[0.15em] text-gold-gradient">LEADERBOARD</h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-sm text-xs font-display tracking-wider ${
            phase === 'knockout' ? 'bg-destructive/20 text-destructive' :
            phase === 'swiss' ? 'bg-primary/20 text-primary' :
            'bg-success/20 text-success'
          }`}>
            {phase.toUpperCase()} PHASE
          </span>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 font-display tracking-wider">
            <Download className="h-4 w-4" /> EXPORT CSV
          </Button>
        </div>
      </div>

      {/* Top 3 */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map(idx => {
            const p = ranked[idx];
            if (!p) return null;
            return (
              <div key={p.id} className={`bg-card border rounded-lg p-6 text-center ${
                idx === 0 ? 'border-primary shadow-gold' : 'border-border'
              } ${idx === 0 ? 'md:-mt-4' : ''}`}>
                {idx === 0 ? <Crown className="h-8 w-8 text-primary mx-auto mb-2" /> :
                 idx === 1 ? <Medal className="h-6 w-6 text-muted-foreground mx-auto mb-2" /> :
                 <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />}
                <div className="font-display text-3xl tracking-wider text-foreground mb-1">#{idx + 1}</div>
                <div className="font-body font-bold tracking-wider text-lg">{p.name}</div>
                <div className="font-mono text-2xl text-primary mt-2">{p.points}</div>
                <div className="text-xs font-mono text-muted-foreground">POINTS</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              {["#", "ID", "PLAYER", "PTS", "W", "D", "L", "BUCHHOLZ", "STATUS"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-display tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr key={p.id} className={`border-t border-border hover:bg-secondary/20 transition-colors ${i < 3 ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3 font-display text-lg text-primary">{i + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="px-4 py-3 font-body font-semibold tracking-wider">
                  {p.name}
                  {i === 0 && phase === 'completed' && <Crown className="inline ml-1 h-3 w-3 text-primary" />}
                </td>
                <td className="px-4 py-3 font-mono text-lg font-bold text-primary">{p.points}</td>
                <td className="px-4 py-3 font-mono text-sm text-success">{p.wins}</td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{p.draws}</td>
                <td className="px-4 py-3 font-mono text-sm text-destructive">{p.losses}</td>
                <td className="px-4 py-3 font-mono text-sm">{p.buchholz}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                    p.status === 'active' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ranked.length === 0 && (
          <div className="p-8 text-center text-muted-foreground font-body tracking-wider">NO PLAYERS TO RANK</div>
        )}
      </div>
    </div>
  );
}
