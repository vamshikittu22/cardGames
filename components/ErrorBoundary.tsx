
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly using React.Component to ensure the 'props' property is correctly inherited and typed.
class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Divine Disturbance Detected:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F1117] text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 p-8 rounded-2xl shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">☠</div>
            <h1 className="text-2xl font-black uppercase mb-4 text-red-500 tracking-tighter">Divine Error Detected</h1>
            <p className="text-red-200/70 mb-8 font-mono text-sm leading-relaxed bg-black/40 p-4 rounded-lg overflow-auto max-h-40">
              {this.state.error?.message || "An unknown disturbance has occurred in the cycles."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              Realign Cycles
            </button>
          </div>
        </div>
      );
    }

    // Fix: Correctly access children through this.props, which is now recognized by the compiler.
    return this.props.children;
  }
}

export default ErrorBoundary;
