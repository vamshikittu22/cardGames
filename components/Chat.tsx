
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './Button';

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
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-600">Room Chat</h3>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Online</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-xs py-10 font-medium">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#0F766E]">{msg.playerName}</span>
                <span className="text-[8px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-3 rounded-xl text-sm ${msg.playerName === playerName ? 'bg-[#0F766E]/5 text-gray-800 ml-4 rounded-tr-none' : 'bg-gray-100 text-gray-700 mr-4 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t-2 border-gray-50 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 px-4 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 ring-[#0F766E]/20 text-sm"
        />
        <button 
          type="submit"
          className="p-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#14B8A6] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  );
};
