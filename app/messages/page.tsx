"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

type Message = {
  id: string;
  sender: string;
  recipient: string;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50);
      setMessages((data ?? []) as Message[]);
      setLoading(false);
    })();
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !recipient.trim()) return;
    const { error } = await supabase.from("messages").insert({
      sender: user?.user_metadata?.full_name ?? "Admin",
      recipient,
      body,
    });
    if (!error) {
      setBody("");
      setToast("Message sent");
      setTimeout(() => setToast(null), 2500);
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50);
      setMessages((data ?? []) as Message[]);
    }
  };

  return (
    <div className="page-grid">
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div><h2>Messages</h2><p>Direct messages with field workers</p></div>
            <MessageSquare size={18} className="cell-muted" />
          </div>
          {loading ? (
            <p className="cell-muted">Loading...</p>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-icon"><MessageSquare size={32} /></div>
              <h2>No messages</h2>
              <p>Start a conversation to coordinate data collection.</p>
            </div>
          ) : (
            <div className="activity-list">
              {messages.map((m) => (
                <div key={m.id} className="activity-item">
                  <div className="act-dot" style={{ background: "#eef2ff", color: "var(--primary)" }}>
                    <MessageSquare size={14} />
                  </div>
                  <div className="act-body">
                    <strong>{m.sender}</strong> → {m.recipient}
                    <div>{m.body}</div>
                    <div className="act-time">{new Date(m.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div><h2>Send Message</h2><p>Send a direct message to a field worker</p></div>
          </div>
          <form onSubmit={send} className="form-grid">
            <div className="form-field full">
              <label>Recipient</label>
              <input className="input" placeholder="Field Worker name" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
            </div>
            <div className="form-field full">
              <label>Message</label>
              <textarea className="textarea" placeholder="Type your message..." value={body} onChange={(e) => setBody(e.target.value)} required />
            </div>
            <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary"><Send size={15} /> Send</button>
            </div>
          </form>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
