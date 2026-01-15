
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Room, GameCard as IGameCard, Player, TargetingMode } from '../types';
import { GameHeader } from './GameHeader';
import { AssuraZone } from './AssuraZone';
import { PlayerArea } from './PlayerArea';
import { ControlPanel } from './ControlPanel';
import { GameLog } from './GameLog';
import { DeckPile } from './DeckStacks';
import { GameCard } from './GameCard';
import { DiceRoller } from './DiceRoller';
import { VictoryScreen } from './VictoryScreen';
import { socket } from '../lib/socket';

interface BoardProps {
  room: Room;
  currentPlayerId: string;
  onUpdateRoom: (room: Room) => void;
  onLeaveRoom: () => void;
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onLeaveRoom }) => {
  const [showLog, setShowLog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'basics' | 'cards' | 'winning'>('basics');
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('none');
  const [rollingFor, setRollingFor] = useState<{ type: 'power' | 'capture', card: IGameCard, playerId: string } | null>(null);
  const [showTurnOverlay, setShowTurnOverlay] = useState(false);
  
  const [animatingDraw, setAnimatingDraw] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number } | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const handScrollRef = useRef<HTMLDivElement>(null);

  const [instructorVisible, setInstructorVisible] = useState(() => {
    const saved = localStorage.getItem('dharma_instructor_visible');
    return saved === null ? true : saved === 'true';
  });

  const activePlayer = useMemo(() => room.players[room.activePlayerIndex], [room.players, room.activePlayerIndex]);
  const isMyTurn = activePlayer?.id === currentPlayerId;
  const currentPlayer = useMemo(() => room.players.find(p => p.id === currentPlayerId) || room.players[0], [room.players, currentPlayerId]);
  const otherPlayers = useMemo(() => room.players.filter(p => p.id !== currentPlayerId), [room.players, currentPlayerId]);
  const isGameOver = room.status === 'finished';

  const selectedCard = useMemo(() => currentPlayer.hand.find(c => c.id === selectedCardId), [currentPlayer.hand, selectedCardId]);

  useEffect(() => {
    setShowTurnOverlay(true);
    const t = setTimeout(() => setShowTurnOverlay(false), 2000);
    return () => clearTimeout(t);
  }, [room.activePlayerIndex]);

  const showToast = useCallback((message: string, color: string = '#0F766E') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const emitAction = useCallback((actionType: string, payload: any = {}) => {
    if (actionType === 'DRAW_CARD') {
      const dRect = deckRef.current?.getBoundingClientRect();
      const hRect = handRef.current?.getBoundingClientRect();
      if (dRect && hRect) {
        setAnimatingDraw({
          id: Date.now(),
          startX: dRect.left + dRect.width / 2,
          startY: dRect.top + dRect.height / 2,
          endX: hRect.left + hRect.width / 2,
          endY: hRect.top + hRect.height / 2
        });
        setTimeout(() => setAnimatingDraw(null), 850);
      }
    }
    socket.emit('game_action', { roomId: room.roomCode, playerId: currentPlayerId, actionType, payload });
  }, [room.roomCode, currentPlayerId]);

  const handleAction = useCallback((label: string, cost: number) => {
    if (!isMyTurn || isGameOver) {
      showToast("Seeker, thy cycle has not yet arrived.", "red");
      return;
    }
    
    if (label === 'Draw Card') {
      if (currentPlayer.karmaPoints < 1) return showToast("Insufficient Karma Point.", "red");
      emitAction('DRAW_CARD');
      showToast("Drawing from the Cosmos...", "#0F766E");
      return;
    }

    if (label === 'Capture Assura') {
      if (currentPlayer.karmaPoints < 2) return showToast("Need 2 Karma for Ritual.", "red");
      setTargetingMode('capture-assura');
      showToast("Choose an Assura from the Board.", "#EA580C");
      return;
    }

    if (!selectedCardId) return showToast("Select a card from thy hand first.", "red");

    const card = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!card) return;

    if (label === 'Introduce Major') {
      if (card.type !== 'Major') return showToast("Only Warriors can be introduced to Sena.", "red");
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost });
      showToast(`${card.name} deployed!`, "#7C3AED");
      setSelectedCardId(null);
    } else if (label === 'Play Astra') {
      if (card.type !== 'Astra') return showToast("Select an Astra Artifact.", "red");
      setTargetingMode('astra');
      showToast("Pick a warrior to empower.", "#F59E0B");
    } else if (label === 'Attach Curse') {
      if (card.type !== 'Curse') return showToast("Select a Curse card.", "red");
      setTargetingMode('curse');
      showToast("Select an opponent's warrior to afflict.", "#7F1D1D");
    } else if (label === 'Play Maya') {
      if (card.type !== 'Maya') return showToast("Select a Maya card.", "red");
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost });
      showToast("The veil of Maya spreads...", "#2563EB");
      setSelectedCardId(null);
    }
  }, [isMyTurn, isGameOver, currentPlayer, selectedCardId, emitAction, showToast]);

  const handleEndTurn = useCallback(() => {
    if (!isMyTurn || isGameOver) return;
    socket.emit('game_action', { roomId: room.roomCode, playerId: currentPlayerId, actionType: 'END_TURN' });
    setSelectedCardId(null);
    setTargetingMode('none');
    showToast("Turn Concluded.", "#64748b");
  }, [isMyTurn, isGameOver, room.roomCode, currentPlayerId, showToast]);

  const scrollHand = (direction: 'left' | 'right') => {
    if (handScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      handScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      const key = e.key.toLowerCase();
      if (key === 'e') { e.preventDefault(); handleEndTurn(); }
      if (key === 'd') { e.preventDefault(); handleAction('Draw Card', 1); }
      if (key === '?' || (e.shiftKey && e.key === '?')) { e.preventDefault(); setShowGuide(prev => !prev); }
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (currentPlayer.hand[idx]) { e.preventDefault(); setSelectedCardId(currentPlayer.hand[idx].id); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, handleEndTurn, isGameOver, currentPlayer.hand]);

  const getDynamicHint = () => {
    if (!isMyTurn) return `Awaiting ${activePlayer.name}'s manifestations. Observe their moves.`;
    if (targetingMode === 'capture-assura') return "Select an Assura in the center board to challenge it.";
    if (targetingMode === 'astra') return "Bestow this Astra upon a warrior in thy own Sena forces.";
    if (targetingMode === 'curse') return "Target an opponent's warrior (above) to diminish their power.";
    if (selectedCard) {
      if (selectedCard.type === 'General') return `Generals like ${selectedCard.name} provide permanent passive bonuses to thy realm.`;
      if (selectedCard.type === 'Shakny') return `Use Shakny cards to modify dice rolls during challenges.`;
      if (selectedCard.type === 'Clash') return `Clash cards allow you to react and challenge an opponent's action.`;
      if (selectedCard.type === 'Major') return `Deploy ${selectedCard.name} to Sena? [Cost: 1 KP]`;
    }
    return "Execute thy strategy or conclude thy cycle [E].";
  };

  const handleTargetSelection = (playerId: string, cardId: string) => {
    emitAction('PLAY_CARD', { cardId: selectedCardId, cost: 1, targetInfo: { playerId, cardId } });
    setTargetingMode('none');
    setSelectedCardId(null);
  };

  const handleDiceComplete = (result: number) => {
    if (!rollingFor) return;
    const { card } = rollingFor;
    const capRange = card.captureRange || [8, 12];
    const isCaptured = result >= capRange[0] && result <= capRange[1];
    emitAction('CAPTURE_RESULT', { isCaptured, cardId: card.id });
    setRollingFor(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-white flex flex-col select-none overflow-hidden">
      {isGameOver && room.winner && (
        <VictoryScreen roomName={room.roomName} winner={room.winner} players={room.players} turnCount={room.currentTurn} onReturnToLobby={() => socket.emit('reset_room', { roomId: room.roomCode })} onExit={onLeaveRoom} />
      )}

      {showTurnOverlay && !isGameOver && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none animate-in fade-in out fade-out duration-1000">
           <div className="bg-black/80 backdrop-blur-3xl px-16 py-8 rounded-[40px] border-4 border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] scale-150 transform transition-transform">
             <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white text-center">{activePlayer.name}'s Cycle</h2>
             <p className="text-[10px] font-bold text-white/40 text-center uppercase tracking-widest mt-2">Dharma has shifted</p>
           </div>
        </div>
      )}

      {animatingDraw && (
        <div className="animate-draw-card" style={{ '--start-x': `${animatingDraw.startX}px`, '--start-y': `${animatingDraw.startY}px`, '--end-x': `${animatingDraw.endX}px`, '--end-y': `${animatingDraw.endY}px` } as any}>
          <GameCard card={{} as IGameCard} isBack size="sm" />
        </div>
      )}

      <button onClick={() => setInstructorVisible(!instructorVisible)} className={`fixed bottom-[320px] left-6 z-[250] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border-2 ${instructorVisible ? 'bg-[#0F766E] border-white/40' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'}`} title="Toggle Instructor">
        <span className="text-xl font-black">i</span>
      </button>

      {instructorVisible && !isGameOver && (
        <div className="fixed bottom-80 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl animate-in slide-in-from-bottom duration-500 px-4">
          <div className="bg-white p-6 rounded-[32px] shadow-2xl border-4 border-[#0F766E] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F766E]"></div>
             <button onClick={() => setInstructorVisible(false)} className="absolute top-4 right-4 text-gray-300 hover:text-black transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <h4 className="text-black font-black uppercase text-[10px] tracking-[0.3em] mb-1 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-ping"></span> Divine Instruction
             </h4>
             <p className="text-gray-600 text-[13px] leading-relaxed font-bold italic">"{getDynamicHint()}"</p>
          </div>
        </div>
      )}

      {rollingFor && <DiceRoller title={`Challenging ${rollingFor.card.name}`} onComplete={handleDiceComplete} ranges={{ capture: rollingFor.card.captureRange, retaliation: rollingFor.card.retaliationRange, safe: rollingFor.card.safeZone }} />}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} onLeave={onLeaveRoom} />

      <main className="flex-1 mt-24 mb-80 flex flex-col items-center overflow-y-auto scrollbar-hide px-4 pb-12">
        {/* Opponents Area: Multi-player View */}
        <div className="w-full max-w-screen-2xl flex justify-center gap-8 flex-wrap py-4 mb-16 px-12">
          {otherPlayers.map((p, idx) => (
            <div key={p.id} className="w-full lg:w-[calc(50%-2rem)] xl:w-[calc(33%-2rem)] min-h-[350px]">
              <PlayerArea 
                player={p} 
                isActive={room.activePlayerIndex === room.players.findIndex(pl => pl.id === p.id)} 
                isCurrent={false} 
                position="top" 
                targetingMode={targetingMode} 
                onTargetSelect={handleTargetSelection} 
                isGameOver={isGameOver} 
              />
            </div>
          ))}
        </div>

        {/* Board Center */}
        <div className="w-full max-w-screen-2xl flex flex-col lg:flex-row items-center justify-between gap-12 my-12 relative px-12 lg:px-24">
           <div className="flex lg:flex-col gap-10">
             <div ref={deckRef} onClick={() => isMyTurn && handleAction('Draw Card', 1)} className={`cursor-pointer group transition-all ${isMyTurn ? 'hover:scale-105 active:scale-95' : 'opacity-30 grayscale'}`}>
                <DeckPile label="Cosmos [D]" count={room.drawDeck.length} type="draw" isEmpty={room.drawDeck.length === 0} />
             </div>
             <DeckPile label="Submerge" count={room.submergePile.length} type="submerge" isEmpty={room.submergePile.length === 0} />
           </div>

           <AssuraZone assuras={room.assuras} targetingMode={targetingMode} onAssuraSelect={(id) => {
             const target = room.assuras.find(a => a.id === id)!;
             setRollingFor({ type: 'capture', card: target, playerId: currentPlayerId });
             setTargetingMode('none');
           }} />

           <div className="flex flex-col gap-6 items-end">
              <button onClick={() => setShowGuide(true)} className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-[#0F766E] text-white shadow-xl hover:scale-105 active:scale-95 transition-all">Manual of Dharma [?]</button>
              <button onClick={() => setShowLog(true)} className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-xl group">
                <svg className="w-8 h-8 text-white/40 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
              </button>
           </div>
        </div>

        {/* Local Sena forces Area */}
        <div className="w-full max-w-screen-2xl flex justify-center pt-8">
          <PlayerArea player={currentPlayer} isActive={isMyTurn} isCurrent={true} position="bottom" targetingMode={targetingMode} onTargetSelect={handleTargetSelection} isGameOver={isGameOver} />
        </div>
      </main>

      {/* Fixed Bottom UI: Hand with Scrolling Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
         <div className="w-full max-w-7xl mx-auto px-6 pointer-events-auto relative">
            
            {/* Hand Scroll Buttons */}
            {currentPlayer.hand.length > 5 && (
              <>
                <button onClick={() => scrollHand('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-2xl">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button onClick={() => scrollHand('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-2xl">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </>
            )}

            <div ref={handRef} className="relative flex justify-center items-end min-h-[220px] pb-8">
               <div ref={handScrollRef} className="flex gap-5 items-end px-16 py-8 bg-black/70 backdrop-blur-3xl rounded-t-[60px] border-x-2 border-t-2 border-white/10 overflow-x-auto scrollbar-hide shadow-[0_-30px_100px_rgba(0,0,0,0.9)] max-w-full">
                 {currentPlayer.hand.map((card, idx) => (
                   <div key={card.id} onClick={() => !isGameOver && setSelectedCardId(selectedCardId === card.id ? null : card.id)} className="flex-shrink-0 relative group">
                     <GameCard card={card} size="md" isHeld={selectedCardId === card.id} />
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-black text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">[{idx + 1}]</div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
         <div className="w-full pointer-events-auto">
            <ControlPanel kp={currentPlayer.karmaPoints} isActive={isMyTurn && !isGameOver} onAction={handleAction} onEndTurn={handleEndTurn} actionsUsed={room.actionsUsedThisTurn} deckEmpty={room.drawDeck.length === 0} />
         </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="max-w-5xl w-full bg-[#111827] border-4 border-white/10 rounded-[64px] p-20 relative shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#F59E0B] via-[#0F766E] to-[#7C3AED]"></div>
             <button onClick={() => setShowGuide(false)} className="absolute top-12 right-12 text-white/40 hover:text-white transition-colors scale-150"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
             
             <h2 className="text-6xl font-black uppercase tracking-tighter text-white mb-10 italic">Hall of Records</h2>
             
             <div className="flex gap-8 mb-12 border-b border-white/10 pb-4">
               {['basics', 'cards', 'winning'].map(tab => (
                 <button key={tab} onClick={() => setGuideTab(tab as any)} className={`text-sm font-black uppercase tracking-widest pb-4 border-b-4 transition-all ${guideTab === tab ? 'border-[#F59E0B] text-white' : 'border-transparent text-white/30'}`}>
                   {tab}
                 </button>
               ))}
             </div>

             <div className="space-y-10 text-white/80 text-base font-medium leading-relaxed max-h-[50vh] overflow-y-auto pr-10 scrollbar-hide">
               {guideTab === 'basics' && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Hotkeys & Cycle</h3>
                    <p>[D] Manifest Card from Cosmos | [E] Conclude Turn Cycle | [1-9] Select Card</p>
                    <p>Each turn you manifest <strong className="text-[#F59E0B]">3 Karma Points (KP)</strong> up to a max of 10.</p>
                 </div>
               )}
               {guideTab === 'cards' && (
                 <div className="grid grid-cols-1 gap-14">
                   <div className="flex gap-10 items-start">
                     <div className="w-20 h-20 rounded-3xl bg-[#0F766E] flex-shrink-0 flex items-center justify-center text-3xl">🪷</div>
                     <div>
                       <h4 className="text-white font-black uppercase text-xl mb-2">Generals</h4>
                       <p>Thy starting soul. Provides permanent passive traits (e.g., +1 KP per turn, immune to curses). Does not need to be 'played'.</p>
                     </div>
                   </div>
                   <div className="flex gap-10 items-start">
                     <div className="w-20 h-20 rounded-3xl bg-[#EA580C] flex-shrink-0 flex items-center justify-center text-3xl">🎲</div>
                     <div>
                       <h4 className="text-white font-black uppercase text-xl mb-2">Shakny</h4>
                       <p>Dice modifiers. Play these to add +2 or -2 to any roll of the divine dice, increasing thy chance of success.</p>
                     </div>
                   </div>
                   <div className="flex gap-10 items-start">
                     <div className="w-20 h-20 rounded-3xl bg-[#DC2626] flex-shrink-0 flex items-center justify-center text-3xl">🛡️</div>
                     <div>
                       <h4 className="text-white font-black uppercase text-xl mb-2">Clash</h4>
                       <p>Interrupt reactions. Challenge an opponent's action with a 1v1 dice duel to negate their intent.</p>
                     </div>
                   </div>
                 </div>
               )}
               {guideTab === 'winning' && (
                 <div className="p-10 bg-gradient-to-br from-[#450A0A] to-black rounded-[50px] border-2 border-red-500/30">
                    <h3 className="text-3xl font-black text-white uppercase mb-6">Path of the Jailer</h3>
                    <p className="text-lg">Capture <strong className="text-white">3 Assuras</strong> by fulfilling requirements and rolling successfully.</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {toast && <div className="fixed top-28 left-1/2 -translate-x-1/2 px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest text-white shadow-2xl z-[200] animate-in slide-in-from-top border-2 border-white/20" style={{ backgroundColor: toast.color }}>{toast.message}</div>}
      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};
