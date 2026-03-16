import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { getChats, createChat } from "@/lib/api-client";
import { v4 as uuidv4 } from "uuid";
import type { SessionData } from "@/lib/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.chatIds || session.chatIds.length === 0) {
      return NextResponse.json([]);
    }

    const allChats = await getChats();
    const sessionChatIds = new Set(session.chatIds);
    const sessionChats = allChats.filter((chat) => sessionChatIds.has(chat.id));

    return NextResponse.json(sessionChats);
  } catch (error) {
    console.error("GET /api/chats error:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const modelIdRaw = process.env.AI_MODEL_ID;
    const modelId = modelIdRaw ? parseInt(modelIdRaw, 10) : NaN;

    if (!modelIdRaw || isNaN(modelId)) {
      return NextResponse.json(
        { error: "AI_MODEL_ID is not configured or is not a valid integer" },
        { status: 500 }
      );
    }

    const chat = await createChat({
      title: body.title ?? "Новый чат",
      model_id: modelId,
      context_size: body.context_size ?? 20,
    });

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.sessionId) {
      session.sessionId = uuidv4();
    }
    if (!session.chatIds) {
      session.chatIds = [];
    }

    session.chatIds.push(chat.id);
    await session.save();

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("POST /api/chats error:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
