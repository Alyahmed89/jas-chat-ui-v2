"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "jas";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "jas", content: "Hello! I am JAS. How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("https://prolog.anyapp.cfd/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      const answer = data?.data?.answer ?? "No answer";
      setMessages(prev => [...prev, { role: "jas", content: answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "jas", content: "Error: " + String(e) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      <header className="px-6 py-4 border-b border-gray-700 bg-black">
        <h1 className="text-xl font-bold tracking-tight">JAS</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">
              JAS is thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-4 border-t border-gray-700 bg-black flex gap-2">
        <input
          className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-sm outline-none placeholder-gray-500"
          placeholder="Message JAS..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-4 py-2 text-sm font-medium"
        >
          Send
        </button>
      </div>
    </main>
  );
}
