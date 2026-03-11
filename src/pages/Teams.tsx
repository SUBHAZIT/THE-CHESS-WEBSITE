import { useTournamentStore } from "@/lib/store";
import { distributePlayersToGroups } from "@/lib/tournament-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Shuffle, CheckCircle, Crown } from "lucide-react";

export default function Teams() {
  const { players, groups, setGroups, updatePlayer, tournament } = useTournamentStore();

  const groupSize = tournament.groupSize || 20;

  const handleAutoDistribute = () => {
    const newGroups = distributePlayersToGroups(players, groupSize);
    setGroups(newGroups);
    // Update player groupIds
    newGroups.forEach(g => {
      g.playerIds.forEach(pid => updatePlayer(pid, { groupId: g.id }));
    });
  };

  const activeCount = players.filter(p => p.status === 'active' && p.checkedIn).length;
  const expectedGroups = Math.ceil(activeCount / groupSize);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display tracking-[0.15em] text-gold-gradient">GROUPS</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            {activeCount} PLAYERS → {expectedGroups} GROUPS OF ~{groupSize}
          </span>
          <Button onClick={handleAutoDistribute} className="gap-2 bg-gold-gradient font-display tracking-wider">
            <Shuffle className="h-4 w-4" /> AUTO DISTRIBUTE
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="font-body text-sm text-muted-foreground tracking-wider">
          PLAYERS 1-{groupSize} → GROUP A, {groupSize + 1}-{groupSize * 2} → GROUP B, AND SO ON.
          EACH GROUP PLAYS {tournament.totalRounds} SWISS ROUNDS.
          TOP {tournament.qualifiersPerTeam} FROM EACH GROUP QUALIFY FOR FINALS.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-xl tracking-wider text-muted-foreground">NO GROUPS YET</p>
          <p className="font-body text-sm text-muted-foreground mt-2">CLICK AUTO DISTRIBUTE TO CREATE GROUPS</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, gIdx) => (
            <div key={group.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
              <div className="bg-secondary/30 px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg tracking-wider text-primary">{group.name}</h3>
                  {group.status === 'completed' && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{group.playerIds.length} PLAYERS</span>
                  <span className="text-xs font-mono text-muted-foreground">RD {group.currentRound}/{tournament.totalRounds}</span>
                </div>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto space-y-1">
                {group.playerIds.map((pid, idx) => {
                  const p = players.find(pl => pl.id === pid);
                  if (!p) return null;
                  const isQualified = group.qualifiedPlayerIds.includes(pid);
                  return (
                    <div key={pid} className={`flex items-center justify-between py-1.5 px-2 rounded-sm text-sm ${
                      isQualified ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground w-5">{idx + 1}</span>
                        <span className="font-body tracking-wider">{p.name}</span>
                        {isQualified && <Crown className="h-3 w-3 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{p.points}P</span>
                        <span className="font-mono text-xs text-muted-foreground">{p.wins}W</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {group.qualifiedPlayerIds.length > 0 && (
                <div className="bg-primary/5 border-t border-primary/20 px-4 py-2">
                  <span className="text-xs font-display tracking-wider text-primary">
                    QUALIFIED: {group.qualifiedPlayerIds.length} PLAYERS
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
