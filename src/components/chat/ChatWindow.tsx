"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import { useStreamMessage } from "@/hooks/useStreamMessage";
import type { Chat } from "@/lib/types";

interface DisplayMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  chat: Chat | null;
  onChatCreated?: (chatId: number) => void;
}

export function ChatWindow({ chat, onChatCreated }: ChatWindowProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  useEffect(() => {
    if (chat?.messages) {
      const display: DisplayMessage[] = [];
      for (const msg of chat.messages) {
        if (msg.request) {
          display.push({ id: msg.id, role: "user", content: msg.request });
        }
        if (msg.response) {
          display.push({ id: msg.id, role: "assistant", content: msg.response });
        }
      }
      setMessages(display);
    } else {
      setMessages([]);
    }
  }, [chat]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleMessageComplete = useCallback(
    (msg: { id: number; chat_id: number; request: string; response: string }) => {
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.role !== "user" || m.id !== undefined || m.content !== msg.request);
        return [
          ...withoutTemp,
          { id: msg.id, role: "assistant" as const, content: msg.response },
        ];
      });
    },
    []
  );

  const { sendMessage, streamingContent, isStreaming, error, abort } =
    useStreamMessage(handleMessageComplete);

  const handleSend = useCallback(
    async (text: string) => {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      scrollToBottom();

      let targetChatId = chat?.id;

      // For new chats: pre-create the chat so the session cookie is set
      // BEFORE streaming begins. iron-session cannot set cookies mid-stream
      // because response headers are already committed at that point.
      if (!chat) {
        try {
          const res = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: text.slice(0, 60) || "Новый чат" }),
          });
          if (!res.ok) throw new Error("Failed to create chat");
          const newChat = await res.json();
          targetChatId = newChat.id;
          onChatCreated?.(newChat.id);
        } catch {
          console.error("Pre-create chat error");
          return;
        }
      }

      await sendMessage(text, targetChatId);

      if (!chat && targetChatId) {
        router.push(`/chat/${targetChatId}`);
      }
    },
    [chat, sendMessage, onChatCreated, router, scrollToBottom]
  );

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    // flex-1 ensures the composer stays pinned to the bottom in the page shell
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        {isEmpty ? (
          <EmptyChat />
        ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble
              key={`${msg.id ?? "temp"}-${i}`}
              role={msg.role}
              content={msg.content}
            />
          ))}

          {isStreaming && streamingContent && (
            <MessageBubble
              role="assistant"
              content={streamingContent}
              isStreaming
            />
          )}

          {isStreaming && !streamingContent && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-stone-200 dark:bg-stone-700">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
                {error}
              </p>
            </div>
          )}
        </div>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onAbort={abort}
      />
    </div>
  );
}
