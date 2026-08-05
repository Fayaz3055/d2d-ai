ALTER TABLE public.thoughts
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'random',
  ADD COLUMN IF NOT EXISTS ai_reply text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS merged_into uuid;

CREATE TABLE public.thought_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  thought_id uuid NOT NULL REFERENCES public.thoughts(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'created',
  detail text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.thought_events TO authenticated;
GRANT ALL ON public.thought_events TO service_role;
ALTER TABLE public.thought_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own thought events" ON public.thought_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX thought_events_thought_id_idx ON public.thought_events (thought_id);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  source_thought_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own projects" ON public.projects
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();