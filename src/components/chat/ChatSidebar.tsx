"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X, MessageSquare } from "lucide-react";
import { AshTree } from "@/components/ui/AshTree";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Spinner } from "@/components/ui/Spinner";
import type { Chat } from "@/lib/types";

interface ChatSidebarProps {
  chats: Chat[];
  loading: boolean;
  onNewChat: () => void;
  onDeleteChat: (id: number) => void;
  onRenameChat: (id: number, title: string) => void;
}

export function ChatSidebar({
  chats,
  loading,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}: ChatSidebarProps) {
  const params = useParams();
  const activeChatId = params?.chatId ? parseInt(params.chatId as string, 10) : null;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  const startEditing = useCallback((chat: Chat) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  }, []);

  const confirmEdit = useCallback(
    (chatId: number) => {
      const trimmed = editingTitle.trim();
      if (trimmed) {
        onRenameChat(chatId, trimmed);
      }
      setEditingId(null);
    },
    [editingTitle, onRenameChat]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  return (
    <aside className="flex flex-col w-[85vw] max-w-72 sm:w-72 h-full bg-stone-50 dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-4 sm:px-4 sm:py-5 border-b border-stone-200 dark:border-stone-800">
        <AshTree className="w-8 h-11 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-stone-800 dark:text-stone-100 truncate">
            ЯсеньИИ
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500">Спроси у Ясеня</p>
        </div>
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3 hidden sm:block">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors group"
        >
          <Plus
            size={16}
            className="text-forest-600 dark:text-forest-400 group-hover:scale-110 transition-transform"
          />
          Новый чат
        </button>
      </div>

      {/* Chat list */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-stone-400">
            <Spinner size={20} />
          </div>
        ) : chats.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-stone-600 text-center py-6 px-4">
            Начните новый чат
          </p>
        ) : (
          chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = chat.id === editingId;

            return (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-stone-200 dark:bg-stone-800"
                    : "hover:bg-stone-100 dark:hover:bg-stone-900"
                }`}
              >
                <MessageSquare
                  size={14}
                  className="flex-shrink-0 text-stone-400 dark:text-stone-500"
                />

                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1 min-w-0">
                    <input
                      ref={inputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit(chat.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 min-w-0 text-sm bg-white dark:bg-stone-900 border border-forest-400 dark:border-forest-500 rounded-md px-2 py-0.5 outline-none text-stone-800 dark:text-stone-100"
                    />
                    <button
                      onClick={() => confirmEdit(chat.id)}
                      className="p-1 text-forest-600 dark:text-forest-400 hover:text-forest-700"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-stone-400 hover:text-stone-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex-1 min-w-0 text-sm text-stone-700 dark:text-stone-300 truncate"
                  >
                    {chat.title}
                  </Link>
                )}

                {!isEditing && (
                  <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(chat)}
                      className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                      aria-label="Rename"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteChat(chat.id)}
                      className="p-1 rounded text-stone-400 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
