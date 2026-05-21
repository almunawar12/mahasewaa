"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  senderId: string;
  content: string;
  isCustomOffer?: boolean;
  offerPrice?: number;
};

export function ChatBox({
  roomId,
  initialMessages,
  currentUserId,
}: {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const optimistic: Message = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      content: draft,
    };
    setMessages((m) => [...m, optimistic]);
    setDraft("");
    // TODO: integrasi realtime (Supabase Realtime / Pusher / WS) — POST ke /api/chat/[roomId]/messages
    void roomId;
  }

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-900"
                }`}
              >
                {m.isCustomOffer && (
                  <div className="mb-1 text-xs font-semibold uppercase opacity-80">
                    Penawaran kustom · Rp {m.offerPrice}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tulis pesan…" />
        <Button type="submit">Kirim</Button>
      </form>
    </div>
  );
}
