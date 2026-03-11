# TODO: Auto Group Feature Implementation

## Task
Create automatic group system for knockout rounds when players exceed 10 boards (20 players max per group)

## Steps

- [x] 1. Update `tournament-engine.ts` - Add auto-group distribution function and modify knockout pairing to support multiple groups with board numbering
- [x] 2. Update `types.ts` - Add groupId to Match interface
- [x] 3. Update `Rounds.tsx` - Display group information in UI
- [x] 4. Update `ProjectorMode.tsx` - Show group labels in match display

## Details
- Group A: B1-B10 (max 20 players)
- Group B: B1-B10 (max 20 players), restart board numbers
- Board numbers restart at B1 for each new group
- Keep random player vs selection logic for knockout

