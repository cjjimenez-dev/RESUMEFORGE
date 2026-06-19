import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { ConfirmModal } from './components/ConfirmModal';

const API_BASE_URL = import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:8000/api`;

const DEFAULT_RESUME_CONTENT = {
  personal_info: {
    full_name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: ""
  },
  experience: [],
  education: [],
  projects: [],
  skills: []
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(localStorage.getItem('guestMode') === 'true');
  const [screen, setScreen] = useState(
    token || localStorage.getItem('guestMode') === 'true' ? 'dashboard' : 'auth'
  );
  const [authMode, setAuthMode] = useState('login');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Auth Form
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Dashboard & Editor
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('personal');

  // Import / upload state
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Custom confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: null,
  });

  const showConfirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, confirmText, cancelText, variant, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);
  const [isDragging, setIsDragging] = useState(false);

  // Load on boot
  useEffect(() => {
    if (localStorage.getItem('guestMode') === 'true') {
      setResumes(JSON.parse(localStorage.getItem('rf_guest') || '[]'));
    } else if (token) {
      fetchUser();
      fetchResumes();
    }
  }, []);

  // Headers helper
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResumes = async () => {
    if (isGuest) {
      setResumes(JSON.parse(localStorage.getItem('rf_guest') || '[]'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    const endpoint = authMode === 'login' ? 'login' : 'register';
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (authMode === 'login') {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setScreen('dashboard');
      } else {
        setAuthMode('login');
        setAuthError('Registration successful! Please login.');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    setToken('');
    setIsGuest(false);
    setUser(null);
    setResumes([]);
    setScreen('auth');
  };

  const handleGuestMode = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setResumes(JSON.parse(localStorage.getItem('rf_guest') || '[]'));
    setScreen('dashboard');
  };

  const handleCreateResume = async () => {
    if (isGuest) {
      const newResume = {
        id: Date.now(),
        title: 'New Resume',
        template_name: 'classic',
        content: JSON.parse(JSON.stringify(DEFAULT_RESUME_CONTENT)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const saved = JSON.parse(localStorage.getItem('rf_guest') || '[]');
      const updated = [...saved, newResume];
      localStorage.setItem('rf_guest', JSON.stringify(updated));
      setResumes(updated);
      setCurrentResume(newResume);
      setScreen('editor');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: "New Resume",
          template_name: "classic",
          content: DEFAULT_RESUME_CONTENT
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentResume(data);
        setScreen('editor');
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!currentResume) return;
    if (isGuest) {
      const updated = { ...currentResume, updated_at: new Date().toISOString() };
      const saved = JSON.parse(localStorage.getItem('rf_guest') || '[]');
      const newList = saved.map(r => r.id === updated.id ? updated : r);
      localStorage.setItem('rf_guest', JSON.stringify(newList));
      setCurrentResume(updated);
      setResumes(newList);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resumes/${currentResume.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          title: currentResume.title,
          template_name: currentResume.template_name,
          content: currentResume.content
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentResume(data);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = (id, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'Delete Resume',
      message: 'This action is permanent and cannot be undone. Are you sure you want to delete this resume?',
      confirmText: 'Yes, Delete',
      cancelText: 'Keep It',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        if (isGuest) {
          const saved = JSON.parse(localStorage.getItem('rf_guest') || '[]');
          const newList = saved.filter(r => r.id !== id);
          localStorage.setItem('rf_guest', JSON.stringify(newList));
          setResumes(newList);
          if (currentResume?.id === id) { setCurrentResume(null); setScreen('dashboard'); }
          return;
        }
        try {
          const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
          if (res.ok) {
            if (currentResume && currentResume.id === id) {
              setCurrentResume(null);
              setScreen('dashboard');
            }
            fetchResumes();
          }
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const handleExportDocx = (id) => {
    if (isGuest) {
      showConfirm({
        title: 'Free Account Required',
        message: 'Word export requires a free account. Sign up now to unlock this feature!',
        confirmText: 'Sign Up Free',
        cancelText: 'Maybe Later',
        variant: 'info',
        onConfirm: () => {
          closeConfirm();
          localStorage.removeItem('guestMode');
          setIsGuest(false);
          setScreen('auth');
          setResumes([]);
        },
      });
      return;
    }
    window.open(`${API_BASE_URL}/resumes/${id}/export/docx?token=${token}`, '_blank');
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleImportFile = async (file) => {
    if (isGuest) {
      showConfirm({
        title: 'Free Account Required',
        message: 'File import requires a free account to process. Sign up now — it\'s completely free!',
        confirmText: 'Sign Up Free',
        cancelText: 'Maybe Later',
        variant: 'info',
        onConfirm: () => {
          closeConfirm();
          localStorage.removeItem('guestMode');
          setIsGuest(false);
          setScreen('auth');
          setResumes([]);
        },
      });
      return;
    }
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setImportError('Only PDF and DOCX files are supported.');
      return;
    }
    setImporting(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const parseRes = await fetch(`${API_BASE_URL}/parse-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.detail || 'Failed to parse resume');
      }
      const parsed = await parseRes.json();
      const createRes = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: parsed.suggested_title || 'Imported Resume',
          template_name: 'classic',
          content: {
            personal_info: parsed.personal_info,
            experience:    parsed.experience,
            education:     parsed.education,
            skills:        parsed.skills,
            projects:      parsed.projects,
          },
        }),
      });
      if (createRes.ok) {
        const newResume = await createRes.json();
        setCurrentResume(newResume);
        setScreen('editor');
        fetchResumes();
      }
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImportFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  // Safe input update helper
  const updatePersonalInfo = (field, value) => {
    setCurrentResume({
      ...currentResume,
      content: {
        ...currentResume.content,
        personal_info: {
          ...currentResume.content.personal_info,
          [field]: value
        }
      }
    });
  };

  const updateListField = (section, index, field, value) => {
    const list = [...(currentResume.content[section] || [])];
    list[index] = { ...list[index], [field]: value };
    setCurrentResume({
      ...currentResume,
      content: {
        ...currentResume.content,
        [section]: list
      }
    });
  };

  const addListField = (section, defaultObj) => {
    const list = [...(currentResume.content[section] || [])];
    setCurrentResume({
      ...currentResume,
      content: {
        ...currentResume.content,
        [section]: [...list, defaultObj]
      }
    });
  };

  const removeListField = (section, index) => {
    const list = [...(currentResume.content[section] || [])];
    list.splice(index, 1);
    setCurrentResume({
      ...currentResume,
      content: {
        ...currentResume.content,
        [section]: list
      }
    });
  };

  return (
    <div className="min-h-screen bg-bgStart text-textMain font-sans flex flex-col">
      {/* Custom Confirm Modal — replaces all native browser confirm() dialogs */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <Header 
        token={token} 
        isGuest={isGuest} 
        user={user} 
        screen={screen} 
        setScreen={setScreen} 
        handleLogout={handleLogout} 
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 overflow-auto relative print:overflow-visible">
        <AnimatePresence mode="wait">
          {screen === 'auth' && (
            <Auth
              key="auth"
              authMode={authMode}
              setAuthMode={setAuthMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              handleAuth={handleAuth}
              authError={authError}
              loading={loading}
              handleGuestMode={handleGuestMode}
            />
          )}

          {screen === 'dashboard' && (
            <Dashboard
              key="dashboard"
              isGuest={isGuest}
              setIsGuest={setIsGuest}
              setScreen={setScreen}
              setResumes={setResumes}
              handleCreateResume={handleCreateResume}
              loading={loading}
              resumes={resumes}
              handleDeleteResume={handleDeleteResume}
              handleExportDocx={handleExportDocx}
              setCurrentResume={setCurrentResume}
              isDragging={isDragging}
              importing={importing}
              handleDropFile={handleDropFile}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              fileInputRef={fileInputRef}
              handleImportFile={handleImportFile}
            />
          )}

          {screen === 'editor' && currentResume && (
            <Editor
              key="editor"
              currentResume={currentResume}
              setCurrentResume={setCurrentResume}
              saving={saving}
              handleSaveResume={handleSaveResume}
              handleExportDocx={handleExportDocx}
              handleExportPdf={handleExportPdf}
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
              updatePersonalInfo={updatePersonalInfo}
              handleImageUpload={handleImageUpload}
              updateListField={updateListField}
              removeListField={removeListField}
              addListField={addListField}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
