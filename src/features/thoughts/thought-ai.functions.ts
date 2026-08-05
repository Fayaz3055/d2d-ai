import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ActionInput,
  AnalyzeInput,
  PatternInput,
  runAnalyze,
  runElaborate,
  runPattern,
  type ProjectPlan,
  type ThoughtAnalysis,
  type ThoughtElaboration,
} from "./thought-ai.server";

/** Classifies a new thought and returns the companion's reply + suggested actions. */
export const analyzeThought = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => AnalyzeInput.parse(data))
  .handler(async ({ data }): Promise<ThoughtAnalysis> => runAnalyze(data));

/** Expands, summarizes or plans an idea. */
export const elaborateThought = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ActionInput.parse(data))
  .handler(async ({ data }): Promise<ThoughtElaboration> => runElaborate(data));

/** Turns a repeated theme into a project + goal + notes + tasks plan. */
export const planFromPattern = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => PatternInput.parse(data))
  .handler(async ({ data }): Promise<ProjectPlan> => runPattern(data));
