import React from 'react';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSinglePlayer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateRoom, onJoinRoom, onSinglePlayer }) => {
  return (
    <div className="min-h-screen bg-swiss-white text-swiss-black font-sans selection:bg-swiss-red selection:text-swiss-white">
      {/* Swiss Background Elements (Geometric) */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-swiss-blue"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-swiss-red"></div>
        <div className="absolute top-1/4 left-1/4 w-12 h-12 border-8 border-swiss-black rounded-full"></div>
      </div>

      <main className="relative z-10 p-12 lg:p-24 max-w-[1600px] mx-auto min-h-screen flex flex-col justify-between">
        {/* Top Section: Asymmetric Header */}
        <div className="swiss-grid">
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.5em] text-swiss-red">
              PROJECT • 001 / DHARMA
            </div>
            <h1 className="text-8xl md:text-[12rem] leading-[0.85] font-black uppercase tracking-tighter mb-12">
              Tales<br />
              <span className="text-swiss-blue">Of</span><br />
              Dharma
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col justify-end pb-12">
            <p className="text-2xl font-bold leading-tight uppercase tracking-tight">
              A MYTHOLOGICAL STRATEGY SYSTEM DEVELOPED FOR THE MODERN INTERFACE. CHAPTER I: THE GATHERING.
            </p>
          </div>
        </div>

        {/* Middle Section: Info Blocks */}
        <div className="swiss-grid mt-24">
          <div className="col-span-12 md:col-span-4 swiss-border p-8 bg-swiss-black text-swiss-white">
            <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">PARTICIPANTS</div>
            <div className="text-6xl font-black italic">02—06</div>
          </div>
          <div className="col-span-12 md:col-span-4 swiss-border p-8">
            <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 text-swiss-red">DIFFICULTY</div>
            <div className="text-6xl font-black italic">ADV.</div>
          </div>
          <div className="col-span-12 md:col-span-4 swiss-border p-8 bg-swiss-blue text-swiss-white">
            <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">RUNTIME</div>
            <div className="text-6xl font-black italic">45M</div>
          </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="flex flex-col md:flex-row gap-4 mt-24">
          <button
            onClick={onSinglePlayer}
            className="swiss-button bg-swiss-red text-swiss-white px-12 text-2xl"
          >
            ASCEND ALONE
          </button>
          <button
            onClick={onCreateRoom}
            className="swiss-button bg-swiss-blue text-swiss-white px-12 text-2xl"
          >
            FORGE REALM
          </button>
          <button
            onClick={onJoinRoom}
            className="swiss-button border-swiss-black px-12 text-2xl"
          >
            ENTER CODE
          </button>
        </div>
      </main>

      <footer className="p-8 border-t-4 border-swiss-black flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div>CORE SYSTEM VER. 1.0.4</div>
        <div className="flex gap-8">
          <span>ETHOS</span>
          <span>SYSTEM</span>
          <span>MANIFESTO</span>
        </div>
        <div className="text-swiss-red">© 2026 DHARMA LABS</div>
      </footer>
    </div>
  );
};
