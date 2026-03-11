import { useTournamentStore } from "@/lib/store";
import { getRankedPlayers } from "@/lib/tournament-engine";
import { Users, Trophy, Swords, Medal, Activity, Crown, Zap } from "lucide-react";

const Index = () => {
  const { tournament, players, rounds } = useTournamentStore();
  const activePlayers = players.filter(p => p.status === 'active');
  const eliminatedPlayers = players.filter(p => p.status === 'inactive');
  const phase = tournament.phase || 'knockout';
  const ranked = getRankedPlayers(players);

  const koRounds = rounds.filter(r => r.stage === 'knockout').length;
  const swissRounds = rounds.filter(r => r.stage === 'swiss').length;

  const stats = [
    { label: "TOTAL PLAYERS", value: players.length, icon: Users, sub: `${activePlayers.length} ACTIVE` },
    { label: "ELIMINATED", value: eliminatedPlayers.length, icon: Swords, sub: `${activePlayers.length} REMAINING` },
    { label: "KO ROUNDS", value: koRounds, icon: Zap },
    { label: "SWISS ROUNDS", value: `${swissRounds}/${tournament.finalsRounds}`, icon: Activity },
    { label: "PHASE", value: phase.toUpperCase(), icon: Trophy },
    { label: "TIME", value: tournament.timeControl, icon: Medal },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-gold">
        <div className="absolute inset-0 chess-pattern opacity-20" />
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-display tracking-[0.2em] text-gold-gradient mb-2">
            THE BLITZ
          </h1>
          <p className="text-muted-foreground font-body text-lg tracking-wider">
            CHESS TOURNAMENT COMMAND CENTER
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono tracking-wider ${
              tournament.status === 'running' 
                ? 'bg-success/20 text-success' 
                : tournament.status === 'paused'
                ? 'bg-warning/20 text-warning'
                : tournament.status === 'completed'
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                tournament.status === 'running' ? 'bg-success animate-pulse' : 
                tournament.status === 'paused' ? 'bg-warning' : 
                tournament.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              {tournament.status.toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-mono tracking-wider ${
              phase === 'knockout' ? 'bg-destructive/20 text-destructive' :
              phase === 'swiss' ? 'bg-primary/20 text-primary' :
              'bg-success/20 text-success'
            }`}>
              {phase.toUpperCase()} PHASE
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-display tracking-wider text-foreground">
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-xs text-muted-foreground font-mono">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Top Players */}
      {ranked.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-xl tracking-wider text-primary mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5" /> TOP PLAYERS
          </h2>
          <div className="space-y-2">
            {ranked.slice(0, 5).map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 px-3 rounded-sm ${i < 3 ? 'bg-primary/5' : ''}`}>
                <span className="font-display text-lg text-primary w-8">{i + 1}</span>
                <span className="font-body font-bold tracking-wider flex-1">{p.name}</span>
                <span className="font-mono text-primary text-lg">{p.points}P</span>
                <span className="font-mono text-xs text-muted-foreground">{p.wins}W</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {tournament.announcements.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-xl tracking-wider text-primary mb-4">ANNOUNCEMENTS</h2>
          <div className="space-y-2">
            {tournament.announcements.slice(0, 5).map((msg, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="font-body text-sm tracking-wider text-foreground">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
