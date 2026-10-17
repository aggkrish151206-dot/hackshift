import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CheckCircle2, ArrowRight, Sparkles, UserCheck, Code } from 'lucide-react';

const COMMON_SKILLS = [
  'Full-stack Web',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'AI Engineering',
  'LLM Prompting',
  'FastAPI',
  'PostgreSQL',
  'Product Growth',
  'System Design',
  'Docker',
];

export const ApplicantOnboarding: React.FC = () => {
  const { currentUser, completeApplicantOnboarding } = useApp();

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser?.skills && currentUser.skills.length > 0
      ? currentUser.skills
      : ['Full-stack Web', 'TypeScript', 'React']
  );
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolioUrl || '');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    completeApplicantOnboarding({
      skills: selectedSkills,
      bio: bio.trim(),
      portfolioUrl: portfolioUrl.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        {/* Header */}
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

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-lg shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700 mb-2">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Applicant Onboarding</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Welcome, {currentUser?.name || 'Builder'}!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Complete your profile setup to begin proving your skills through real startup challenges.
            </p>
          </div>

          {/* Privacy & Blind Guarantee Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anonymous Evaluation Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Founders and AI evaluators will NOT see your name, college, or GitHub profile. You are assigned an anonymous candidate ID (e.g. <span className="font-mono font-semibold text-slate-800">BP-1042</span>) until a founder chooses to shortlist your work.
            </p>
          </div>

          <form onSubmit={handleFinish} className="space-y-5 text-xs">
            {/* Skills selection */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                Primary Tracks & Technical Skills
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Select areas you're confident tackling in micro-challenges.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Short Bio */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Short Builder Statement / Bio <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Self-taught developer enthusiastic about low-latency systems and web apps."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700 resize-none"
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Personal Portfolio / Website <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Only disclosed if you are shortlisted by the founder.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Complete Setup & Explore Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
