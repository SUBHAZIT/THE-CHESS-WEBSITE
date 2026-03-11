export interface Player {
  id: string;
  name: string;
  phone?: string;
  organization?: string;
  rating?: number;
  groupId?: string;
  teamId?: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  status: 'active' | 'inactive' | 'bye';
  opponentHistory: string[];
  colorHistory: ('white' | 'black')[];
  buchholz: number;
  sonnebornBerger: number;
  checkedIn: boolean;
  qualified?: boolean;
  stage?: 'group' | 'finals';
}

export interface Group {
  id: string;
  name: string;
  playerIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  currentRound: number;
  qualifiedPlayerIds: string[];
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
}

export interface Match {
  id: string;
  roundNumber: number;
  board: number;
  groupId?: string;
  groupName?: string;
  whitePlayerId: string;
  blackPlayerId: string;
  result: 'white' | 'black' | 'draw' | null;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Round {
  id: string;
  number: number;
  groupId?: string;
  matches: Match[];
  status: 'pending' | 'in_progress' | 'completed';
  byePlayerId?: string;
  stage: 'group' | 'finals' | 'knockout' | 'swiss';
}

export interface KnockoutMatch {
  id: string;
  stage: string;
  matchNumber: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  result: 'player1' | 'player2' | null;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  mode: 'swiss' | 'roundrobin' | 'knockout' | 'hybrid';
  status: 'setup' | 'running' | 'paused' | 'completed';
  phase: 'knockout' | 'swiss' | 'completed';
  timeControl: string;
  totalRounds: number;
  currentRound: number;
  boards: number;
  qualifiersPerTeam: number;
  groupSize: number;
  finalsRounds: number;
  finalsCurrentRound: number;
  finalsStatus: 'pending' | 'in_progress' | 'completed';
  announcements: string[];
  swissThreshold: number;
  knockoutRound: number;
}

export type TournamentStore = {
  tournament: Tournament;
  players: Player[];
  groups: Group[];
  teams: Team[];
  rounds: Round[];
  knockoutMatches: KnockoutMatch[];
};
