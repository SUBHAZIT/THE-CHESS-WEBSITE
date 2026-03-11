import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Team, Group, Round, KnockoutMatch, Tournament } from './types';

interface TournamentState {
  tournament: Tournament;
  players: Player[];
  groups: Group[];
  teams: Team[];
  rounds: Round[];
  knockoutMatches: KnockoutMatch[];

  setTournament: (t: Partial<Tournament>) => void;
  setPlayers: (p: Player[]) => void;
  addPlayer: (p: Player) => void;
  updatePlayer: (id: string, data: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  setGroups: (g: Group[]) => void;
  updateGroup: (id: string, data: Partial<Group>) => void;
  setTeams: (t: Team[]) => void;
  addRound: (r: Round) => void;
  updateRound: (id: string, r: Partial<Round>) => void;
  setRounds: (r: Round[]) => void;
  setKnockoutMatches: (m: KnockoutMatch[]) => void;
  addAnnouncement: (msg: string) => void;
  resetAll: () => void;
}

const defaultTournament: Tournament = {
  id: 'T001',
  name: 'THE BLITZ',
  mode: 'hybrid',
  status: 'setup',
  phase: 'knockout',
  timeControl: '5+3',
  totalRounds: 3,
  currentRound: 0,
  boards: 10,
  qualifiersPerTeam: 2,
  groupSize: 20,
  finalsRounds: 4,
  finalsCurrentRound: 0,
  finalsStatus: 'pending',
  announcements: [],
  swissThreshold: 12,
  knockoutRound: 0,
};

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set) => ({
      tournament: { ...defaultTournament },
      players: [],
      groups: [],
      teams: [],
      rounds: [],
      knockoutMatches: [],

      setTournament: (t) =>
        set((s) => ({ tournament: { ...s.tournament, ...t } })),
      setPlayers: (players) => set({ players }),
      addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
      updatePlayer: (id, data) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
      setGroups: (groups) => set({ groups }),
      updateGroup: (id, data) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),
      setTeams: (teams) => set({ teams }),
      addRound: (r) => set((s) => ({ rounds: [...s.rounds, r] })),
      updateRound: (id, data) =>
        set((s) => ({
          rounds: s.rounds.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),
      setRounds: (rounds) => set({ rounds }),
      setKnockoutMatches: (knockoutMatches) => set({ knockoutMatches }),
      addAnnouncement: (msg) =>
        set((s) => ({
          tournament: {
            ...s.tournament,
            announcements: [msg, ...s.tournament.announcements].slice(0, 20),
          },
        })),
      resetAll: () =>
        set({
          tournament: { ...defaultTournament },
          players: [],
          groups: [],
          teams: [],
          rounds: [],
          knockoutMatches: [],
        }),
    }),
    { name: 'the-blitz-store' }
  )
);
