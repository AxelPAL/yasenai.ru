"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { useChats } from "@/hooks/useChats";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, loading, deleteChat, renameChat } = useChats();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    // Close the drawer when navigation happens (e.g. user clicks a chat link).
    // Defer the update to avoid synchronously triggering cascading renders.
    const t = window.setTimeout(() => setSidebarOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;

    // Prevent background scrolling while the drawer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] bg-stone-50 dark:bg-stone-950 overflow-hidden">
      <div className="hidden md:block md:flex-shrink-0">
        <ChatSidebar
          chats={chats}
          loading={loading}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={renameChat}
        />
      </div>

      {/* Mobile off-canvas sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          } w-[85vw] max-w-72`}
          role="dialog"
          aria-hidden={!sidebarOpen}
          aria-modal={sidebarOpen}
          aria-label="Chats sidebar"
        >
          <ChatSidebar
            chats={chats}
            loading={loading}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={renameChat}
          />
        </div>
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 px-3 pt-[calc(10px+env(safe-area-inset-top))] pb-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Open chats sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
              ЯсеньИИ
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="p-2 rounded-xl bg-forest-600 hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-600 text-white transition-colors"
              aria-label="New chat"
            >
              <Plus size={18} />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 min-h-0">{children}</div>
      </main>
    </div>
  );
}
