import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download, RefreshCw, User, Briefcase, GraduationCap, Code, Star, ChevronDown, ChevronUp, Trash2, Plus, Minus } from 'lucide-react';
import { ClassicTemplate, ModernTemplate, CreativeTemplate } from './ResumeTemplates';
import ImageCropperModal from './ImageCropperModal';

export function Editor({
  currentResume, setCurrentResume, saving, handleSaveResume, handleExportDocx, handleExportPdf, loadDogfoodData,
  activeAccordion, setActiveAccordion, updatePersonalInfo, handleImageUpload, updateListField, removeListField, addListField
}) {
  const printRef = useRef(null);

  // Auto-open the section that has the most imported content
  useEffect(() => {
    const c = currentResume?.content || {};
    const info = c.personal_info || {};
    const hasPersonal = !!(info.full_name || info.email || info.phone);
    const expCount = (c.experience || []).length;
    const eduCount = (c.education || []).length;
    const skillCount = (c.skills || []).length;
    const projCount = (c.projects || []).length;

    // Pick the section with the most content to auto-open
    const scores = [
      { key: 'personal',   score: hasPersonal ? 1 : 0 },
      { key: 'experience', score: expCount },
      { key: 'education',  score: eduCount },
      { key: 'skills',     score: skillCount },
      { key: 'projects',   score: projCount },
    ];
    const best = scores.reduce((a, b) => b.score > a.score ? b : a, { key: 'personal', score: 0 });
    if (best.score > 0) setActiveAccordion(best.key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResume?.id]);

  const accordionVariants = {
    open: { opacity: 1, height: 'auto', marginTop: 12 },
    collapsed: { opacity: 0, height: 0, marginTop: 0 }
  };

  const templates = ['classic', 'modern', 'creative'];
  const paperSizes = ['a4', 'letter', 'legal'];
  const paperSize = currentResume.paper_size || 'a4';

  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState(null);

  const handleLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedImageBase64) => {
    updatePersonalInfo('image', croppedImageBase64);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[480px_1fr] h-[calc(100vh-65px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* LEFT PANEL: FORM EDITOR */}
      <div className="flex flex-col bg-slate-950 border-r border-borderDark overflow-hidden no-print" style={{height: 'calc(100vh - 65px)'}}>
        <div className="p-4 border-b border-borderDark bg-slate-900 flex flex-col gap-3 shrink-0">
          <input 
            type="text" 
            className="w-full bg-transparent text-lg font-semibold text-textMain focus:outline-none focus:border-b focus:border-primary px-1 pb-1"
            value={currentResume.title} 
            onChange={(e) => setCurrentResume({ ...currentResume, title: e.target.value })}
            placeholder="Resume Title"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primaryHover text-white text-sm font-medium rounded transition-colors disabled:opacity-50" onClick={handleSaveResume} disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark transition-colors" onClick={() => handleExportDocx(currentResume.id)}>
              <Download size={14} />
              Word
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark transition-colors" onClick={handleExportPdf}>
              <Download size={14} />
              PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-primary text-xs rounded border border-dashed border-primary transition-colors ml-auto" onClick={loadDogfoodData}>
              <RefreshCw size={12} />
              Dogfood
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {/* 1. PERSONAL INFO Accordion */}
          <div className="bg-cardBg border border-borderDark rounded-lg overflow-hidden shrink-0">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
              onClick={() => setActiveAccordion(activeAccordion === 'personal' ? '' : 'personal')}
            >
              <div className="flex items-center gap-2 font-semibold text-textMain text-sm uppercase tracking-wider">
                <User size={16} className="text-textDim" />
                Personal Information
                {(currentResume.content?.personal_info?.full_name || currentResume.content?.personal_info?.email) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">✓</span>
                )}
              </div>
              {activeAccordion === 'personal' ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </div>
            <AnimatePresence>
              {activeAccordion === 'personal' && (
                <motion.div 
                  initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} transition={{ duration: 0.2 }}
                  className="px-4 pb-4 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Profile Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleLocalImageUpload} className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-textMain hover:file:bg-slate-700 bg-slate-900 border border-borderDark rounded p-1 text-textMuted"/>
                    {currentResume.content?.personal_info?.image && (
                      <div className="flex flex-col gap-3 mt-2 border border-slate-800 bg-slate-900/50 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Position</label>
                            <select 
                              className="w-full bg-slate-800 border border-borderDark rounded px-2 py-1 text-xs text-textMain focus:outline-none focus:border-primary"
                              value={currentResume.content?.personal_info?.image_position || 'center'}
                              onChange={(e) => updatePersonalInfo('image_position', e.target.value)}
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Size</label>
                            <div className="flex items-center justify-between bg-slate-800 border border-borderDark rounded overflow-hidden h-[26px]">
                              <button 
                                onClick={() => updatePersonalInfo('image_size', Math.max(40, (typeof currentResume.content?.personal_info?.image_size === 'number' ? currentResume.content?.personal_info?.image_size : 120) - 10))} 
                                className="px-2 h-full text-textMuted hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
                              >
                                <Minus size={12} />
                              </button>
                              <div className="flex-1 text-center text-xs text-textMain font-medium">
                                {typeof currentResume.content?.personal_info?.image_size === 'number' ? currentResume.content?.personal_info?.image_size : 120}px
                              </div>
                              <button 
                                onClick={() => updatePersonalInfo('image_size', Math.min(400, (typeof currentResume.content?.personal_info?.image_size === 'number' ? currentResume.content?.personal_info?.image_size : 120) + 10))} 
                                className="px-2 h-full text-textMuted hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Shape</label>
                            <select 
                              className="w-full bg-slate-800 border border-borderDark rounded px-2 py-1 text-xs text-textMain focus:outline-none focus:border-primary"
                              value={currentResume.content?.personal_info?.image_shape || 'circle'}
                              onChange={(e) => updatePersonalInfo('image_shape', e.target.value)}
                            >
                              <option value="circle">Circle</option>
                              <option value="square">Square</option>
                            </select>
                          </div>
                        </div>
                        <button className="w-full px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20 hover:bg-red-500/20 transition-colors" onClick={() => updatePersonalInfo('image', null)}>Remove Image</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Full Name</label>
                    <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.full_name || ''} onChange={(e) => updatePersonalInfo('full_name', e.target.value)} placeholder="John Doe"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Professional Title</label>
                    <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.title || ''} onChange={(e) => updatePersonalInfo('title', e.target.value)} placeholder="Full Stack Software Engineer"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Email</label>
                      <input type="email" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.email || ''} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="john.doe@example.com"/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Phone</label>
                      <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.phone || ''} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="+1 (555) 019-2834"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Location</label>
                      <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.location || ''} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="San Francisco, CA"/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Website</label>
                      <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.website || ''} onChange={(e) => updatePersonalInfo('website', e.target.value)} placeholder="johndoe.dev"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">LinkedIn</label>
                      <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.linkedin || ''} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe"/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-textMuted uppercase tracking-wide">GitHub</label>
                      <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.github || ''} onChange={(e) => updatePersonalInfo('github', e.target.value)} placeholder="github.com/johndoe"/>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Professional Summary</label>
                    <textarea rows={4} className="w-full bg-slate-900 border border-borderDark rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" value={currentResume.content?.personal_info?.summary || ''} onChange={(e) => updatePersonalInfo('summary', e.target.value)} placeholder="Write a brief, compelling introduction..."/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. EDUCATION Accordion */}
          <div className="bg-cardBg border border-borderDark rounded-lg overflow-hidden shrink-0">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none" onClick={() => setActiveAccordion(activeAccordion === 'education' ? '' : 'education')}>
              <div className="flex items-center gap-2 font-semibold text-textMain text-sm uppercase tracking-wider">
                <GraduationCap size={16} className="text-textDim" />
                Education
                {(currentResume.content?.education?.length > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">{currentResume.content.education.length}</span>
                )}
              </div>
              {activeAccordion === 'education' ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </div>
            <AnimatePresence>
              {activeAccordion === 'education' && (
                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} transition={{ duration: 0.2 }} className="px-4 pb-4 flex flex-col gap-6">
                  {(currentResume.content?.education || []).map((edu, idx) => (
                    <div key={idx} className="relative bg-slate-900/50 border border-borderDark rounded p-4 flex flex-col gap-4 group">
                      <button className="absolute top-3 right-3 text-textDim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListField('education', idx)}>
                        <Trash2 size={14} />
                      </button>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Degree</label>
                        <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.degree || ''} onChange={(e) => updateListField('education', idx, 'degree', e.target.value)} placeholder="B.S. Computer Science"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">School</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.school || ''} onChange={(e) => updateListField('education', idx, 'school', e.target.value)} placeholder="Stanford University"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Location</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.location || ''} onChange={(e) => updateListField('education', idx, 'location', e.target.value)} placeholder="Stanford, CA"/>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Start Date</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.start_date || ''} onChange={(e) => updateListField('education', idx, 'start_date', e.target.value)} placeholder="Sep 2017"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">End Date</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.end_date || ''} onChange={(e) => updateListField('education', idx, 'end_date', e.target.value)} placeholder="May 2021"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">GPA</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.gpa || ''} onChange={(e) => updateListField('education', idx, 'gpa', e.target.value)} placeholder="3.8/4.0"/>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Description</label>
                        <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={edu.description || ''} onChange={(e) => updateListField('education', idx, 'description', e.target.value)} placeholder="Minor in Mathematics"/>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark border-dashed transition-colors" onClick={() => addListField('education', { degree: "", school: "", location: "", start_date: "", end_date: "", gpa: "", description: "" })}>
                    <Plus size={14} /> Add Education
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. EXPERIENCE Accordion */}
          <div className="bg-cardBg border border-borderDark rounded-lg overflow-hidden shrink-0">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
              onClick={() => setActiveAccordion(activeAccordion === 'experience' ? '' : 'experience')}
            >
              <div className="flex items-center gap-2 font-semibold text-textMain text-sm uppercase tracking-wider">
                <Briefcase size={16} className="text-textDim" />
                Work Experience
                {(currentResume.content?.experience?.length > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">{currentResume.content.experience.length}</span>
                )}
              </div>
              {activeAccordion === 'experience' ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </div>
            <AnimatePresence>
              {activeAccordion === 'experience' && (
                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} transition={{ duration: 0.2 }} className="px-4 pb-4 flex flex-col gap-6">
                  {(currentResume.content?.experience || []).map((exp, idx) => (
                    <div key={idx} className="relative bg-slate-900/50 border border-borderDark rounded p-4 flex flex-col gap-4 group">
                      <button className="absolute top-3 right-3 text-textDim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListField('experience', idx)}>
                        <Trash2 size={14} />
                      </button>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Job Title</label>
                        <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={exp.job_title || ''} onChange={(e) => updateListField('experience', idx, 'job_title', e.target.value)} placeholder="Senior Software Engineer"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Company</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={exp.company || ''} onChange={(e) => updateListField('experience', idx, 'company', e.target.value)} placeholder="Acme Corp"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Location</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={exp.location || ''} onChange={(e) => updateListField('experience', idx, 'location', e.target.value)} placeholder="New York, NY"/>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Start Date</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={exp.start_date || ''} onChange={(e) => updateListField('experience', idx, 'start_date', e.target.value)} placeholder="Jun 2021"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">End Date</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary disabled:opacity-50" value={exp.end_date || ''} onChange={(e) => updateListField('experience', idx, 'end_date', e.target.value)} placeholder="Present" disabled={exp.current}/>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer w-fit mt-[-0.5rem]">
                        <input type="checkbox" className="rounded bg-slate-900 border-borderDark text-primary focus:ring-primary" checked={exp.current || false} onChange={(e) => updateListField('experience', idx, 'current', e.target.checked)}/>
                        I currently work here
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Role Description</label>
                        <textarea rows={3} className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={exp.description || ''} onChange={(e) => updateListField('experience', idx, 'description', e.target.value)} placeholder="• Bullet points of accomplishments..."/>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark border-dashed transition-colors" onClick={() => addListField('experience', { job_title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "" })}>
                    <Plus size={14} /> Add Experience
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. SKILLS Accordion */}
          <div className="bg-cardBg border border-borderDark rounded-lg overflow-hidden shrink-0">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none" onClick={() => setActiveAccordion(activeAccordion === 'skills' ? '' : 'skills')}>
              <div className="flex items-center gap-2 font-semibold text-textMain text-sm uppercase tracking-wider">
                <Star size={16} className="text-textDim" />
                Skills
                {(currentResume.content?.skills?.length > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">{currentResume.content.skills.length}</span>
                )}
              </div>
              {activeAccordion === 'skills' ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </div>
            <AnimatePresence>
              {activeAccordion === 'skills' && (
                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} transition={{ duration: 0.2 }} className="px-4 pb-4 flex flex-col gap-4">
                  {(currentResume.content?.skills || []).map((skill, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" className="w-1/3 bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={skill.category || ''} onChange={(e) => updateListField('skills', idx, 'category', e.target.value)} placeholder="Category (e.g. Frontend)"/>
                      <input type="text" className="flex-1 bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={skill.name || ''} onChange={(e) => updateListField('skills', idx, 'name', e.target.value)} placeholder="React, Vue, Tailwind..."/>
                      <button className="px-2 text-textDim hover:text-red-400 transition-colors" onClick={() => removeListField('skills', idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark border-dashed transition-colors mt-2" onClick={() => addListField('skills', { name: "", category: "General" })}>
                    <Plus size={14} /> Add Skill Group
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. PROJECTS Accordion */}
          <div className="bg-cardBg border border-borderDark rounded-lg overflow-hidden mb-8 shrink-0">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none" onClick={() => setActiveAccordion(activeAccordion === 'projects' ? '' : 'projects')}>
              <div className="flex items-center gap-2 font-semibold text-textMain text-sm uppercase tracking-wider">
                <Code size={16} className="text-textDim" />
                Projects
                {(currentResume.content?.projects?.length > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">{currentResume.content.projects.length}</span>
                )}
              </div>
              {activeAccordion === 'projects' ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </div>
            <AnimatePresence>
              {activeAccordion === 'projects' && (
                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} transition={{ duration: 0.2 }} className="px-4 pb-4 flex flex-col gap-6">
                  {(currentResume.content?.projects || []).map((proj, idx) => (
                    <div key={idx} className="relative bg-slate-900/50 border border-borderDark rounded p-4 flex flex-col gap-4 group">
                      <button className="absolute top-3 right-3 text-textDim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListField('projects', idx)}>
                        <Trash2 size={14} />
                      </button>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Project Title</label>
                        <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={proj.title || ''} onChange={(e) => updateListField('projects', idx, 'title', e.target.value)} placeholder="ResumeForge"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Role</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={proj.role || ''} onChange={(e) => updateListField('projects', idx, 'role', e.target.value)} placeholder="Creator"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Link / URL</label>
                          <input type="text" className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={proj.link || ''} onChange={(e) => updateListField('projects', idx, 'link', e.target.value)} placeholder="github.com/..."/>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-textMuted uppercase tracking-wide">Description</label>
                        <textarea rows={2} className="w-full bg-slate-900 border border-borderDark rounded px-3 py-1.5 text-sm text-textMain focus:outline-none focus:border-primary" value={proj.description || ''} onChange={(e) => updateListField('projects', idx, 'description', e.target.value)} placeholder="• Built with React..."/>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-textMain text-sm rounded border border-borderDark border-dashed transition-colors" onClick={() => addListField('projects', { title: "", role: "", link: "", description: "" })}>
                    <Plus size={14} /> Add Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE PREVIEW */}
      <div className="flex flex-col bg-slate-800 overflow-hidden relative print:block print:overflow-visible">
        <div className="bg-slate-900 border-b border-borderDark px-4 py-2 flex items-center justify-between z-10 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Template:</span>
            <div className="flex bg-slate-800 rounded p-1 border border-borderDark">
              {templates.map(tpl => (
                <button
                  key={tpl}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${currentResume.template_name === tpl ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-textMain'}`}
                  onClick={() => setCurrentResume({ ...currentResume, template_name: tpl })}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Paper:</span>
            <div className="flex bg-slate-800 rounded p-1 border border-borderDark">
              {paperSizes.map(size => (
                <button
                  key={size}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${paperSize === size ? 'bg-slate-600 text-white shadow' : 'text-textMuted hover:text-textMain'}`}
                  onClick={() => setCurrentResume({ ...currentResume, paper_size: size })}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-textMuted hidden md:block">
            Changes save automatically
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-800 custom-scrollbar print:p-0 print:bg-transparent print:overflow-visible print:block">
          <style>{`
            @media print {
              @page {
                size: ${paperSize === 'letter' ? 'letter portrait' : paperSize === 'legal' ? 'legal portrait' : 'A4 portrait'};
                margin: 0;
              }
            }
          `}</style>
          <div className={`resume-paper paper-${paperSize}`} ref={printRef}>
            {currentResume.template_name === 'classic' && <ClassicTemplate content={currentResume.content} />}
            {currentResume.template_name === 'modern' && <ModernTemplate content={currentResume.content} />}
            {currentResume.template_name === 'creative' && <CreativeTemplate content={currentResume.content} />}
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={cropperSrc}
        onCropComplete={handleCropComplete}
        shape={currentResume.content?.personal_info?.image_shape || 'circle'}
      />
    </div>
  );
}
