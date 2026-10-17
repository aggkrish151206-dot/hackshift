import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { RotateCcw, LogOut, Settings as SettingsIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, currentView, navigateTo, logout, resetDemoData } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  if (!currentUser) return null;

  const handleDashboardClick = () => {
    if (currentUser.role === 'founder') {
      navigateTo('founder-dashboard');
    } else {
      navigateTo('candidate-dashboard');
    }
  };

  const handleSubmissionsClick = () => {
    if (currentUser.role === 'candidate') {
      navigateTo('candidate-dashboard');
    } else {
      navigateTo('founder-dashboard');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleDashboardClick}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <span className="font-display font-bold text-base tracking-tight text-slate-900">
                BlindProof
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                {currentUser.role === 'founder' ? 'Founder' : 'Applicant'}
              </span>
            </button>

            {/* Minimal Nav: Dashboard, Challenges, Submissions */}
            <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
              <button
                onClick={handleDashboardClick}
                className={`hover:text-slate-900 transition-colors ${
                  currentView === 'founder-dashboard' || currentView === 'candidate-dashboard'
                    ? 'text-slate-950 font-semibold'
                    : ''
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => navigateTo('catalog')}
                className={`hover:text-slate-900 transition-colors ${
                  currentView === 'catalog' || currentView === 'challenge-detail'
                    ? 'text-slate-950 font-semibold'
                    : ''
                }`}
              >
                Challenges
              </button>

              <button
                onClick={handleSubmissionsClick}
                className="hover:text-slate-900 transition-colors"
              >
                Submissions
              </button>
            </nav>
          </div>

          {/* Right Controls: User info, Settings & Sign out */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User display */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium max-w-[110px] truncate">{currentUser.name}</span>
            </div>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              title="Account settings & role switching"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Reset Data button */}
            <button
              onClick={resetDemoData}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
              title="Reset sample data and return to welcome"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};
