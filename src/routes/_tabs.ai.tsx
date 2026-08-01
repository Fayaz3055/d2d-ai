import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { useAiHistory } from "@/features/ai/use-ai-history";
import { CaptureProposals } from "@/features/ai/components/capture-proposals";
import { QUICK_ACTIONS, type CaptureProposalPayload } from "@/features/ai/types";
import companionMark from "@/assets/ai-companion.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/ai")({
  head: () => ({
    meta: [
      { title: "AI Companion — D2D AI" },
      {
        name: "description",
        content:
          "Chat with your D2D AI Companion to plan your day, organise tasks, study smarter and turn ideas into action.",
      },
      { property: "og:title", content: "AI Companion — D2D AI" },
      {
        property: "og:description",
        content: "Your calm AI companion for planning, studying and reflecting.",
      },
    ],
  }),
  component: AiScreen,
});

const WELCOME =
  "Hi! I'm your D2D AI Companion. I can help you organize your life, plan your day, answer questions, and turn ideas into action.";

function AiScreen() {
  const { history, persist, clearHistory } = useAiHistory();

  if (!history) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Shimmer>Loading your conversation…</Shimmer>
      </div>
    );
  }

  return <ChatWindow initialMessages={history} persist={persist} clearHistory={clearHistory} />;
}

function ChatWindow({
  initialMessages,
  persist,
  clearHistory,
}: {
  initialMessages: UIMessage[];
  persist: (m: UIMessage) => Promise<void>;
  clearHistory: () => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : ({} as Record<string, string>);
        },
      }),
    [],
  );

  const { messages, setMessages, sendMessage, regenerate, status, error } = useChat({
    id: "d2d-ai",
    messages: initialMessages,
    transport,
    onFinish: ({ message, isError, isAbort }) => {
      if (isError || isAbort) return;
      void persist(message);
    },
    onError: (e) => {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error("D2D AI couldn't reply", {
        description: /429/.test(message)
          ? "Too many requests right now — try again in a moment."
          : /402/.test(message)
            ? "AI credits are exhausted. Add credits to keep chatting."
            : "Check your connection and try again.",
      });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  const focusInput = useCallback(() => textareaRef.current?.focus(), []);
  useEffect(() => {
    focusInput();
  }, [focusInput]);
  useEffect(() => {
    if (!busy) focusInput();
  }, [busy, focusInput]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      void persist({ id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: trimmed }] });
      void sendMessage({ text: trimmed });
      focusInput();
    },
    [busy, persist, sendMessage, focusInput],
  );

  const handleClear = async () => {
    await clearHistory();
    setMessages([]);
    toast.success("Conversation cleared");
    focusInput();
  };

  return (
    <div className="flex min-h-[calc(100dvh-1px)] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur-xl">
        <img
          src={companionMark}
          alt="D2D AI Companion"
          width={40}
          height={40}
          className="h-9 w-9"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-semibold tracking-tight">D2D AI Companion</h1>
          <p className="text-[11px] text-muted-foreground">Your intelligent daily companion</p>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear conversation"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      {/* Transcript */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-xl px-5 pb-4">
          {messages.length === 0 ? (
            <div className="animate-fade-up py-10 text-center">
              <img
                src={companionMark}
                alt=""
                width={96}
                height={96}
                loading="lazy"
                className="mx-auto h-20 w-20"
              />
              <h2 className="mt-5 text-xl font-semibold tracking-tight">Let's get started</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {WELCOME}
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <Message key={message.id} from={message.role} className="mb-4">
              <MessageContent>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <MessageResponse key={i}>{part.text}</MessageResponse>;
                  }
                  if (part.type === "tool-propose_captures") {
                    const output = (part as { output?: CaptureProposalPayload }).output;
                    if (output?.items?.length) {
                      return <CaptureProposals key={i} items={output.items} />;
                    }
                    return (
                      <Shimmer key={i} className="text-xs">
                        Reading your brain dump…
                      </Shimmer>
                    );
                  }
                  return null;
                })}
              </MessageContent>

              {message.role === "assistant" && !busy ? (
                <div className="flex items-center gap-1 pt-1">
                  <ActionButton
                    label="Copy"
                    onClick={() => {
                      const text = message.parts
                        .map((p) => (p.type === "text" ? p.text : ""))
                        .join("");
                      void navigator.clipboard.writeText(text);
                      toast.success("Copied");
                    }}
                    icon={Copy}
                  />
                  <ActionButton
                    label="Regenerate"
                    onClick={() => void regenerate({ messageId: message.id })}
                    icon={RefreshCw}
                  />
                </div>
              ) : null}
            </Message>
          ))}

          {status === "submitted" ? (
            <Shimmer className="mb-4 text-sm">Thinking…</Shimmer>
          ) : null}

          {error ? (
            <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              That message didn't go through. Tap regenerate or send it again.
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Composer */}
      <div className="sticky bottom-0 z-20 border-t border-border/60 bg-background/90 pb-28 pt-3 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-xl px-5">
          <div className="scrollbar-none -mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1 pb-1">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => send(a.prompt)}
                disabled={busy}
                className={cn(
                  "shrink-0 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium",
                  "transition-all hover:border-primary/40 hover:text-primary active:scale-95",
                  "disabled:opacity-50",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>

          <PromptInput
            className="rounded-3xl"
            onSubmit={(_, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, or brain dump…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Copy;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        onClick();
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
