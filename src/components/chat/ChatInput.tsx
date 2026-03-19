"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onAbort: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, isStreaming, onAbort, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  return (
    <div
      className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-3 sm:px-4 pt-3 sm:pt-4 pb-[calc(12px+env(safe-area-inset-bottom))]"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-900 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border border-stone-200 dark:border-stone-700 focus-within:border-forest-400 dark:focus-within:border-forest-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent resize-none overflow-y-hidden outline-none text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 leading-relaxed min-h-[24px] max-h-[200px]"
          />
          <button
            onClick={isStreaming ? onAbort : handleSend}
            disabled={!isStreaming && (!text.trim() || disabled)}
            className={`flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isStreaming
                ? "bg-red-500 hover:bg-red-600 text-white"
                : text.trim() && !disabled
                ? "bg-forest-600 hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed"
            }`}
            aria-label={isStreaming ? "Stop" : "Send"}
          >
            {isStreaming ? <Square size={16} fill="currentColor" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-600 text-center mt-2">
          ИИ может допускать ошибки. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  );
}
