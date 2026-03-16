/**
 * Server-side API client for the ai-chat-bot backend.
 * All authentication credentials are kept server-side only.
 */

import { getCachedToken, setCachedToken, invalidateToken } from "./token-cache";
import type {
  Chat,
  Message,
  CreateChatPayload,
  SendMessagePayload,
} from "./types";

const API_BASE_URL = process.env.AI_CHAT_BOT_API_URL ?? "http://localhost:8080/api/v1";

/**
 * gorm.Model serializes its primary key as "ID" (uppercase) because there is no
 * explicit json tag. Normalize it to lowercase "id" so TypeScript types are consistent.
 */
function normalizeMessage(raw: Record<string, unknown>): Message {
  return {
    ...raw,
    id: (raw.id ?? raw.ID) as number,
  } as Message;
}

function normalizeChat(raw: Record<string, unknown>): Chat {
  const messages = Array.isArray(raw.messages)
    ? (raw.messages as Array<Record<string, unknown>>).map(normalizeMessage)
    : [];
  return {
    ...raw,
    id: (raw.id ?? raw.ID) as number,
    messages,
  } as Chat;
}

async function login(): Promise<string> {
  const email = process.env.AI_CHAT_BOT_EMAIL;
  const password = process.env.AI_CHAT_BOT_PASSWORD;

  if (!email || !password) {
    throw new Error("AI_CHAT_BOT_EMAIL and AI_CHAT_BOT_PASSWORD must be set");
  }

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Login failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.token as string;
}

async function getToken(): Promise<string> {
  const cached = getCachedToken();
  if (cached) return cached;

  const token = await login();
  setCachedToken(token);
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401 && retry) {
    invalidateToken();
    return apiFetch<T>(path, options, false);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getChats(): Promise<Chat[]> {
  const raw = await apiFetch<Array<Record<string, unknown>>>("/chats");
  return raw.map(normalizeChat);
}

export async function createChat(payload: CreateChatPayload): Promise<Chat> {
  const raw = await apiFetch<Record<string, unknown>>("/chats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeChat(raw);
}

export async function deleteChat(chatId: number): Promise<void> {
  return apiFetch<void>(`/chats/${chatId}`, { method: "DELETE" });
}

export async function updateChat(
  chatId: number,
  payload: { title?: string; context_size?: number }
): Promise<void> {
  return apiFetch<void>(`/chats/${chatId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMessage(messageId: number): Promise<void> {
  return apiFetch<void>(`/message/${messageId}`, {
    method: "DELETE",
    body: JSON.stringify({ request: true, response: true }),
  });
}

/**
 * Returns a streaming Response from the backend.
 * The caller is responsible for piping the stream to the client.
 */
export async function streamText(
  payload: SendMessagePayload
): Promise<Response> {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}/text/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      model_id: process.env.AI_MODEL_ID,
    }),
  });

  if (response.status === 401) {
    invalidateToken();
    const freshToken = await getToken();
    return fetch(`${API_BASE_URL}/text/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshToken}`,
      },
      body: JSON.stringify({
        ...payload,
        model_id: process.env.AI_MODEL_ID,
      }),
    });
  }

  return response;
}

export type { Chat, Message };
