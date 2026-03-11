import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTournamentStore } from '@/lib/store';

export function useRealtimeSync() {
  const store = useTournamentStore();
  const isRemoteUpdate = useRef(false);
  const lastSyncRef = useRef(0);

  // Subscribe to realtime changes on all tables
  useEffect(() => {
    const channel = supabase
      .channel('tournament-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, (payload) => {
        if (payload.new && !isRemoteUpdate.current) {
          const t = payload.new as any;
          isRemoteUpdate.current = true;
          store.setTournament({
            name: t.name,
            status: t.status,
            phase: t.phase || 'knockout',
            mode: t.mode,
            timeControl: t.time_control,
            totalRounds: t.total_rounds,
            currentRound: t.current_round,
            boards: t.boards,
            groupSize: t.group_size,
            qualifiersPerTeam: t.qualifiers_per_group,
            finalsRounds: t.finals_rounds,
            announcements: (t.announcements as string[]) || [],
            swissThreshold: t.swiss_threshold || 12,
            knockoutRound: t.knockout_round || 0,
          });
          setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        // Reload players from DB
        loadPlayers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => {
        loadRounds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('created_at');
    if (data) {
      const players = data.map((p: any) => ({
        id: p.player_code,
        name: p.name,
        phone: p.phone,
        organization: p.organization,
        rating: p.rating,
        points: p.points,
        wins: p.wins,
        draws: p.draws,
        losses: p.losses,
        status: p.status as 'active' | 'inactive' | 'bye',
        opponentHistory: (p.opponent_history as string[]) || [],
        colorHistory: (p.color_history as ('white' | 'black')[]) || [],
        buchholz: p.buchholz,
        sonnebornBerger: p.sonneborn_berger,
        checkedIn: p.checked_in,
        groupId: p.group_id,
      }));
      isRemoteUpdate.current = true;
      store.setPlayers(players);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    }
  };

  const loadRounds = async () => {
    const { data } = await supabase.from('rounds').select('*').order('round_number');
    if (data) {
      const rounds = data.map((r: any) => ({
        id: r.id,
        number: r.round_number,
        groupId: r.group_id,
        matches: (r.matches as any[]) || [],
        status: r.status as 'pending' | 'in_progress' | 'completed',
        byePlayerId: r.bye_player_id,
        stage: r.stage as 'group' | 'finals' | 'knockout' | 'swiss',
      }));
      isRemoteUpdate.current = true;
      store.setRounds(rounds);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    }
  };

  // Save tournament state to DB (debounced)
  const saveTournament = async () => {
    const now = Date.now();
    if (now - lastSyncRef.current < 1000) return;
    lastSyncRef.current = now;

    const t = store.tournament;
    await supabase.from('tournaments').upsert({
      id: t.id,
      name: t.name,
      status: t.status,
      phase: t.phase,
      mode: t.mode,
      time_control: t.timeControl,
      total_rounds: t.totalRounds,
      current_round: t.currentRound,
      boards: t.boards,
      group_size: t.groupSize,
      qualifiers_per_group: t.qualifiersPerTeam,
      finals_rounds: t.finalsRounds,
      announcements: t.announcements,
      swiss_threshold: t.swissThreshold,
      knockout_round: t.knockoutRound,
    });
  };

  return { saveTournament, loadPlayers, loadRounds };
}
