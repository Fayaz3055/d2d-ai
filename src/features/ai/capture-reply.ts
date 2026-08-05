import { getCaptureReply } from "./ai-insights.functions";
import { avatarStore } from "./avatar/avatar-store";
import { reactionFor, type ReactionKind } from "./avatar/reactions";

export type CaptureReplyKind = ReactionKind;

/**
 * The avatar always reacts when the user creates something: an instant local,
 * context-aware line, then the AI's own reply once it arrives.
 */
export function announceCapture(input: {
  kind: CaptureReplyKind;
  title: string;
  details?: string;
  when?: string;
}) {
  const title = input.title.trim();
  if (!title) return;

  const instant = reactionFor(input.kind, `${title} ${input.details ?? ""}`);
  avatarStore.speak(instant.text, instant.emotion, 7000);

  if (input.kind === "completed") return;

  void getCaptureReply({
    data: {
      kind: input.kind,
      title,
      details: input.details?.trim() ? input.details.trim().slice(0, 1200) : null,
      when: input.when?.trim() ? input.when.trim() : null,
    },
  })
    .then(({ reply }) => {
      if (!reply) return;
      avatarStore.speak(reply, instant.emotion, 8000);
    })
    .catch(() => {
      /* the companion stays silent if the network is down */
    });
}

/** Celebration reaction when a task or goal is completed. */
export function announceCompletion(title: string) {
  const line = reactionFor("completed", title);
  avatarStore.speak(line.text, line.emotion, 6000);
}
