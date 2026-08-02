import { toast } from "sonner";
import { getCaptureReply } from "./ai-insights.functions";

export type CaptureReplyKind = "task" | "note" | "thought" | "event" | "reminder";

/**
 * The companion always replies when the user creates something. Fired after a
 * save; the reply arrives as a premium toast so it never blocks navigation.
 */
export function announceCapture(input: {
  kind: CaptureReplyKind;
  title: string;
  details?: string;
  when?: string;
}) {
  const title = input.title.trim();
  if (!title) return;

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
      toast("D2D AI", { description: reply, duration: 7000 });
    })
    .catch(() => {
      /* the companion stays silent if the network is down */
    });
}
