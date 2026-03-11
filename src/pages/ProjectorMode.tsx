import { useTournamentStore } from "@/lib/store";
import { getRankedPlayers } from "@/lib/tournament-engine";
import { useEffect, useState } from "react";
import { Crown, Medal, Trophy, Swords, Zap, Star } from "lucide-react";

export default function ProjectorMode() {
  const { tournament, players, rounds } = useTournamentStore();
  const ranked = getRankedPlayers(players);
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);
  const phase = tournament.phase || 'knockout';

  const [view, setView] = useState<'leaderboard' | 'matches' | 'announcements' | 'results'>('leaderboard');
  const [time, setTime] = useState(new Date());
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  // Current round (last round in current phase)
  const phaseRounds = rounds.filter(r => r.stage === phase);
  const currentRound = phaseRounds[phaseRounds.length - 1];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle announcements
  useEffect(() => {
    if (tournament.announcements.length > 0) {
      setView('announcements');
      setAnnouncementIdx(0);
      const t = setTimeout(() => setView('matches'), 6000);
      return () => clearTimeout(t);
    }
  }, [tournament.announcements.length]);

  // Auto-cycle between views
  useEffect(() => {
    if (view === 'announcements') return;
    const interval = setInterval(() => {
      setView(prev => {
        if (prev === 'leaderboard') return currentRound ? 'matches' : 'leaderboard';
        if (prev === 'matches') return 'results';
        return 'leaderboard';
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [view, currentRound]);

  const getPlayerName = (id: string | null) => {
    if (!id) return "TBD";
    return players.find(p => p.id === id)?.name || id;
  };

  // Get eliminated players from last knockout round
  const eliminatedThisRound = currentRound?.stage === 'knockout'
    ? currentRound.matches
        .filter(m => m.status === 'completed')
        .map(m => m.result === 'white' ? m.blackPlayerId : m.whitePlayerId)
    : [];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-border bg-card/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-display tracking-[0.2em] text-gold-gradient">
            {tournament.name}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-2xl text-muted-foreground">
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className={`px-4 py-1 font-display tracking-wider text-sm rounded-sm ${
            phase === 'knockout' ? 'bg-destructive/20 text-destructive' :
            phase === 'swiss' ? 'bg-primary/20 text-primary' :
            'bg-success/20 text-success'
          }`}>
            {phase === 'knockout' ? `KNOCKOUT RD ${phaseRounds.length}` :
             phase === 'swiss' ? `SWISS RD ${phaseRounds.length}` :
             'COMPLETED'}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {activePlayers.length} PLAYERS
          </span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 px-8 py-3 bg-secondary/30 shrink-0">
        {(['leaderboard', 'matches', 'results', 'announcements'] as const).map(v => (
          <button
            key={v}
            onClick={(e) => { e.stopPropagation(); setView(v); }}
            className={`px-4 py-2 font-display tracking-wider text-sm rounded-sm transition-colors ${
              view === v ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v.toUpperCase()}
          </button>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); window.close(); }}
          className="ml-auto px-4 py-2 font-display tracking-wider text-sm text-destructive hover:bg-destructive/10 rounded-sm"
        >
          EXIT
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* ANNOUNCEMENTS VIEW */}
        {view === 'announcements' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-4xl">
              <div className="chess-pattern w-24 h-24 mx-auto mb-8 rounded-lg opacity-20" />
              {tournament.announcements.slice(0, 5).map((msg, i) => (
                <div key={i} className={`mb-6 transition-all duration-500 ${i === 0 ? 'scale-110' : 'opacity-60'}`}>
                  <p className={`projector-text ${i === 0 ? 'text-5xl md:text-7xl text-primary' : 'text-2xl md:text-3xl text-muted-foreground'}`}>
                    {msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD VIEW */}
        {view === 'leaderboard' && (
          <div>
            <h2 className="projector-text text-3xl text-primary mb-6 flex items-center gap-3">
              <Star className="h-8 w-8" />
              {phase === 'swiss' ? 'SWISS STANDINGS' : 'STANDINGS'}
            </h2>

            {/* Top 3 podium */}
            {ranked.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map(idx => {
                  const p = ranked[idx];
                  if (!p) return null;
                  return (
                    <div key={p.id} className={`bg-card border rounded-lg p-6 text-center ${
                      idx === 0 ? 'border-primary shadow-gold -mt-4' : 'border-border'
                    }`}>
                      {idx === 0 ? <Crown className="h-10 w-10 text-primary mx-auto mb-2" /> :
                       idx === 1 ? <Medal className="h-8 w-8 text-muted-foreground mx-auto mb-2" /> :
                       <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />}
                      <div className="font-display text-4xl tracking-wider text-foreground mb-1">#{idx + 1}</div>
                      <div className="font-body font-bold tracking-wider text-xl">{p.name}</div>
                      <div className="font-mono text-3xl text-primary mt-2">{p.points}</div>
                      <div className="text-xs font-mono text-muted-foreground">{p.wins}W / {p.draws}D / {p.losses}L</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-1">
              {ranked.slice(0, 20).map((p, i) => (
                <div key={p.id} className={`flex items-center gap-4 px-6 py-4 rounded-sm ${
                  i < 3 ? 'bg-primary/10 border border-primary/20' : i % 2 === 0 ? 'bg-secondary/20' : ''
                }`}>
                  <span className="font-display text-3xl w-12 text-right text-primary">{i + 1}</span>
                  {i === 0 && <Crown className="h-6 w-6 text-primary" />}
                  {i === 1 && <Medal className="h-6 w-6 text-muted-foreground" />}
                  {i === 2 && <Medal className="h-6 w-6 text-accent" />}
                  {i > 2 && <span className="w-6" />}
                  <span className="font-body text-xl font-bold tracking-wider flex-1">{p.name}</span>
                  <span className="font-mono text-3xl text-primary font-bold w-16 text-right">{p.points}</span>
                  <span className="font-mono text-sm text-muted-foreground w-16 text-right">{p.wins}W</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MATCHES VIEW - Current Round */}
        {view === 'matches' && currentRound && (
          <div>
            <h2 className="projector-text text-3xl text-primary mb-6 flex items-center gap-3">
              <Swords className="h-8 w-8" />
              {currentRound.stage.toUpperCase()} ROUND {currentRound.number} — PAIRINGS
            </h2>

            {/* Group matches in separate boxes */}
            {(() => {
              // Group matches by groupName
              const matchesByGroup = currentRound.matches.reduce((acc, m) => {
                const groupKey = m.groupName || 'DEFAULT';
                if (!acc[groupKey]) acc[groupKey] = [];
                acc[groupKey].push(m);
                return acc;
              }, {} as Record<string, typeof currentRound.matches>);

              const groups = Object.keys(matchesByGroup).sort();

              return (
                <div className="space-y-6">
                  {groups.map((groupKey) => {
                    const groupMatches = matchesByGroup[groupKey];
                    const groupLabel = groupKey.replace('GROUP ', '');

                    return (
                      <div key={groupKey} className="bg-card border-2 border-border rounded-lg overflow-hidden">
                        {/* Group Header */}
                        <div className="bg-primary/20 border-b-2 border-border px-6 py-4 flex items-center gap-4">
                          <span className="projector-text text-2xl text-primary font-bold">
                            GROUP {groupLabel}
                          </span>
                          <span className="font-mono text-lg text-muted-foreground">
                            BOARDS B1 - B{groupMatches.length}
                          </span>
                        </div>
                        
                        {/* Group Matches Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                          {groupMatches.map((m, idx) => (
                            <div key={m.id} className={`flex items-center gap-4 px-6 py-5 rounded-lg border ${
                              m.status === 'completed' ? 'border-primary/30 bg-primary/10' : 'border-border bg-card'
                            }`}>
                              <div className="flex flex-col items-center min-w-[60px]">
                                <span className="font-mono text-primary text-xl font-bold">B{idx + 1}</span>
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-lg font-mono text-muted-foreground">♔</span>
                                <span className={`font-body text-xl tracking-wider flex-1 text-right ${
                                  m.result === 'white' ? 'text-primary font-bold' : ''
                                }`}>
                                  {getPlayerName(m.whitePlayerId)}
                                  {m.result === 'white' && <Crown className="inline ml-2 h-5 w-5" />}
                                </span>
                              </div>
                              <span className="font-display text-2xl text-muted-foreground mx-3">
                                {m.result ? (m.result === 'white' ? '1-0' : m.result === 'black' ? '0-1' : '½-½') : 'VS'}
                              </span>
                              <div className="flex-1 flex items-center gap-2">
                                <span className={`font-body text-xl tracking-wider flex-1 ${
                                  m.result === 'black' ? 'text-primary font-bold' : ''
                                }`}>
                                  {getPlayerName(m.blackPlayerId)}
                                  {m.result === 'black' && <Crown className="inline ml-2 h-5 w-5" />}
                                </span>
                                <span className="text-lg font-mono text-muted-foreground">♚</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {currentRound.byePlayerId && (
              <div className="mt-4 bg-warning/10 border border-warning/30 rounded-lg px-6 py-4 font-body text-lg tracking-wider text-center">
                BYE: {getPlayerName(currentRound.byePlayerId)} — ADVANCES AUTOMATICALLY
              </div>
            )}
          </div>
        )}
        {view === 'matches' && !currentRound && (
          <div className="flex items-center justify-center h-full">
            <p className="projector-text text-3xl text-muted-foreground">WAITING FOR NEXT ROUND...</p>
          </div>
        )}

        {/* RESULTS VIEW - Round results + eliminated */}
        {view === 'results' && (
          <div>
            <h2 className="projector-text text-3xl text-primary mb-6 flex items-center gap-3">
              <Zap className="h-8 w-8" />
              {phase === 'completed' ? 'FINAL RESULTS' : 'ROUND RESULTS'}
            </h2>

            {phase === 'completed' && ranked.length >= 2 && (
              <div className="bg-card border-2 border-primary rounded-lg p-8 mb-8 text-center shadow-gold">
                <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="projector-text text-5xl text-primary mb-2">CHAMPION</p>
                <p className="font-body text-4xl font-bold tracking-wider">{ranked[0]?.name}</p>
                <p className="font-mono text-2xl text-primary mt-2">{ranked[0]?.points} POINTS</p>
                <div className="border-t border-border mt-6 pt-6 flex justify-center gap-12">
                  <div>
                    <Medal className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <p className="font-display text-lg text-muted-foreground">RUNNER-UP</p>
                    <p className="font-body text-xl font-bold tracking-wider">{ranked[1]?.name}</p>
                  </div>
                  {ranked[2] && (
                    <div>
                      <Trophy className="h-8 w-8 text-accent mx-auto mb-1" />
                      <p className="font-display text-lg text-accent">THIRD</p>
                      <p className="font-body text-xl font-bold tracking-wider">{ranked[2]?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'knockout' && eliminatedThisRound.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display tracking-wider text-destructive text-lg mb-3">ELIMINATED THIS ROUND</h3>
                <div className="flex flex-wrap gap-2">
                  {eliminatedThisRound.map(id => (
                    <span key={id} className="px-3 py-1 bg-destructive/10 border border-destructive/30 rounded-sm font-body text-sm tracking-wider text-destructive">
                      {getPlayerName(id)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* All rounds summary */}
            <div className="space-y-4">
              {[...rounds].reverse().slice(0, 5).map(r => (
                <div key={r.id} className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-display tracking-wider text-sm text-primary mb-2">
                    {r.stage.toUpperCase()} ROUND {r.number} — {r.status.toUpperCase()}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {r.matches.filter(m => m.status === 'completed').map(m => (
                      <div key={m.id} className="text-sm font-body tracking-wider">
                        <span className={m.result === 'white' ? 'text-primary font-bold' : ''}>{getPlayerName(m.whitePlayerId)}</span>
                        <span className="text-muted-foreground mx-1">
                          {m.result === 'white' ? '1-0' : m.result === 'black' ? '0-1' : '½-½'}
                        </span>
                        <span className={m.result === 'black' ? 'text-primary font-bold' : ''}>{getPlayerName(m.blackPlayerId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
