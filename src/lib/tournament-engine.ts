import { Player, Match, Round, KnockoutMatch, Group } from './types';

let matchIdCounter = 0;
const genMatchId = () => `M${++matchIdCounter}`;

/**
 * Automatically distribute players to groups based on board capacity.
 * Max 20 players per group (10 boards × 2 players).
 * Groups are named: GROUP-A, GROUP-B, etc.
 */
export function autoDistributePlayersToGroups(players: Player[], boards: number): Group[] {
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);
  const playersPerGroup = boards * 2; // 20 players per group (10 boards)
  const groups: Group[] = [];
  const groupNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let i = 0; i < activePlayers.length; i += playersPerGroup) {
    const chunk = activePlayers.slice(i, i + playersPerGroup);
    const groupIdx = Math.floor(i / playersPerGroup);
    const groupName = groupNames[groupIdx] || `GROUP-${groupIdx + 1}`;
    
    groups.push({
      id: `GROUP-${groupName}`,
      name: `GROUP ${groupName}`,
      playerIds: chunk.map(p => p.id),
      status: 'in_progress',
      currentRound: 0,
      qualifiedPlayerIds: [],
    });
  }

  return groups;
}

/**
 * Generate KNOCKOUT round pairings with color alternation and group support.
 * Round 1: Random pairing.
 * Round 2+: If a player won as white, they get black next round.
 * Supports multiple groups with board numbering: Group A = B1-B10, Group B = B1-B10, etc.
 */
export function generateKnockoutRoundPairings(
  players: Player[],
  roundNumber: number,
  boards: number,
  groups?: Group[]
): Round {
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);
  
  // If groups exist, use them; otherwise auto-distribute
  let playerGroups: Group[];
  if (groups && groups.length > 0) {
    playerGroups = groups;
  } else {
    playerGroups = autoDistributePlayersToGroups(activePlayers, boards);
  }

  const allMatches: Match[] = [];
  let byePlayerId: string | undefined;
  let globalBoardNum = 0;

  // Process each group
  for (const group of playerGroups) {
    const groupPlayers = activePlayers.filter(p => group.playerIds.includes(p.id));
    if (groupPlayers.length < 2) continue;

    const shuffled = [...groupPlayers].sort(() => Math.random() - 0.5);
    let groupByePlayerId: string | undefined;
    const toPair = [...shuffled];

    // Odd number: last player gets BYE (advances automatically)
    if (toPair.length % 2 !== 0) {
      for (let i = toPair.length - 1; i >= 0; i--) {
        if (!toPair[i].opponentHistory.includes('BYE')) {
          groupByePlayerId = toPair[i].id;
          toPair.splice(i, 1);
          break;
        }
      }
      if (!groupByePlayerId && toPair.length % 2 !== 0) {
        groupByePlayerId = toPair[toPair.length - 1].id;
        toPair.pop();
      }
    }

    // Assign BYE player to global if not already assigned
    if (groupByePlayerId && !byePlayerId) {
      byePlayerId = groupByePlayerId;
    }

    // Create matches for this group
    const groupMatches: Match[] = [];
    for (let i = 0; i < toPair.length - 1; i += 2) {
      const p1 = toPair[i];
      const p2 = toPair[i + 1];

      let white = p1, black = p2;

      if (roundNumber > 1) {
        const p1Last = p1.colorHistory[p1.colorHistory.length - 1];
        const p2Last = p2.colorHistory[p2.colorHistory.length - 1];

        if (p1Last === 'white' && p2Last !== 'white') {
          white = p2; black = p1;
        } else if (p2Last === 'white' && p1Last !== 'white') {
          white = p1; black = p2;
        } else if (p1Last === 'white') {
          if (Math.random() > 0.5) { white = p2; black = p1; }
        }
      }

      globalBoardNum++;
      groupMatches.push({
        id: genMatchId(),
        roundNumber,
        board: globalBoardNum,
        groupId: group.id,
        groupName: group.name,
        whitePlayerId: white.id,
        blackPlayerId: black.id,
        result: null,
        status: 'pending',
      });
    }

    allMatches.push(...groupMatches);
  }

  // If we have leftover ungrouped players (shouldn't happen with auto-distribute, but handle gracefully)
  const groupedPlayerIds = new Set(playerGroups.flatMap(g => g.playerIds));
  const ungroupedPlayers = activePlayers.filter(p => !groupedPlayerIds.has(p.id));
  
  if (ungroupedPlayers.length >= 2) {
    const shuffled = [...ungroupedPlayers].sort(() => Math.random() - 0.5);
    let ungroupedBye: string | undefined;
    const toPair = [...shuffled];

    if (toPair.length % 2 !== 0) {
      for (let i = toPair.length - 1; i >= 0; i--) {
        if (!toPair[i].opponentHistory.includes('BYE')) {
          ungroupedBye = toPair[i].id;
          toPair.splice(i, 1);
          break;
        }
      }
      if (!ungroupedBye && toPair.length % 2 !== 0) {
        ungroupedBye = toPair[toPair.length - 1].id;
        toPair.pop();
      }
    }

    if (ungroupedBye && !byePlayerId) {
      byePlayerId = ungroupedBye;
    }

    for (let i = 0; i < toPair.length - 1; i += 2) {
      globalBoardNum++;
      allMatches.push({
        id: genMatchId(),
        roundNumber,
        board: globalBoardNum,
        groupId: 'UNGROUPED',
        groupName: 'UNGROUPED',
        whitePlayerId: toPair[i].id,
        blackPlayerId: toPair[i + 1].id,
        result: null,
        status: 'pending',
      });
    }
  }

  // Sort matches by group then by board
  allMatches.sort((a, b) => {
    if (a.groupId && b.groupId && a.groupId !== b.groupId) {
      return a.groupId.localeCompare(b.groupId);
    }
    return a.board - b.board;
  });

  // Reassign board numbers sequentially within each group
  const groupedMatches: Match[] = [];
  const groupMap = new Map<string, Match[]>();
  
  for (const match of allMatches) {
    const gid = match.groupId || 'DEFAULT';
    if (!groupMap.has(gid)) {
      groupMap.set(gid, []);
    }
    groupMap.get(gid)!.push(match);
  }

  let boardCounter = 0;
  for (const [, matches] of groupMap) {
    for (const match of matches) {
      boardCounter++;
      groupedMatches.push({ ...match, board: boardCounter });
    }
  }

  return {
    id: `KO-R${roundNumber}`,
    number: roundNumber,
    matches: groupedMatches,
    status: 'pending',
    byePlayerId,
    stage: 'knockout',
  };
}

/**
 * Generate Swiss pairings - pairs players with similar points.
 */
export function generateSwissPairings(
  players: Player[],
  roundNumber: number,
  boards: number,
  groupId?: string,
  stage: 'group' | 'finals' | 'swiss' = 'group'
): Round {
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);
  
  const sorted = [...activePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.rating || 0) - (a.rating || 0);
  });

  let byePlayerId: string | undefined;
  const toPair = [...sorted];

  if (toPair.length % 2 !== 0) {
    for (let i = toPair.length - 1; i >= 0; i--) {
      if (!toPair[i].opponentHistory.includes('BYE')) {
        byePlayerId = toPair[i].id;
        toPair.splice(i, 1);
        break;
      }
    }
    if (!byePlayerId && toPair.length % 2 !== 0) {
      byePlayerId = toPair[toPair.length - 1].id;
      toPair.pop();
    }
  }

  const matches: Match[] = [];
  const paired = new Set<string>();

  if (roundNumber === 1) {
    const shuffled = [...toPair].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      matches.push({
        id: genMatchId(),
        roundNumber,
        board: matches.length + 1,
        whitePlayerId: shuffled[i].id,
        blackPlayerId: shuffled[i + 1].id,
        result: null,
        status: 'pending',
      });
    }
  } else {
    // Swiss: pair by similar scores, avoid rematches
    for (let i = 0; i < toPair.length; i++) {
      const p = toPair[i];
      if (paired.has(p.id)) continue;

      for (let j = i + 1; j < toPair.length; j++) {
        const opp = toPair[j];
        if (paired.has(opp.id)) continue;
        if (p.opponentHistory.includes(opp.id)) continue;

        paired.add(p.id);
        paired.add(opp.id);

        const pWhiteCount = p.colorHistory.filter(c => c === 'white').length;
        const oppWhiteCount = opp.colorHistory.filter(c => c === 'white').length;
        const [white, black] = pWhiteCount <= oppWhiteCount ? [p, opp] : [opp, p];

        matches.push({
          id: genMatchId(),
          roundNumber,
          board: matches.length + 1,
          whitePlayerId: white.id,
          blackPlayerId: black.id,
          result: null,
          status: 'pending',
        });
        break;
      }
    }

    // Fallback: pair remaining (allow rematches)
    const unpaired = toPair.filter(p => !paired.has(p.id));
    for (let i = 0; i < unpaired.length - 1; i += 2) {
      matches.push({
        id: genMatchId(),
        roundNumber,
        board: matches.length + 1,
        whitePlayerId: unpaired[i].id,
        blackPlayerId: unpaired[i + 1].id,
        result: null,
        status: 'pending',
      });
    }
  }

  const roundId = groupId 
    ? `${groupId}-R${roundNumber}` 
    : stage === 'swiss'
      ? `SWISS-R${roundNumber}`
      : stage === 'finals' 
        ? `FINALS-R${roundNumber}` 
        : `R${roundNumber}`;

  return {
    id: roundId,
    number: roundNumber,
    groupId,
    matches,
    status: 'pending',
    byePlayerId,
    stage,
  };
}

export function applyMatchResult(players: Player[], match: Match): Player[] {
  return players.map(p => {
    if (p.id === match.whitePlayerId) {
      const pts = match.result === 'white' ? 1 : match.result === 'draw' ? 0.5 : 0;
      return {
        ...p,
        points: p.points + pts,
        wins: p.wins + (match.result === 'white' ? 1 : 0),
        draws: p.draws + (match.result === 'draw' ? 1 : 0),
        losses: p.losses + (match.result === 'black' ? 1 : 0),
        opponentHistory: [...p.opponentHistory, match.blackPlayerId],
        colorHistory: [...p.colorHistory, 'white' as const],
      };
    }
    if (p.id === match.blackPlayerId) {
      const pts = match.result === 'black' ? 1 : match.result === 'draw' ? 0.5 : 0;
      return {
        ...p,
        points: p.points + pts,
        wins: p.wins + (match.result === 'black' ? 1 : 0),
        draws: p.draws + (match.result === 'draw' ? 1 : 0),
        losses: p.losses + (match.result === 'white' ? 1 : 0),
        opponentHistory: [...p.opponentHistory, match.whitePlayerId],
        colorHistory: [...p.colorHistory, 'black' as const],
      };
    }
    return p;
  });
}

export function applyBye(players: Player[], byePlayerId: string): Player[] {
  return players.map(p => {
    if (p.id === byePlayerId) {
      return {
        ...p,
        points: p.points + 1,
        wins: p.wins + 1,
        opponentHistory: [...p.opponentHistory, 'BYE'],
      };
    }
    return p;
  });
}

/**
 * Eliminate loser from knockout match (set inactive)
 */
export function eliminateLoser(players: Player[], match: Match): Player[] {
  const loserId = match.result === 'white' ? match.blackPlayerId : match.whitePlayerId;
  return players.map(p => {
    if (p.id === loserId) {
      return { ...p, status: 'inactive' as const };
    }
    return p;
  });
}

export function calculateTiebreaks(players: Player[]): Player[] {
  const playerMap = new Map(players.map(p => [p.id, p]));

  return players.map(p => {
    const buchholz = p.opponentHistory
      .filter(id => id !== 'BYE')
      .reduce((sum, oppId) => {
        const opp = playerMap.get(oppId);
        return sum + (opp?.points || 0);
      }, 0);

    return { ...p, buchholz, sonnebornBerger: 0 };
  });
}

export function getRankedPlayers(players: Player[]): Player[] {
  const withTiebreaks = calculateTiebreaks(players);
  return withTiebreaks
    .filter(p => p.status === 'active' || p.status === 'bye')
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.rating || 0) - (a.rating || 0);
    });
}

export function getRankedPlayersInGroup(players: Player[], groupPlayerIds: string[]): Player[] {
  const groupPlayers = players.filter(p => groupPlayerIds.includes(p.id));
  return getRankedPlayers(groupPlayers);
}

export function distributePlayersToGroups(players: Player[], groupSize: number): Group[] {
  const activePlayers = players.filter(p => p.status === 'active' && p.checkedIn);
  const groups: Group[] = [];
  const groupNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let i = 0; i < activePlayers.length; i += groupSize) {
    const chunk = activePlayers.slice(i, i + groupSize);
    const groupIdx = Math.floor(i / groupSize);
    groups.push({
      id: `GROUP-${groupNames[groupIdx] || groupIdx + 1}`,
      name: `GROUP ${groupNames[groupIdx] || groupIdx + 1}`,
      playerIds: chunk.map(p => p.id),
      status: 'pending',
      currentRound: 0,
      qualifiedPlayerIds: [],
    });
  }

  return groups;
}

export function selectQualifiers(
  players: Player[],
  groups: Group[],
  qualifiersPerGroup: number
): { updatedGroups: Group[]; qualifiedPlayerIds: string[] } {
  const allQualified: string[] = [];
  const updatedGroups = groups.map(g => {
    const ranked = getRankedPlayersInGroup(players, g.playerIds);
    const qualified = ranked.slice(0, qualifiersPerGroup).map(p => p.id);
    allQualified.push(...qualified);
    return { ...g, qualifiedPlayerIds: qualified, status: 'completed' as const };
  });
  return { updatedGroups, qualifiedPlayerIds: allQualified };
}

export function generateKnockoutBracket(qualifiedPlayerIds: string[]): KnockoutMatch[] {
  let size = 1;
  while (size < qualifiedPlayerIds.length) size *= 2;

  const padded = [...qualifiedPlayerIds];
  while (padded.length < size) padded.push('');

  const matches: KnockoutMatch[] = [];
  let stageNames = ['FINAL', 'SEMIFINAL', 'QUARTERFINAL', 'ROUND OF 16', 'ROUND OF 32'];
  let totalRounds = Math.log2(size);
  let matchNum = 0;

  const firstRoundSize = size / 2;
  const stageName = totalRounds <= stageNames.length
    ? stageNames[totalRounds - 1]
    : `ROUND OF ${size}`;

  for (let i = 0; i < firstRoundSize; i++) {
    const p1 = padded[i] || null;
    const p2 = padded[size - 1 - i] || null;
    matchNum++;
    matches.push({
      id: `KO-${matchNum}`,
      stage: stageName,
      matchNumber: matchNum,
      player1Id: p1 || null,
      player2Id: p2 || null,
      winnerId: null,
      result: null,
      status: p1 && p2 ? 'pending' : 'completed',
    });
    if (p1 && !p2) matches[matches.length - 1].winnerId = p1;
    if (!p1 && p2) matches[matches.length - 1].winnerId = p2;
  }

  let prevRoundMatches = matches.length;
  for (let r = 1; r < totalRounds; r++) {
    const stageIdx = totalRounds - r - 1;
    const sName = stageIdx < stageNames.length ? stageNames[stageIdx] : `ROUND ${r + 1}`;
    const numMatches = prevRoundMatches / 2;
    for (let i = 0; i < numMatches; i++) {
      matchNum++;
      matches.push({
        id: `KO-${matchNum}`,
        stage: sName,
        matchNumber: matchNum,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        result: null,
        status: 'pending',
      });
    }
    prevRoundMatches = numMatches;
  }

  return matches;
}

export function distributePlayersToTeams(playerIds: string[], teamCount: number): string[][] {
  const teams: string[][] = Array.from({ length: teamCount }, () => []);
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  shuffled.forEach((id, i) => {
    teams[i % teamCount].push(id);
  });
  return teams;
}

export function createPlayer(name: string, idx: number, extras?: Partial<Player>): Player {
  return {
    id: `P${String(idx).padStart(3, '0')}`,
    name: name.toUpperCase(),
    phone: extras?.phone,
    organization: extras?.organization?.toUpperCase(),
    rating: extras?.rating,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    status: 'active',
    opponentHistory: [],
    colorHistory: [],
    buchholz: 0,
    sonnebornBerger: 0,
    checkedIn: true,
    ...extras,
  };
}
