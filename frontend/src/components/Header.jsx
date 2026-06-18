import React from 'react';
import { FileText, LogOut } from 'lucide-react';

export function Header({ token, isGuest, user, screen, setScreen, handleLogout }) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-slate-900 border-b border-borderDark shrink-0 no-print">
      <div className="flex items-center gap-2 font-bold text-base md:text-lg text-textMain">
        <FileText size={20} className="stroke-[2.5px] text-primary md:w-6 md:h-6" />
        <span className="hidden sm:inline">ResumeForge</span>
      </div>
      
      {(token || isGuest) && (
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
          {isGuest
            ? <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 font-medium text-xs">Guest Mode</span>
            : <span className="text-textMuted hidden md:inline">{user?.email}</span>
          }
          {screen === 'editor' && (
            <button 
              className="px-2 md:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain rounded border border-borderDark transition-colors" 
              onClick={() => setScreen('dashboard')}
            >
              Dashboard
            </button>
          )}
          {isGuest ? (
            <button 
              className="px-2 md:px-3 py-1.5 bg-primary hover:bg-primaryHover text-white font-medium rounded transition-colors" 
              onClick={handleLogout}
            >
              <span className="hidden sm:inline">Create Account</span>
              <span className="sm:hidden">Signup</span>
            </button>
          ) : (
            <button 
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain rounded border border-borderDark transition-colors" 
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
