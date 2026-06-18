import React from 'react';
import { FileText, LogOut, Moon, Sun } from 'lucide-react';

export function Header({ token, isGuest, user, screen, setScreen, handleLogout, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-surface border-b border-border shrink-0 no-print">
      <div className="flex items-center gap-2 font-bold text-base md:text-lg text-foreground">
        <FileText size={20} className="stroke-[2.5px] text-primary md:w-6 md:h-6" />
        <span className="hidden sm:inline">ResumeForge</span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
        <button
          onClick={toggleTheme}
          className="p-1.5 md:p-2 text-muted hover:text-foreground hover:bg-surfaceHover rounded-full transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {(token || isGuest) && (
          <>
            {isGuest
              ? <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 font-medium text-xs">Guest Mode</span>
              : <span className="text-muted hidden md:inline">{user?.email}</span>
            }
            {screen === 'editor' && (
              <button 
                className="px-2 md:px-3 py-1.5 bg-background hover:bg-surfaceHover text-foreground rounded border border-border transition-colors" 
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
                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-background hover:bg-surfaceHover text-foreground rounded border border-border transition-colors" 
                onClick={handleLogout}
              >
                <LogOut size={14} />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
