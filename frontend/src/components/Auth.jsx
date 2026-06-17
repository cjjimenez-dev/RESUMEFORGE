import React from 'react';
import { motion } from 'framer-motion';

export function Auth({ authMode, setAuthMode, authEmail, setAuthEmail, authPassword, setAuthPassword, handleAuth, authError, loading, handleGuestMode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-bgStart to-bgEnd"
    >
      <div className="bg-cardBg border border-borderDark rounded-xl p-8 shadow-2xl max-w-md w-full backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-textMain mb-2 text-center">
          {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
        </h2>
        <div className="text-textDim text-sm text-center mb-6">
          {authMode === 'login' ? 'Sign in to access your portfolio resumes' : 'Create an account to build your professional portfolio'}
        </div>
        
        {authError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-md text-sm mb-6 border ${authError.toLowerCase().includes('successful') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
          >
            {authError}
          </motion.div>
        )}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textMuted">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-900/50 border border-borderDark rounded-md px-3 py-2 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textMuted">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-900/50 border border-borderDark rounded-md px-3 py-2 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2 px-4 rounded-md transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-textMuted flex items-center justify-center gap-2">
          {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            className="text-textMain font-semibold hover:text-primary transition-colors underline"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
            }}
          >
            {authMode === 'login' ? 'Register Now' : 'Sign In'}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-borderDark flex-1"></div>
          <span className="text-xs text-textDim uppercase tracking-wider">or</span>
          <div className="h-px bg-borderDark flex-1"></div>
        </div>
        
        <button 
          className="w-full bg-slate-800 hover:bg-slate-700 text-textMain font-medium py-2 px-4 border border-borderDark rounded-md transition-colors"
          onClick={handleGuestMode}
        >
          Continue as Guest
        </button>
        <p className="mt-3 text-xs text-center text-textDim">
          No account needed · data saved locally in your browser
        </p>
      </div>
    </motion.div>
  );
}
