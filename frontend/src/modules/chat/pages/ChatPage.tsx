// ─────────────────────────────────────────────────────────────
// Chat Page — Personal AI Coach
//
// A full-screen chat interface where users can ask questions about
// training, nutrition, and recovery and receive AI responses.
//
// Features:
//   • Message history scrollable area (auto-scrolls on new messages)
//   • Markdown rendering for AI replies (bullet lists, bold, etc.)
//   • Context window indicator showing how much of the 20-message
//     window is used — turns amber then red as it fills up
//   • "AI memory starts here" divider line in the history
//   • Animated typing indicator while the AI is responding
//   • Enter to send, Shift+Enter for a new line
//   • Clear button to reset the conversation
//
// State management:
//   useQuery  — loads chat history (GET /api/chat/messages)
//   useMutation (send)  — sends a message (POST /api/chat/messages)
//   useMutation (clear) — clears history (DELETE /api/chat/messages)
// ─────────────────────────────────────────────────────────────

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  clearChatMessages,
  getChatMessages,
  sendChatMessage,
} from "../apis/chatApi";
import { AlertCircle, Bot, Info, Send, Loader2, Trash2, User as UserIcon } from "lucide-react";
import BackButton from "../../../components/BackButton";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";

// Must match CONTEXT_WINDOW in the backend chat controller.
const CONTEXT_WINDOW = 20;

export default function Chat() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ─────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    error: chatError,
    refetch,
  } = useQuery({
    queryKey: ["chat"],
    queryFn:  getChatMessages,
  });

  const messages = data?.messages ?? [];
  const total    = data?.total    ?? 0;

  // ── Context window status ─────────────────────────────────
  // Shows a visual indicator of how much of the AI's memory is used.
  const contextUsed    = Math.min(total, CONTEXT_WINDOW);
  const contextPct     = Math.round((contextUsed / CONTEXT_WINDOW) * 100);
  const contextWarning = total > CONTEXT_WINDOW; // older messages exist outside window
  const contextFull    = contextPct >= 90;        // approaching the limit

  // ── Mutations ─────────────────────────────────────────────

  const [sendError, setSendError] = useState("");
  const send = useMutation({
    mutationFn: sendChatMessage,
    onSuccess:  () => { setSendError(""); qc.invalidateQueries({ queryKey: ["chat"] }); },
    onError:    (error) =>
      setSendError(getApiErrorMessage(error, "Failed to send. Check your API connection and try again.")),
  });

  const clear = useMutation({
    mutationFn: clearChatMessages,
    onSuccess:  () => { setSendError(""); qc.invalidateQueries({ queryKey: ["chat"] }); },
    onError:    (error) =>
      setSendError(getApiErrorMessage(error, "Could not clear chat history. Please try again.")),
  });

  // ── Auto-scroll ───────────────────────────────────────────
  // Scrolls to the bottom of the message list whenever new
  // messages arrive or while the AI is generating a reply.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, send.isPending]);

  // ── Send handlers ─────────────────────────────────────────

  // onSend — called by the form submit button
  const onSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || send.isPending) return;
    const txt = input;
    setInput("");
    send.mutate(txt);
  };

  // onKeyDown — Enter (without Shift) also submits the message
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !send.isPending) {
        const txt = input;
        setInput("");
        send.mutate(txt);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)] animate-fade-in">
      <BackButton />

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
        <div>
          <p className="section-label mb-1">AI Coach</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">Personal AI Coach</h1>
          <p className="text-muted text-sm">Ask anything about training, nutrition or recovery.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => clear.mutate()} className="btn-ghost !p-2 shrink-0" title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Context window indicator ── */}
      {/* Shows memory usage progress bar; turns amber/red as it fills */}
      {messages.length > 0 && (
        <div className={`mb-3 rounded-xl border px-3 py-2 flex items-center gap-2 text-xs transition-all ${
          contextFull
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : contextWarning
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
            : "bg-panel2 border-border text-muted"
        }`}>
          {contextFull || contextWarning
            ? <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            : <Info className="h-3.5 w-3.5 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span>
                {contextWarning
                  ? `AI memory: showing last ${CONTEXT_WINDOW} of ${total} messages. Older messages are outside context.`
                  : `AI remembers last ${CONTEXT_WINDOW} messages · ${contextUsed} used`}
              </span>
              <span className="font-semibold shrink-0">{contextPct}%</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-panel overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  contextFull ? "bg-red-500" : contextWarning ? "bg-amber-400" : "bg-accent"
                }`}
                style={{ width: `${contextPct}%` }}
              />
            </div>
          </div>
          {contextWarning && (
            <button
              onClick={() => clear.mutate()}
              className="shrink-0 underline underline-offset-2 hover:no-underline"
              title="Clear conversation to free up context"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Message list ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto card !p-4 space-y-4 min-h-0">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-panel2 rounded-2xl w-2/3" />
            <div className="h-16 bg-panel2 rounded-2xl w-3/4 ml-auto" />
            <div className="h-12 bg-panel2 rounded-2xl w-1/2" />
          </div>
        )}

        {isError && (
          <ErrorState
            message={getApiErrorMessage(chatError, "Could not load chat history.")}
            onRetry={() => void refetch()}
          />
        )}

        {/* Empty state — shown before the first message */}
        {!isLoading && !isError && messages.length === 0 && (
          <div className="text-center text-muted py-12">
            <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-grad-primary text-white flex items-center justify-center shadow-glow">
              <Bot className="h-6 w-6" />
            </div>
            <p className="font-medium text-fg">Your AI coach is ready.</p>
            <p className="text-sm mt-1">Try: <em>"How many sets per week for chest as a beginner?"</em></p>
          </div>
        )}

        {/* Separator shown above messages that are outside the AI's context */}
        {!isError && contextWarning && messages.length > CONTEXT_WINDOW && (
          <div className="flex justify-center my-2">
            <span className="text-[11px] text-muted bg-panel2 border border-border rounded-full px-3 py-1">
              — Messages above this point are outside AI memory —
            </span>
          </div>
        )}

        {/* Render each message bubble */}
        {!isError && messages.map((m, i) => {
          const isContextStart = contextWarning && i === messages.length - CONTEXT_WINDOW;
          return (
            <div key={m.id}>
              {/* "AI memory starts here" divider */}
              {isContextStart && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-accent/30" />
                  <span className="text-[11px] text-accent font-medium shrink-0">AI memory starts here</span>
                  <div className="flex-1 h-px bg-accent/30" />
                </div>
              )}
              <div className={`flex gap-2 sm:gap-3 animate-fade-in ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-grad-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 leading-relaxed text-sm ${
                    m.role === "user"
                      ? "bg-grad-primary text-white shadow-glow"
                      : "bg-panel2 border border-border text-fg"
                  }`}
                >
                  {/* AI replies are rendered as Markdown; user messages as plain text */}
                  {m.role === "assistant" ? (
                    <div className="prose-chat">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Animated "..." typing indicator while AI is generating */}
        {send.isPending && (
          <div className="flex gap-2 sm:gap-3 animate-fade-in">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-grad-primary text-white flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="bg-panel2 border border-border rounded-2xl px-4 py-3 flex items-center gap-1.5 text-muted text-sm">
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Send error ── */}
      {sendError && (
        <div className="mt-2 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-sm text-red-400">
          {sendError}
        </div>
      )}

      {/* ── Message input ── */}
      {/* Auto-grows up to 128px; Enter submits, Shift+Enter adds a line */}
      <form onSubmit={onSend} className="mt-3 flex gap-2 items-end">
        <textarea
          className="input resize-none leading-relaxed py-2.5 min-h-[44px] max-h-32"
          placeholder="Ask your coach… (Enter to send, Shift+Enter for newline)"
          value={input}
          rows={1}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
          onKeyDown={onKeyDown}
        />
        <button
          className="btn-primary !px-3 sm:!px-4 h-11 shrink-0"
          disabled={send.isPending || !input.trim()}
        >
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
