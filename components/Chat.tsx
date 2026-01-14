
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  playerName: string;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, playerName }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
      <div className="p-4 border-b-2 border-gray-50 bg-gray-50 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Divine Communications</h3>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] text-green-700 font-black uppercase">Synced</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Transmission</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.playerName === playerName;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 animate-in slide-in-from-bottom-2`}>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-gray-400">{msg.playerName}</span>
                  <span className="text-[7px] text-gray-300 tabular-nums">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`
                  p-3 rounded-xl text-sm max-w-[90%] break-words leading-snug
                  ${isMe 
                    ? 'bg-[#0F766E] text-white rounded-tr-none shadow-lg' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'}
                `}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t-2 border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Transmit intent..."
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 ring-[#0F766E]/20 text-sm transition-all"
        />
        <button 
          type="submit"
          className="p-2.5 bg-[#0F766E] text-white rounded-lg hover:bg-[#14B8A6] transition-all transform active:scale-95 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  );
};
