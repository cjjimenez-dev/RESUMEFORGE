import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, Download, FileText } from 'lucide-react';

export function Dashboard({ 
  isGuest, setIsGuest, setScreen, setResumes, 
  handleCreateResume, loading, resumes, 
  handleDeleteResume, handleExportDocx, setCurrentResume,
  isDragging, importing, handleDropFile, handleDragOver, handleDragLeave,
  fileInputRef, handleImportFile
}) {

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 max-w-5xl mx-auto w-full"
    >
      {isGuest && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg mb-8">
          <span className="text-sm font-medium">Guest mode — resumes are stored in this browser only. Clearing browser data will erase them.</span>
          <button
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded transition-colors whitespace-nowrap"
            onClick={() => { localStorage.removeItem('guestMode'); setIsGuest(false); setScreen('auth'); setResumes([]); }}
          >
            Sign up to unlock Word export
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">My Portfolios</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          onClick={handleCreateResume} 
          disabled={loading}
        >
          <Plus size={16} /> Create Resume
        </button>
      </div>

      {/* ── Import Zone ── */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 mb-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-border bg-surface'
        } ${importing ? 'pointer-events-none cursor-default' : ''}`}
        onDrop={handleDropFile}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !importing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleImportFile(e.target.files[0])}
        />
        {importing ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-6 h-6 border-2 border-border border-t-muted rounded-full animate-spin mb-1" />
            <div className="text-sm font-medium text-muted">Parsing your resume...</div>
            <div className="text-xs text-secondary">Extracting experience, education & skills</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload size={24} className="text-secondary mb-2" />
            <div className="text-sm font-medium text-foreground">Import existing resume</div>
            <div className="text-xs text-secondary">Drop a PDF or DOCX — we'll auto-fill all fields for you</div>
            <button className="mt-3 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded bg-surfaceHover hover:bg-surfaceHover transition-colors">
              Browse files
            </button>
          </div>
        )}
      </div>

      {resumes.length === 0 && !loading ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <FileText size={48} className="mx-auto text-secondary mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-muted mb-2">No resumes yet</h3>
          <p className="text-sm text-secondary max-w-md mx-auto">Create a new resume from scratch or import your existing PDF/Word file to get started.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {resumes.map(r => (
            <motion.div 
              key={r.id} 
              variants={itemVariants}
              className="bg-surface border border-border rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => { setCurrentResume(r); setScreen('editor'); }}
              />
              <h3 className="text-lg font-semibold text-foreground mb-1">{r.title}</h3>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-4">
                {r.template_name} Layout
              </p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-secondary z-10 relative">
                <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
                
                <div className="flex gap-2">
                  <button 
                    className="flex items-center gap-1.5 px-2 py-1 bg-surfaceHover hover:bg-surfaceHover text-muted rounded border border-border transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleExportDocx(r.id); }}
                    title="Export to Word"
                  >
                    <Download size={12} /> Word
                  </button>
                  <button 
                    className="flex items-center justify-center w-7 h-7 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id, e); }}
                    title="Delete Resume"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <motion.div 
            variants={itemVariants}
            className="border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center h-48 cursor-pointer transition-colors text-secondary hover:text-primary"
            onClick={handleCreateResume}
          >
            <Plus size={24} className="mb-2" />
            <span className="text-sm font-medium">Create New Resume</span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
