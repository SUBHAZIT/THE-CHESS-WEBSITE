
-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'THE BLITZ',
  mode TEXT NOT NULL DEFAULT 'swiss',
  status TEXT NOT NULL DEFAULT 'setup',
  time_control TEXT NOT NULL DEFAULT '5+3',
  total_rounds INTEGER NOT NULL DEFAULT 3,
  current_round INTEGER NOT NULL DEFAULT 0,
  boards INTEGER NOT NULL DEFAULT 10,
  qualifiers_per_group INTEGER NOT NULL DEFAULT 2,
  group_size INTEGER NOT NULL DEFAULT 20,
  finals_rounds INTEGER NOT NULL DEFAULT 3,
  announcements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tournaments" ON public.tournaments FOR UPDATE USING (true);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player_code TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  rating INTEGER,
  group_id TEXT,
  points NUMERIC NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  opponent_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  color_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  buchholz NUMERIC NOT NULL DEFAULT 0,
  sonneborn_berger NUMERIC NOT NULL DEFAULT 0,
  checked_in BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE USING (true);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  player_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  current_round INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Anyone can insert groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update groups" ON public.groups FOR UPDATE USING (true);

-- Create rounds table
CREATE TABLE public.rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  group_id TEXT,
  round_number INTEGER NOT NULL,
  matches JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  bye_player_id TEXT,
  stage TEXT NOT NULL DEFAULT 'group',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rounds" ON public.rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rounds" ON public.rounds FOR UPDATE USING (true);

-- Create knockout_matches table
CREATE TABLE public.knockout_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id TEXT,
  player2_id TEXT,
  winner_id TEXT,
  result TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.knockout_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read knockout_matches" ON public.knockout_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert knockout_matches" ON public.knockout_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update knockout_matches" ON public.knockout_matches FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
