export interface Message {
  id: number;
  user_id: number;
  chat_id: number;
  request: string;
  response: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cost: number;
}

export interface Chat {
  id: number;
  user_id: number;
  model_id: string;
  title: string;
  context_size: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  messages: Message[];
}

export interface StreamEvent {
  type: "start" | "chunk" | "complete" | "error";
  message_id?: number;
  chat_id?: number;
  chat_uuid?: string;
  request?: string;
  content?: string;
  response?: string;
  cost?: number;
  error?: string;
}

export interface SessionData {
  chatIds: number[];
  sessionId: string;
}

export interface ApiError {
  error: string;
}

export interface CreateChatPayload {
  title: string;
  model_id: number;
  context_size?: number;
}

export interface SendMessagePayload {
  text: string;
  chat_id?: number;
  chat_uuid?: string;
  is_online_enabled?: boolean;
}
