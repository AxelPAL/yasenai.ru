"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "./ChatSidebar";
import { useChats } from "@/hooks/useChats";
import type { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();
  const { chats, loading, createChat, deleteChat, renameChat } = useChats();

  const handleNewChat = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleDeleteChat = useCallback(
    async (id: number) => {
      await deleteChat(id);
      router.push("/chat");
    },
    [deleteChat, router]
  );

  return (
    <div className="flex h-screen bg-white dark:bg-stone-950 overflow-hidden">
      <ChatSidebar
        chats={chats}
        loading={loading}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={renameChat}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
