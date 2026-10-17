import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './components/AuthPage';
import { ChallengeCatalog } from './components/ChallengeCatalog';
import { ChallengeDetail } from './components/ChallengeDetail';
import { FounderDashboard } from './components/FounderDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';
import { ApplicantOnboarding } from './components/ApplicantOnboarding';
import { CreditsPage } from './components/CreditsPage';

const MainContent: React.FC = () => {
  const { currentView, currentUser, navigateTo, resetDemoData, logout } = useApp();

  // If user is not authenticated:
  if (!currentUser) {
    if (currentView === 'welcome') {
      return <WelcomeScreen />;
    }
    return <AuthPage />;
  }

  // If new applicant is completing onboarding:
  if (currentView === 'onboarding') {
    return <ApplicantOnboarding />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="flex-1">
        {currentView === 'catalog' && <ChallengeCatalog />}
        {currentView === 'challenge-detail' && <ChallengeDetail />}
        {currentView === 'founder-dashboard' && <FounderDashboard />}
        {currentView === 'candidate-dashboard' && <CandidateDashboard />}
        {currentView === 'credits' && <CreditsPage />}
      </main>

      {/* Simple, Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-xs text-slate-500 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900">BlindProof</span>
            <span>·</span>
            <span>Prove your skills, not your background.</span>
          </div>

          <div className="flex items-center gap-5 text-slate-600">
            <button
              onClick={() => {
                if (currentUser.role === 'founder') {
                  navigateTo('founder-dashboard');
                } else {
                  navigateTo('candidate-dashboard');
                }
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigateTo('catalog')}
              className="hover:text-slate-900 transition-colors"
            >
              Challenges
            </button>
            <button
              onClick={() => {
                if (currentUser.role === 'candidate') {
                  navigateTo('candidate-dashboard');
                } else {
                  navigateTo('founder-dashboard');
                }
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Submissions
            </button>
            <button
              onClick={logout}
              className="hover:text-slate-900 transition-colors text-slate-500"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          Anonymous evaluations are powered by Gemini 3.8 Flash. Candidate identities remain blinded until shortlisted.
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
