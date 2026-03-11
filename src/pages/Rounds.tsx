import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import {
  generateKnockoutRoundPairings,
  generateSwissPairings,
  applyMatchResult,
  applyBye,
  eliminateLoser,
  getRankedPlayers,
  autoDistributePlayersToGroups,
} from "@/lib/tournament-engine";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Megaphone, Crown, Trophy, Swords, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Rounds() {
  const {
    tournament, players, rounds, groups,
    setTournament, setPlayers, setGroups, addRound, updateRound, addAnnouncement,
  } = useTournamentStore();
  const [announcement, setAnnouncement] = useState("");
  const [activeRoundNum, setActiveRoundNum] = useState<number | null>(null);

  const phase = tournament.phase || 'knockout';
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);

  // Filter rounds by current phase
  const phaseRounds = rounds.filter(r => r.stage === phase);
  const currentViewRound = activeRoundNum
    ? phaseRounds.find(r => r.number === activeRoundNum)
    : phaseRounds[phaseRounds.length - 1];

  const lastRound = phaseRounds[phaseRounds.length - 1];
  const canGenerate = !lastRound || lastRound.status === 'completed';

  // Check if we should switch to Swiss
  const shouldSwitchToSwiss = phase === 'knockout' && activePlayers.length <= tournament.swissThreshold && phaseRounds.length > 0;

  // Swiss: max 4 rounds
  const swissRounds = rounds.filter(r => r.stage === 'swiss');
  const swissMaxRounds = tournament.finalsRounds || 4;
  const canGenerateSwiss = phase === 'swiss' && swissRounds.length < swissMaxRounds && canGenerate;

  const handleGenerateKnockoutRound = () => {
    const nextRoundNum = phaseRounds.length + 1;
    
    // Auto-distribute players to groups if > 20 players (10 boards × 2 players)
    let playerGroups = groups;
    if (!groups || groups.length === 0) {
      playerGroups = autoDistributePlayersToGroups(players, tournament.boards);
      setGroups(playerGroups);
    }
    
    const round = generateKnockoutRoundPairings(players, nextRoundNum, tournament.boards, playerGroups);

    if (round.byePlayerId) {
      setPlayers(applyBye(players, round.byePlayerId));
    }

    addRound(round);
    setTournament({ knockoutRound: nextRoundNum });
    
    const groupInfo = playerGroups.length > 1 
      ? ` — ${playerGroups.length} GROUPS (${playerGroups.map(g => g.name).join(', ')})`
      : '';
    addAnnouncement(`⚔️ KNOCKOUT ROUND ${nextRoundNum} — ${activePlayers.length} PLAYERS${groupInfo} — READY`);
    setActiveRoundNum(nextRoundNum);
  };

  const handleSwitchToSwiss = () => {
    // Reset points for Swiss phase
    const updatedPlayers = players.map(p => {
      if (p.status === 'active' && p.checkedIn) {
        return {
          ...p,
          points: 0, wins: 0, draws: 0, losses: 0,
          opponentHistory: [], colorHistory: [],
          buchholz: 0, sonnebornBerger: 0,
        };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    setTournament({ phase: 'swiss' });
    addAnnouncement(`🔄 PHASE CHANGE: ${activePlayers.length} PLAYERS ADVANCE TO SWISS FORMAT — 4 ROUNDS`);
    setActiveRoundNum(null);
  };

  const handleGenerateSwissRound = () => {
    const nextRoundNum = swissRounds.length + 1;
    const swissPlayers = players.filter(p => p.status === 'active' && p.checkedIn);
    const round = generateSwissPairings(swissPlayers, nextRoundNum, tournament.boards, undefined, 'swiss');

    if (round.byePlayerId) {
      setPlayers(applyBye(players, round.byePlayerId));
    }

    addRound(round);
    setTournament({ currentRound: nextRoundNum });
    addAnnouncement(`♟️ SWISS ROUND ${nextRoundNum} — POINT-BASED PAIRINGS READY`);
    setActiveRoundNum(nextRoundNum);
  };

  const handleResult = (matchId: string, result: 'white' | 'black' | 'draw') => {
    if (!currentViewRound) return;
    const match = currentViewRound.matches.find(m => m.id === matchId);
    if (!match) return;

    // In knockout, no draws allowed
    if (currentViewRound.stage === 'knockout' && result === 'draw') return;

    const updatedMatch = { ...match, result, status: 'completed' as const };
    const updatedMatches = currentViewRound.matches.map(m => m.id === matchId ? updatedMatch : m);
    const allDone = updatedMatches.every(m => m.status === 'completed');

    updateRound(currentViewRound.id, {
      matches: updatedMatches,
      status: allDone ? 'completed' : 'in_progress',
    });

    // Apply result to players
    let updatedPlayers = applyMatchResult(players, updatedMatch);

    // In knockout, eliminate the loser
    if (currentViewRound.stage === 'knockout') {
      updatedPlayers = eliminateLoser(updatedPlayers, updatedMatch);
    }

    setPlayers(updatedPlayers);

    if (allDone) {
      const remaining = updatedPlayers.filter(p => p.status === 'active' && p.checkedIn);

      if (currentViewRound.stage === 'knockout') {
        addAnnouncement(`✅ KNOCKOUT ROUND ${currentViewRound.number} COMPLETED — ${remaining.length} PLAYERS REMAIN`);

        // Check if should switch to Swiss
        if (remaining.length <= tournament.swissThreshold) {
          addAnnouncement(`🎯 ${remaining.length} PLAYERS REMAINING — READY TO SWITCH TO SWISS FORMAT`);
        }
      }

      if (currentViewRound.stage === 'swiss') {
        addAnnouncement(`✅ SWISS ROUND ${currentViewRound.number} COMPLETED`);

        // Check if all Swiss rounds done
        const totalSwissRounds = rounds.filter(r => r.stage === 'swiss').length;
        if (totalSwissRounds >= swissMaxRounds) {
          const ranked = getRankedPlayers(updatedPlayers);
          setTournament({ phase: 'completed', status: 'completed' });
          if (ranked[0]) addAnnouncement(`🏆 CHAMPION: ${ranked[0].name}`);
          if (ranked[1]) addAnnouncement(`🥈 RUNNER-UP: ${ranked[1].name}`);
          if (ranked[2]) addAnnouncement(`🥉 THIRD PLACE: ${ranked[2].name}`);
        }
      }
    }
  };

  const handleAnnounce = () => {
    if (announcement.trim()) {
      addAnnouncement(announcement.trim().toUpperCase());
      setAnnouncement("");
    }
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || id;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display tracking-[0.15em] text-gold-gradient">ROUND MANAGER</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground tracking-wider">
            {activePlayers.length} ACTIVE PLAYERS
          </span>
          <span className={`px-3 py-1 rounded-sm text-xs font-display tracking-wider ${
            phase === 'knockout' ? 'bg-destructive/20 text-destructive' :
            phase === 'swiss' ? 'bg-primary/20 text-primary' :
            'bg-success/20 text-success'
          }`}>
            {phase.toUpperCase()} PHASE
          </span>
        </div>
      </div>

      {/* Announcement */}
      <div className="flex gap-2">
        <Input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="TYPE ANNOUNCEMENT..." className="font-body tracking-wider" onKeyDown={e => e.key === 'Enter' && handleAnnounce()} />
        <Button onClick={handleAnnounce} variant="outline" className="gap-2 font-display tracking-wider shrink-0">
          <Megaphone className="h-4 w-4" /> ANNOUNCE
        </Button>
      </div>

      {/* Phase Info */}
      <div className="bg-card border border-border rounded-lg p-4">
        {phase === 'knockout' && (
          <div className="flex items-center gap-4 flex-wrap">
            <Swords className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-display tracking-wider text-sm">KNOCKOUT ELIMINATION</p>
              <p className="text-xs font-body text-muted-foreground tracking-wider">
                RANDOM PAIRING • NO DRAWS • LOSER ELIMINATED • COLOR ALTERNATION
              </p>
              <p className="text-xs font-body text-muted-foreground tracking-wider mt-1">
                WHEN ≤{tournament.swissThreshold} PLAYERS REMAIN → SWITCH TO SWISS ({swissMaxRounds} ROUNDS)
              </p>
            </div>
          </div>
        )}
        {phase === 'swiss' && (
          <div className="flex items-center gap-4 flex-wrap">
            <Trophy className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display tracking-wider text-sm">SWISS FORMAT — FINAL STAGE</p>
              <p className="text-xs font-body text-muted-foreground tracking-wider">
                {activePlayers.length} PLAYERS • {swissMaxRounds} ROUNDS • POINT-BASED PAIRING • TOP 2 WIN
              </p>
              <p className="text-xs font-body text-muted-foreground tracking-wider mt-1">
                ROUND {swissRounds.length}/{swissMaxRounds} COMPLETED
              </p>
            </div>
          </div>
        )}
        {phase === 'completed' && (
          <div className="flex items-center gap-4">
            <Crown className="h-5 w-5 text-primary" />
            <p className="font-display tracking-wider text-sm text-primary">TOURNAMENT COMPLETED</p>
          </div>
        )}
      </div>

      {/* Round tabs */}
      {phaseRounds.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {phaseRounds.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRoundNum(r.number)}
              className={`px-3 py-1.5 rounded-sm font-display tracking-wider text-xs border transition-colors ${
                r.number === (activeRoundNum || phaseRounds[phaseRounds.length - 1]?.number)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              ROUND {r.number}
              {r.status === 'completed' && <CheckCircle className="inline ml-1 h-3 w-3" />}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {phase === 'knockout' && canGenerate && !shouldSwitchToSwiss && activePlayers.length > 1 && (
          <Button onClick={handleGenerateKnockoutRound} className="gap-2 bg-gold-gradient font-display tracking-wider">
            <Zap className="h-4 w-4" /> GENERATE KNOCKOUT ROUND {phaseRounds.length + 1}
          </Button>
        )}
        {shouldSwitchToSwiss && (
          <Button onClick={handleSwitchToSwiss} className="gap-2 bg-gold-gradient font-display tracking-wider animate-pulse">
            <ArrowRight className="h-4 w-4" /> SWITCH TO SWISS ({activePlayers.length} PLAYERS)
          </Button>
        )}
        {canGenerateSwiss && (
          <Button onClick={handleGenerateSwissRound} className="gap-2 bg-gold-gradient font-display tracking-wider">
            <Zap className="h-4 w-4" /> GENERATE SWISS ROUND {swissRounds.length + 1}
          </Button>
        )}
      </div>

      {/* Current Round Matches */}
      {currentViewRound ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg tracking-wider text-foreground">
              {currentViewRound.stage.toUpperCase()} — ROUND {currentViewRound.number}
            </h2>
            {currentViewRound.status === 'completed' && <CheckCircle className="h-4 w-4 text-success" />}
            <span className="text-xs font-mono text-muted-foreground ml-auto">
              {currentViewRound.matches.filter(m => m.status === 'completed').length}/{currentViewRound.matches.length} COMPLETED
            </span>
          </div>

          {currentViewRound.byePlayerId && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 font-body text-sm tracking-wider">
              BYE: {getPlayerName(currentViewRound.byePlayerId)} (+1 POINT, ADVANCES)
            </div>
          )}

          {/* Group matches in separate boxes */}
          {(() => {
            // Group matches by groupName
            const matchesByGroup = currentViewRound.matches.reduce((acc, m) => {
              const groupKey = m.groupName || 'DEFAULT';
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(m);
              return acc;
            }, {} as Record<string, typeof currentViewRound.matches>);

            const groups = Object.keys(matchesByGroup).sort();

            return groups.map((groupKey) => {
              const groupMatches = matchesByGroup[groupKey];
              const groupLabel = groupKey.replace('GROUP ', '');

              return (
                <div key={groupKey} className="bg-card border border-border rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center gap-3">
                    <span className="font-display text-lg tracking-wider text-primary">
                      GROUP {groupLabel}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {groupMatches.length} MATCHES • BOARDS 1-{groupMatches.length}
                    </span>
                  </div>
                  
                  {/* Group Matches Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-secondary/30">
                          {["BOARD", "WHITE ♔", "VS", "BLACK ♚", "RESULT", "ACTIONS"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-display tracking-widest text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {groupMatches.map((m, idx) => (
                          <tr key={m.id} className={`border-t border-border transition-colors ${
                            m.status === 'completed'
                              ? m.result === 'white' ? 'bg-primary/5' : m.result === 'black' ? 'bg-secondary/20' : 'bg-muted/20'
                              : 'hover:bg-secondary/20'
                          }`}>
                            <td className="px-4 py-3 font-mono text-primary">
                              B{idx + 1}
                            </td>
                            <td className={`px-4 py-3 font-body font-semibold tracking-wider ${m.result === 'white' ? 'text-primary' : ''}`}>
                              {getPlayerName(m.whitePlayerId)}
                              {m.result === 'white' && <Crown className="inline ml-1 h-3 w-3 text-primary" />}
                            </td>
                            <td className="px-4 py-3 font-display text-muted-foreground">VS</td>
                            <td className={`px-4 py-3 font-body font-semibold tracking-wider ${m.result === 'black' ? 'text-primary' : ''}`}>
                              {getPlayerName(m.blackPlayerId)}
                              {m.result === 'black' && <Crown className="inline ml-1 h-3 w-3 text-primary" />}
                            </td>
                            <td className="px-4 py-3">
                              {m.result ? (
                                <span className="font-mono text-xs tracking-wider px-2 py-1 rounded-sm bg-primary/20 text-primary">
                                  {m.result === 'white' ? '1-0' : m.result === 'black' ? '0-1' : '½-½'}
                                </span>
                              ) : (
                                <span className="text-xs font-mono text-muted-foreground">PENDING</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {m.status !== 'completed' ? (
                                <div className="flex gap-1">
                                  <button onClick={() => handleResult(m.id, 'white')} className="px-2 py-1 text-xs font-mono rounded-sm bg-card border border-border hover:border-primary hover:text-primary transition-colors">1-0</button>
                                  {currentViewRound.stage === 'swiss' && (
                                    <button onClick={() => handleResult(m.id, 'draw')} className="px-2 py-1 text-xs font-mono rounded-sm bg-card border border-border hover:border-primary hover:text-primary transition-colors">½-½</button>
                                  )}
                                  <button onClick={() => handleResult(m.id, 'black')} className="px-2 py-1 text-xs font-mono rounded-sm bg-card border border-border hover:border-primary hover:text-primary transition-colors">0-1</button>
                                </div>
                              ) : (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-xl tracking-wider text-muted-foreground">
            {tournament.status === 'setup' ? "START THE TOURNAMENT FIRST" : 
             phase === 'knockout' ? "GENERATE KNOCKOUT ROUND TO BEGIN" : 
             phase === 'swiss' ? "GENERATE SWISS ROUND TO BEGIN" :
             "TOURNAMENT COMPLETED"}
          </p>
        </div>
      )}
    </div>
  );
}
