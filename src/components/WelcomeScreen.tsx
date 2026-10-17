import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheck, Briefcase, UserCheck, ArrowRight } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { selectRole } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    selectRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-8">
        {/* App Title & Tagline */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              BlindProof
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Prove Your Skills. Not Your Background.
          </p>
        </div>

        {/* Role Selection Card */}
        <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-lg shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display text-base font-bold text-slate-900">
              How would you like to use BlindProof?
            </h2>
            <p className="text-xs text-slate-500">
              Select your primary goal to personalize your experience.
            </p>
          </div>

          {/* Two Simple Options */}
          <div className="space-y-3.5">
            {/* Option 1: Founder */}
            <button
              onClick={() => handleRoleSelect('founder')}
              className="w-full text-left p-4 rounded-lg border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 transition-all group flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded bg-slate-100 text-slate-700 shrink-0 mt-0.5 group-hover:bg-slate-200 transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-slate-950">
                    I'm a Founder
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Find talented people, create hiring challenges, and evaluate applicants based on their skills.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </button>

            {/* Option 2: Applicant */}
            <button
              onClick={() => handleRoleSelect('candidate')}
              className="w-full text-left p-4 rounded-lg border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 transition-all group flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded bg-slate-100 text-slate-700 shrink-0 mt-0.5 group-hover:bg-slate-200 transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-slate-950">
                    I'm an Applicant
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Explore opportunities, complete challenges, showcase your skills, and get discovered by startups.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </button>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            You can change your selected role at any time in Settings.
          </div>
        </div>
      </div>
    </div>
  );
};
