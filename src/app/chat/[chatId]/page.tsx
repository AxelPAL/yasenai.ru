import { notFound } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { getChats } from "@/lib/api-client";
import { ChatWindowWrapper } from "./ChatWindowWrapper";
import type { SessionData } from "@/lib/types";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { chatId } = await params;
  const id = parseInt(chatId, 10);

  if (isNaN(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.chatIds?.includes(id)) {
    notFound();
  }

  const allChats = await getChats();
  const chat = allChats.find((c) => c.id === id);

  if (!chat) {
    notFound();
  }

  return <ChatWindowWrapper chat={chat} />;
}
