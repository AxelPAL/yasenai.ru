"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Chat } from "@/lib/types";

interface Props {
  chat: Chat;
}

export function ChatWindowWrapper({ chat }: Props) {
  return <ChatWindow chat={chat} />;
}
