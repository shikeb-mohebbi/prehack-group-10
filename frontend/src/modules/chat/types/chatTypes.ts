export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatHistory {
  messages: ChatMsg[];
  total: number;
  contextWindow: number;
}
