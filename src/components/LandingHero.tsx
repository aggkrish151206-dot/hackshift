import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Shield, Check } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const { navigateTo, demoLogin, submissions, challenges } = useApp();

  const previewSubs = submissions
    .filter((s) => s.evaluation)
    .sort((a, b) => (b.evaluation?.overall_score || 0) - (a.evaluation?.overall_score || 0))
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
      {/* Hero Intro */}
      <section className="space-y-6 text-left max-w-3xl">
        <div className="inline-block text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
          Proof-of-work hiring for tech startups
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Prove your skills. <br />
          Not your background.
        </h1>

        <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
          BlindProof evaluates startup candidates on practical micro-challenges instead of resumes or college prestige. Submissions are scored anonymously by AI against a transparent rubric, with personal identities unlocked only after shortlisting.
        </p>

        {/* Simple CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              demoLogin('jordan.taylor@builds.dev', 'candidate');
              navigateTo('catalog');
            }}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Explore Challenges
          </button>

          <button
            onClick={() => {
              demoLogin('alex@hyperscale.ai', 'founder');
              navigateTo('founder-dashboard');
            }}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            Company Recruiter Dashboard
          </button>
        </div>
      </section>

      {/* 3 Core Principles - Clean simple list, no heavy cards */}
      <section className="border-t border-slate-200 pt-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
          Core Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-1">1. Blind evaluation</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Names, photos, college names, and background details are hidden during initial review. Candidates are represented solely by anonymous identifiers like <span className="font-mono font-medium text-slate-800">BP-1042</span>.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 mb-1">2. Proof of work</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Founders post real-world micro-tasks reflecting day-to-day work. Candidates submit working code, architectures, and explanations.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 mb-1">3. AI-assisted scoring</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini AI evaluates submissions against the founder's custom rubric, providing evidence quotes, requirement checks, and three defense questions.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works - Minimal 3-step sequence */}
      <section className="border-t border-slate-200 pt-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-mono font-bold text-slate-900 text-sm">Step 1</div>
            <div className="font-semibold text-slate-900">Post a challenge</div>
            <p className="leading-relaxed">Founder defines task deliverables, required skills, and weighted evaluation criteria.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-mono font-bold text-slate-900 text-sm">Step 2</div>
            <div className="font-semibold text-slate-900">Anonymous submission</div>
            <p className="leading-relaxed">Candidates submit solution code and technical reasoning. Gemini AI generates score and defense questions.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-mono font-bold text-slate-900 text-sm">Step 3</div>
            <div className="font-semibold text-slate-900">Shortlist & reveal</div>
            <p className="leading-relaxed">Founders review evidence and candidate defense answers. Candidate identity is revealed only after shortlisting.</p>
          </div>
        </div>
      </section>

      {/* Sample Anonymous Leaderboard Preview - Clean simple table */}
      <section className="border-t border-slate-200 pt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sample Anonymous Leaderboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live demonstration of blinded submissions ranked by evidence score.</p>
          </div>

          <button
            onClick={() => {
              demoLogin('alex@hyperscale.ai', 'founder');
              navigateTo('founder-dashboard');
            }}
            className="text-xs font-semibold text-slate-900 hover:text-slate-600 flex items-center gap-1"
          >
            <span>Open Company Recruiter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Candidate ID</th>
                <th className="py-2.5 px-3">Challenge</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewSubs.map((sub) => {
                const chal = challenges.find((c) => c.id === sub.challengeId);
                const score = sub.evaluation?.overall_score || 0;
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {sub.anonymousId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {chal?.title}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      {score}/100
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {sub.status}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          demoLogin('alex@hyperscale.ai', 'founder');
                          navigateTo('founder-dashboard', sub.challengeId, sub.id);
                        }}
                        className="text-xs font-medium text-slate-800 hover:text-slate-950 underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Plain Disclaimer */}
      <footer className="text-xs text-slate-500 border-t border-slate-200 pt-6">
        <span className="font-medium text-slate-700">Notice:</span> AI evaluation scores are decision-support aids designed to highlight objective task evidence. Hiring decisions remain the responsibility of human reviewers.
      </footer>
    </div>
  );
};
