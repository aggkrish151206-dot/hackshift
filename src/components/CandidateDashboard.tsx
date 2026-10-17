import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvaluationDrawer } from './EvaluationDrawer';

export const CandidateDashboard: React.FC = () => {
  const {
    currentUser,
    submissions,
    challenges,
    answerDefenseQuestion,
    navigateTo,
  } = useApp();

  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [defenseInput, setDefenseInput] = useState<{ [key: string]: string }>({});
  const [notice, setNotice] = useState<string | null>(null);

  if (!currentUser) return null;

  const mySubmissions = submissions.filter((s) => s.candidateId === currentUser.id);

  const handleDefenseSubmit = (submissionId: string, questionIndex: number) => {
    const key = `${submissionId}_${questionIndex}`;
    const answer = defenseInput[key];
    if (!answer || !answer.trim()) return;

    answerDefenseQuestion(submissionId, questionIndex, answer.trim());
    setNotice(`Defense answer saved for Question #${questionIndex + 1}`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">{currentUser.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
              Candidate Profile
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {currentUser.college || 'Self-Taught Builder'} · {currentUser.email}
          </div>
          <div className="flex gap-3 text-xs mt-2 text-slate-600">
            {currentUser.githubUrl && (
              <a href={currentUser.githubUrl} target="_blank" rel="noreferrer" className="underline hover:text-slate-900">
                GitHub
              </a>
            )}
            {currentUser.portfolioUrl && (
              <a href={currentUser.portfolioUrl} target="_blank" rel="noreferrer" className="underline hover:text-slate-900">
                Portfolio
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => navigateTo('catalog')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors self-start sm:self-auto"
        >
          Browse Open Challenges
        </button>
      </div>

      {notice && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">
          {notice}
        </div>
      )}

      {/* Submissions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            My Submissions & Status
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your submissions are evaluated blindly under an anonymous token. Review your feedback and complete defense questions.
          </p>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-8 text-center border border-slate-200 rounded-lg text-xs text-slate-500 space-y-3">
            <p>You haven't submitted any challenge solutions yet.</p>
            <button
              onClick={() => navigateTo('catalog')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Browse Challenges
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden">
            {mySubmissions.map((sub) => {
              const chal = challenges.find((c) => c.id === sub.challengeId);
              const score = sub.evaluation?.overall_score || 0;

              return (
                <div key={sub.id} className="p-5 space-y-4">
                  {/* Row Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500">
                        {chal?.startupName} · {chal?.roleCategory} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {chal?.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[11px]">Blinded ID</span>
                        <span className="font-mono font-bold text-slate-900">{sub.anonymousId}</span>
                      </div>

                      <div className="text-right text-xs pl-3 border-l border-slate-200">
                        <span className="text-slate-400 block text-[11px]">AI Score</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {score ? `${score}/100` : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      Status: <strong className="text-slate-900">{sub.status}</strong> ·{' '}
                      <span className="text-slate-500">
                        {sub.isRevealed
                          ? 'Identity unlocked by founder after shortlisting'
                          : 'Identity currently blinded to founder'}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveSubmissionId(sub.id)}
                      className="text-xs font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      View Full AI Feedback
                    </button>
                  </div>

                  {/* Defense Round Questions */}
                  {sub.evaluation && sub.evaluation.defense_questions && (
                    <div className="space-y-3 pt-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Defense Round Questions
                      </span>

                      <div className="space-y-3">
                        {sub.evaluation.defense_questions.map((q, qIdx) => {
                          const existing = (sub.defenseResponses || []).find((d) => d.questionIndex === qIdx);
                          const inputKey = `${sub.id}_${qIdx}`;

                          return (
                            <div key={qIdx} className="p-3 rounded border border-slate-200 bg-white space-y-2 text-xs">
                              <div className="font-medium text-slate-800">
                                <span className="font-mono text-slate-500 mr-1">Q{qIdx + 1}:</span>
                                {q}
                              </div>

                              {existing ? (
                                <div className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                                  <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">Your Answer:</span>
                                  {existing.answer}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <textarea
                                    rows={2}
                                    placeholder="Write your explanation demonstrating how your code handles this case..."
                                    value={defenseInput[inputKey] || ''}
                                    onChange={(e) =>
                                      setDefenseInput({ ...defenseInput, [inputKey]: e.target.value })
                                    }
                                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDefenseSubmit(sub.id, qIdx)}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                                  >
                                    Submit Answer
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeSubmissionId && (
        <EvaluationDrawer
          submissionId={activeSubmissionId}
          onClose={() => setActiveSubmissionId(null)}
        />
      )}
    </div>
  );
};
