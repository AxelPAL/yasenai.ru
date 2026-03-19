import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { deleteChat, updateChat } from "@/lib/api-client";
import type { SessionData } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

async function getSessionAndValidate(chatId: number) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.chatIds?.includes(chatId)) {
    return { session: null, error: "Chat not found in session" };
  }

  return { session, error: null };
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const chatId = parseInt(id, 10);

    const { session, error } = await getSessionAndValidate(chatId);
    if (!session) {
      return NextResponse.json({ error }, { status: 404 });
    }

    await deleteChat(chatId);

    session.chatIds = session.chatIds!.filter((cid) => cid !== chatId);
    await session.save();

    return new NextResponse(null, { status: 204 });
  } catch {
    console.error("DELETE /api/chats/[id] error");
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const chatId = parseInt(id, 10);

    const { session, error } = await getSessionAndValidate(chatId);
    if (!session) {
      return NextResponse.json({ error }, { status: 404 });
    }

    const body = await request.json();
    await updateChat(chatId, body);

    return new NextResponse(null, { status: 204 });
  } catch {
    console.error("PATCH /api/chats/[id] error");
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}
