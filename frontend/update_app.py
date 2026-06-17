import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports at the top
import_block = """import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';"""

old_import_block = """import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Briefcase, GraduationCap, FolderGit2, Wrench, 
  Plus, Trash2, Save, Download, LogOut, ChevronDown, ChevronUp, 
  User, Globe, Mail, Phone, MapPin, RefreshCw, Upload
} from 'lucide-react';"""

content = content.replace(old_import_block, import_block)

# Find the return statement
return_start = content.find('  return (')
if return_start != -1:
    content = content[:return_start] + """  return (
    <div className="min-h-screen bg-bgStart text-textMain font-sans flex flex-col">
      <Header 
        token={token} 
        isGuest={isGuest} 
        user={user} 
        screen={screen} 
        setScreen={setScreen} 
        handleLogout={handleLogout} 
      />

      <div className="flex-1 overflow-auto relative">
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
              loadDogfoodData={loadDogfoodData}
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
"""

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated App.jsx successfully')
