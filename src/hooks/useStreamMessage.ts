"use client";

import { useState, useCallback, useRef } from "react";
import type { StreamEvent } from "@/lib/types";

interface UseStreamMessageResult {
  sendMessage: (text: string, chatId?: number) => Promise<{ chatId: number | null }>;
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  abort: () => void;
}

export function useStreamMessage(
  onMessageComplete?: (message: { id: number; chat_id: number; request: string; response: string }) => void
): UseStreamMessageResult {
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent("");
  }, []);

  const sendMessage = useCallback(
    async (text: string, chatId?: number): Promise<{ chatId: number | null }> => {
      setError(null);
      setStreamingContent("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let resolvedChatId: number | null = chatId ?? null;
      let messageId: number | null = null;
      let request = text;

      try {
        const response = await fetch("/api/text/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            ...(chatId ? { chat_id: chatId } : {}),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Stream request failed");
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const rawData = line.slice(6).trim();
            if (!rawData) continue;

            try {
              const event: StreamEvent = JSON.parse(rawData);

              if (event.type === "start") {
                resolvedChatId = event.chat_id ?? resolvedChatId;
                messageId = event.message_id ?? null;
                request = event.request ?? text;
              } else if (event.type === "chunk" && event.content) {
                fullResponse += event.content;
                setStreamingContent(fullResponse);
              } else if (event.type === "complete") {
                resolvedChatId = event.chat_id ?? resolvedChatId;
                if (onMessageComplete && messageId !== null && resolvedChatId !== null) {
                  onMessageComplete({
                    id: messageId,
                    chat_id: resolvedChatId,
                    request,
                    response: event.response ?? fullResponse,
                  });
                }
              } else if (event.type === "error") {
                throw new Error(event.error ?? "Stream error");
              }
            } catch {
              // ignore parse errors for partial lines
            }
          }
        }

        return { chatId: resolvedChatId };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { chatId: resolvedChatId };
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return { chatId: resolvedChatId };
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [onMessageComplete]
  );

  return { sendMessage, streamingContent, isStreaming, error, abort };
}
