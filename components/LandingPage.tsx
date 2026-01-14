
import React from 'react';
import { Button } from './Button';
import { COLORS } from '../constants';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSinglePlayer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateRoom, onJoinRoom, onSinglePlayer }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FAFAFA]">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Header Section */}
        <header className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
            Tales of <br /> Dharma
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-500 uppercase tracking-widest">
            A Strategic Card Game of Indian Mythology — 2 to 6 Players
          </p>
        </header>

        {/* Feature Card */}
        <div className="relative group max-w-sm mx-auto">
          <div 
            className="absolute -inset-1 bg-gradient-to-r from-[#0F766E] to-[#7C3AED] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"
          ></div>
          <div className="relative p-8 bg-gradient-to-br from-[#0F766E] to-[#7C3AED] rounded-2xl text-white shadow-2xl space-y-8">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-white/70">Players</span>
                <span className="font-mono">2-6</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-white/70">Duration</span>
                <span className="font-mono">45-60 MIN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-widest text-white/70">Status</span>
                <span className="font-mono bg-[#F59E0B] text-black px-2 py-0.5 rounded text-[10px] font-bold">CHAPTER 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <Button 
            onClick={onSinglePlayer}
            className="w-full sm:w-64 !bg-[#F59E0B] !text-black hover:!bg-[#D97706]"
          >
            Single Player
          </Button>
          <div className="flex gap-4">
            <Button 
              onClick={onCreateRoom}
              className="w-full sm:w-48"
            >
              Create Room
            </Button>
            <Button 
              variant="secondary" 
              onClick={onJoinRoom}
              className="w-full sm:w-48"
            >
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
