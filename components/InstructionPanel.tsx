
import React, { useState, useEffect } from 'react';
import { GameCard, TargetingMode } from '../types';

interface InstructionPanelProps {
  isMyTurn: boolean;
  activePlayerName: string;
  targetingMode: TargetingMode;
  selectedCard?: GameCard;
}

export const InstructionPanel: React.FC<InstructionPanelProps> = ({ isMyTurn, activePlayerName, targetingMode, selectedCard }) => {
  const [visible, setVisible] = useState(() => {
    const saved = localStorage.getItem('dharma_instructor_visible');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dharma_instructor_visible', String(visible));
  }, [visible]);

  const getHint = () => {
    if (!isMyTurn) return `Thy spirit is resting. Observe ${activePlayerName}'s manifestations.`;
    if (targetingMode === 'curse') return "Touch an opponent's warrior above to afflict them with thy Curse.";
    if (targetingMode === 'astra') return "Touch thy own warrior card to empower them with thy Astra.";
    if (selectedCard) {
      if (selectedCard.type === 'Major') return `Manifest ${selectedCard.name} into thy Sena forces. (1 KP)`;
      if (selectedCard.type === 'Astra' || selectedCard.type === 'Curse') return "Choose an action from the panel below to manifest this power.";
      return `Thy hand holds ${selectedCard.name}. Direct thy intent via the panel below.`;
    }
    return "Thy cycle is active. Manifest thy manifestations or conclude thy turn [E].";
  };

  return (
    <>
      <button 
        onClick={() => setVisible(!visible)}
        className={`fixed top-24 left-8 z-[250] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-2xl border-2 pointer-events-auto ${visible ? 'bg-[#0F766E] border-white/40' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'}`}
      >
        <span className="text-xl font-black">i</span>
      </button>

      {visible && (
        <div className="fixed top-40 left-8 z-[200] w-full max-w-xs animate-in slide-in-from-left duration-500 pointer-events-none">
           <div className="bg-white/95 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border-4 border-[#0F766E] relative overflow-hidden pointer-events-auto">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F766E]"></div>
              <button onClick={() => setVisible(false)} className="absolute top-3 right-3 text-gray-300 hover:text-black transition-colors">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h4 className="text-[#0F766E] font-black uppercase text-[8px] tracking-[0.4em] mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-ping"></span> Instruction
              </h4>
              <p className="text-gray-600 font-bold italic text-xs leading-relaxed">"{getHint()}"</p>
           </div>
        </div>
      )}
    </>
  );
};
