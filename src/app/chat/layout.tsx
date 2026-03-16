import { ChatLayout } from "@/components/chat/ChatLayout";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
}
