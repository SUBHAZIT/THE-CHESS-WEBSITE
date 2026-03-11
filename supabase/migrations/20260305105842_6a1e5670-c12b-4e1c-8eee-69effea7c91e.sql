
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'knockout';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS swiss_threshold integer NOT NULL DEFAULT 12;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS knockout_round integer NOT NULL DEFAULT 0;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.knockout_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
