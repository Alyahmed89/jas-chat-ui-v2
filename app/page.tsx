'use client';
import { useState, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{role:string;text:string}[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const sessionId = useRef<string|null>(null);
  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, {role:'user', text}]);
    setInput(''); setLoading(true);
    try {
      const body: {message:string; session_id?:string} = { message: text };
      if (sessionId.current) body.session_id = sessionId.current;
      const r = await fetch('https://prolog.anyapp.cfd/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const d = await r.json();
      if (d?.session_id) sessionId.current = String(d.session_id);
      const ans = d?.data?.answer ?? d?.answer ?? d?.error ?? '...';
      setMessages(m => [...m, {role:'assistant', text:String(ans)}]);
    } catch (e) {
      setMessages(m => [...m, {role:'assistant', text:'(connection error)'}]);
    } finally { setLoading(false); }
  }
  return (
    <div className='flex flex-col h-screen'>
      <header className='p-4 text-xl font-bold border-b'>JAS</header>
      <main className='flex-1 overflow-y-auto p-4 space-y-2'>
        {messages.map((m, i) => (
          <div key={i} className={m.role==='user'?'text-right':'text-left'}>
            <span className={'inline-block px-3 py-2 rounded-lg '+(m.role==='user'?'bg-blue-600 text-white':'bg-gray-200 text-black')}>{m.text}</span>
          </div>
        ))}
      </main>
      <footer className='p-4 border-t flex gap-2'>
        <input className='flex-1 border rounded px-3 py-2 text-black' value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder='Ask anything…' />
        <button className='px-4 py-2 bg-blue-600 text-white rounded' onClick={send}>Send</button>
      </footer>
    </div>
  );
}
