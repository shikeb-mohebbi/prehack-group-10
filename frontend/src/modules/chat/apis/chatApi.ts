import { api } from "../../../lib/api";
import type { ChatMsg, ChatHistory } from "../types/chatTypes";

export async function getChatMessages(): Promise<ChatHistory> {
  const { data } = await api.get<ChatHistory>("/chat");
  return data;
}

export async function sendChatMessage(message: string): Promise<{ reply: ChatMsg; total: number; contextWindow: number }> {
  const { data } = await api.post<{ reply: ChatMsg; total: number; contextWindow: number }>("/chat", { message });
  return data;
}

export async function clearChatMessages() {
  await api.delete("/chat");
}
