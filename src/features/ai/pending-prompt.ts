const KEY = "d2d.ai.pendingPrompt";

/**
 * Hands a prompt from anywhere in the app (home suggestions, insights) to the
 * AI Companion screen, which sends it on arrival.
 */
export function queueAiPrompt(prompt: string) {
  try {
    sessionStorage.setItem(KEY, prompt);
  } catch {
    /* noop */
  }
}

export function takeAiPrompt(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
