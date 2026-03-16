import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { streamText } from "@/lib/api-client";
import type { SessionData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, chat_id, is_online_enabled } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Chats must always be pre-created via POST /api/chats before streaming,
    // so chat_id is always required here.
    if (!chat_id) {
      return NextResponse.json({ error: "chat_id is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.chatIds?.includes(chat_id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const backendResponse = await streamText({
      text: text.trim(),
      chat_id,
      is_online_enabled: is_online_enabled ?? false,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: backendResponse.status }
      );
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("POST /api/text/stream error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
