import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "@/lib/api-client";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const messageId = parseInt(id, 10);

    await deleteMessage(messageId);

    return new NextResponse(null, { status: 204 });
  } catch {
    console.error("DELETE /api/messages/[id] error");
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
