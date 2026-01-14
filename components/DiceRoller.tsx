
import React, { useState, useEffect } from 'react';
import { UI_TRANSITIONS } from '../constants';

interface DiceRollerProps {
  onComplete: (result: number) => void;
  title?: string;
  ranges?: {
    capture?: [number, number];
    retaliation?: [number, number];
    safe?: [number, number];
  };
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onComplete, title, ranges }) => {
  const [isRolling, setIsRolling] = useState(true);
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);
  const [phase, setPhase] = useState<'rolling' | 'result'>('rolling');

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setDie1(Math.floor(Math.random() * 6) + 1);
        setDie2(Math.floor(Math.random() * 6) + 1);
      }, 100);
    }

    const timer = setTimeout(() => {
      clearInterval(interval);
      setIsRolling(false);
      setPhase('result');
      
      const finalDie1 = Math.floor(Math.random() * 6) + 1;
      const finalDie2 = Math.floor(Math.random() * 6) + 1;
      setDie1(finalDie1);
      setDie2(finalDie2);
      
      setTimeout(() => {
        onComplete(finalDie1 + finalDie2);
      }, 2000);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const total = die1 + die2;

  const getResultLabel = () => {
    if (!ranges) return 'Result Revealed';
    if (ranges.capture && total >= ranges.capture[0] && total <= ranges.capture[1]) return 'SUCCESS: CAPTURED';
    if (ranges.retaliation && total >= ranges.retaliation[0] && total <= ranges.retaliation[1]) return 'FAILURE: RETALIATION';
    if (ranges.safe && total >= ranges.safe[0] && total <= ranges.safe[1]) return 'FAILURE: SAFE ZONE';
    return 'Result Revealed';
  };

  const getResultColor = () => {
    if (!ranges) return 'text-[#F59E0B]';
    if (ranges.capture && total >= ranges.capture[0] && total <= ranges.capture[1]) return 'text-green-500';
    if (ranges.retaliation && total >= ranges.retaliation[0] && total <= ranges.retaliation[1]) return 'text-red-500';
    if (ranges.safe && total >= ranges.safe[0] && total <= ranges.safe[1]) return 'text-yellow-500';
    return 'text-white';
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-[#F59E0B] animate-pulse">
          {title || 'Invoking Divine Will'}
        </h2>
        {ranges && (
          <div className="flex gap-4 mt-6 justify-center">
             <div className="bg-green-900/40 border border-green-500/40 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-300">Capture: {ranges.capture?.[0]}-{ranges.capture?.[1]}</span>
             </div>
             <div className="bg-red-900/40 border border-red-500/40 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-300">Retaliation: {ranges.retaliation?.[0]}-{ranges.retaliation?.[1]}</span>
             </div>
             <div className="bg-yellow-900/40 border border-yellow-500/40 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300">Safe: {ranges.safe?.[0]}-{ranges.safe?.[1]}</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex gap-8 items-center justify-center relative">
        {[die1, die2].map((val, i) => (
          <div 
            key={i}
            className={`
              w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]
              border-4 border-gray-200 transition-all duration-75
              ${isRolling ? 'rotate-12 scale-110 translate-y-2' : 'rotate-0 scale-100 translate-y-0'}
            `}
          >
             <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full p-4">
               {val === 1 && <div className="col-start-2 row-start-2 w-4 h-4 bg-teal-900 rounded-full mx-auto my-auto"></div>}
               {val === 2 && (
                 <>
                   <div className="col-start-1 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                 </>
               )}
               {val === 3 && (
                 <>
                   <div className="col-start-1 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-2 row-start-2 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                 </>
               )}
               {val === 4 && (
                 <>
                   <div className="col-start-1 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-1 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                 </>
               )}
               {val === 5 && (
                 <>
                   <div className="col-start-1 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-2 row-start-2 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-1 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                 </>
               )}
               {val === 6 && (
                 <>
                   <div className="col-start-1 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-1 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-1 row-start-2 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-2 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-1 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                   <div className="col-start-3 row-start-3 w-4 h-4 bg-teal-900 rounded-full"></div>
                 </>
               )}
             </div>
          </div>
        ))}
      </div>

      <div className={`mt-16 text-center ${phase === 'result' ? 'animate-in zoom-in opacity-100' : 'opacity-0'}`}>
        <div className={`text-6xl font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] ${getResultColor()}`}>
          {total}
        </div>
        <p className={`${getResultColor()} font-black uppercase tracking-widest mt-4`}>
          {getResultLabel()}
        </p>
      </div>
    </div>
  );
};
