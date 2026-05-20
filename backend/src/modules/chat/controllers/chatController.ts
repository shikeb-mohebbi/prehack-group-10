// ─────────────────────────────────────────────────────────────
// Chat Controller
//
// Manages the AI coach chat feature:
//   getChatMessages  — load conversation history for the user
//   sendChatMessage  — save user message, get AI reply, save reply
//   clearChatMessages — delete all messages for the user
//
// Context window management:
//   Only the most recent CONTEXT_WINDOW messages are sent to the
//   AI on each turn. Older messages are stored in the database
//   for the user to scroll back through, but the AI doesn't see
//   them — this prevents token limit errors on long conversations.
//
//   MAX_HISTORY caps how many messages the DB query returns;
//   messages beyond this are still in the database but not shown.
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { groqChat } from "../../../lib/groq";
import { AuthRequest } from "../../../middleware/auth";
import { buildCoachSystemPrompt } from "../models/chatModel";
import { chatMessageSchema } from "../schemas/chatSchemas";

const CONTEXT_WINDOW = 20; // messages fed to the AI
const MAX_HISTORY = 200;   // messages returned in the history endpoint

// ── getChatMessages ───────────────────────────────────────────
// GET /api/chat/messages
// Returns the most recent MAX_HISTORY messages for the user,
// along with the total count (so the frontend can show
// "older messages exist outside AI memory" warnings).
// Messages are stored newest-first then reversed to oldest-first
// for correct chronological display in the chat UI.
export async function getChatMessages(req: AuthRequest, res: Response) {
  const total = await prisma.chatMessage.count({
    where: { userId: req.userId! },
  });

  const messages = await prisma.chatMessage.findMany({
    where:   { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take:    MAX_HISTORY,
  });

  return res.json({
    messages:      messages.reverse(),
    total,
    contextWindow: CONTEXT_WINDOW,
  });
}

// ── sendChatMessage ───────────────────────────────────────────
// POST /api/chat/messages
// Flow:
//   1. Validate the incoming message text.
//   2. Save the user's message to the DB.
//   3. Fetch the most recent CONTEXT_WINDOW messages (oldest first)
//      to send as conversation history to the AI.
//   4. Call Groq with a personalised system prompt that includes
//      the user's fitness profile (goal, experience level, etc.).
//   5. Save the AI reply to the DB.
//   6. Return the reply + updated total message count.
export async function sendChatMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { message } = chatMessageSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });

    await prisma.chatMessage.create({
      data: { userId: req.userId!, role: "user", content: message },
    });

    // Fetch the latest context window of messages to send to AI.
    // We query newest-first (to get the most recent ones) then
    // reverse to oldest-first (the order the AI expects).
    const recentHistory = await prisma.chatMessage.findMany({
      where:   { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      take:    CONTEXT_WINDOW,
    });
    recentHistory.reverse(); // oldest first for the AI

    const reply = await groqChat(
      [
        { role: "system", content: buildCoachSystemPrompt(user) },
        ...recentHistory.map((m) => ({
          role:    m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      { temperature: 0.7 }
    );

    const saved = await prisma.chatMessage.create({
      data: { userId: req.userId!, role: "assistant", content: reply },
    });

    const totalAfter = await prisma.chatMessage.count({
      where: { userId: req.userId! },
    });

    return res.json({
      reply:         saved,
      total:         totalAfter,
      contextWindow: CONTEXT_WINDOW,
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}

// ── clearChatMessages ─────────────────────────────────────────
// DELETE /api/chat/messages
// Deletes all chat messages for the current user. Used by the
// "Clear chat" button in the UI when the context window is full
// or the user wants to start a fresh conversation.
export async function clearChatMessages(req: AuthRequest, res: Response) {
  await prisma.chatMessage.deleteMany({ where: { userId: req.userId! } });
  return res.json({ ok: true });
}
