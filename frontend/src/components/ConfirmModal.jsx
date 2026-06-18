import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmModal — A beautiful, branded replacement for the native browser confirm() dialog.
 *
 * Props:
 *   isOpen      {boolean}  — Whether the modal is visible
 *   title       {string}   — Bold heading text
 *   message     {string}   — Body message
 *   confirmText {string}   — Label for the confirm button (default: "Confirm")
 *   cancelText  {string}   — Label for the cancel button (default: "Cancel")
 *   variant     {string}   — "danger" | "warning" | "info" (default: "danger")
 *   icon        {ReactNode} — Optional icon element
 *   onConfirm   {function} — Called when user clicks confirm
 *   onCancel    {function} — Called when user clicks cancel or backdrop
 */
export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
}) {
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      confirmBtn: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50',
      glow: 'shadow-red-500/20',
    },
    warning: {
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/50',
      glow: 'shadow-amber-500/20',
    },
    info: {
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50',
      glow: 'shadow-blue-500/20',
    },
  };

  const s = variantStyles[variant] || variantStyles.danger;

  // Default icons per variant
  const defaultIcons = {
    danger: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const resolvedIcon = icon || defaultIcons[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
          >
            <div
              className={`
                pointer-events-auto w-full max-w-sm mx-4 rounded-2xl
                bg-[#1a1f2e] border border-white/10
                shadow-2xl ${s.glow}
                p-6 flex flex-col gap-5
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${s.iconBg} ${s.iconColor} flex items-center justify-center`}>
                  {resolvedIcon}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg leading-tight">{title}</h2>
                  {message && (
                    <p className="text-white/55 text-sm mt-0.5 leading-snug">{message}</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/8" />

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="
                    px-4 py-2 rounded-xl text-sm font-medium
                    bg-white/8 hover:bg-white/14 text-white/80 hover:text-white
                    border border-white/10 hover:border-white/20
                    transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/20
                  "
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-semibold text-white
                    ${s.confirmBtn}
                    transition-all duration-150 focus:outline-none focus:ring-2
                    shadow-lg
                  `}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
