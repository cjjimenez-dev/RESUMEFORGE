import React from 'react';
import { FileText, LogOut } from 'lucide-react';

export function Header({ token, isGuest, user, screen, setScreen, handleLogout }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-borderDark shrink-0 no-print">
      <div className="flex items-center gap-2 font-bold text-lg text-textMain">
        <FileText size={24} className="stroke-[2.5px] text-primary" />
        <span>ResumeForge</span>
      </div>
      
      {(token || isGuest) && (
        <div className="flex items-center gap-4 text-sm">
          {isGuest
            ? <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 font-medium">Guest Mode</span>
            : <span className="text-textMuted">{user?.email}</span>
          }
          {screen === 'editor' && (
            <button 
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain rounded border border-borderDark transition-colors" 
              onClick={() => setScreen('dashboard')}
            >
              Dashboard
            </button>
          )}
          {isGuest ? (
            <button 
              className="px-3 py-1.5 bg-primary hover:bg-primaryHover text-white font-medium rounded transition-colors" 
              onClick={handleLogout}
            >
              Create Account
            </button>
          ) : (
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain rounded border border-borderDark transition-colors" 
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
