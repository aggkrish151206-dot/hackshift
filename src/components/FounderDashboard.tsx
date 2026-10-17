import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { EvaluationDrawer } from './EvaluationDrawer';
import { CreateChallengeModal } from './CreateChallengeModal';

export const FounderDashboard: React.FC = () => {
  const {
    currentUser,
    challenges,
    submissions,
    selectedChallengeId,
    selectedSubmissionId,
    shortlistCandidate,
    revealProfile,
    navigateTo,
    demoLogin,
  } = useApp();

  const [activeChallengeId, setActiveChallengeId] = useState<string>(
    selectedChallengeId || (challenges.length > 0 ? challenges[0].id : '')
  );
  const [drawerSubmissionId, setDrawerSubmissionId] = useState<string | null>(selectedSubmissionId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!currentUser) return null;

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const challengeSubmissions = submissions
    .filter((s) => s.challengeId === activeChallenge?.id)
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => {
      const scoreA = a.evaluation?.overall_score || 0;
      const scoreB = b.evaluation?.overall_score || 0;
      return scoreB - scoreA;
    });

  const totalSubmissions = submissions.length;
  const totalEvaluated = submissions.filter((s) => s.evaluation).length;
  const totalShortlisted = submissions.filter((s) => s.status === 'Shortlisted').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">Hiring Dashboard</h1>
            <span className="text-xs text-slate-500 font-medium">({currentUser.company || 'HyperScale AI'})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare anonymous candidates on evidence-backed criteria. Reveal identities only after shortlisting.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Challenge</span>
        </button>
      </div>

      {/* Clean Metric Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500">Active Challenges</span>
          <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{challenges.length}</div>
        </div>
        <div>
          <span className="text-slate-500">Submissions Received</span>
          <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{totalSubmissions}</div>
        </div>
        <div>
          <span className="text-slate-500">Evaluated by AI</span>
          <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{totalEvaluated}</div>
        </div>
        <div>
          <span className="text-slate-500">Shortlisted Candidates</span>
          <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{totalShortlisted}</div>
        </div>
      </div>

      {/* Challenge Selector & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Challenge:</label>
          <select
            value={activeChallenge?.id}
            onChange={(e) => setActiveChallengeId(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-600 max-w-xs truncate"
          >
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1">Status:</span>
          {(['all', 'Evaluated', 'Shortlisted', 'Submitted'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous Leaderboard Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between">
          <span className="font-semibold text-slate-900">
            Anonymous Leaderboard: {activeChallenge?.title}
          </span>
          <span className="text-slate-500 text-[11px]">
            Scores generated via Gemini AI rubric
          </span>
        </div>

        {challengeSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <p>No submissions found under this filter.</p>
            <button
              onClick={() => {
                demoLogin('jordan.taylor@builds.dev', 'candidate');
                navigateTo('challenge-detail', activeChallenge?.id);
              }}
              className="text-slate-900 underline font-medium"
            >
              Switch to candidate to submit a solution
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-600 font-semibold">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-4">Candidate ID</th>
                  <th className="py-2.5 px-4">AI Score</th>
                  <th className="py-2.5 px-4">Confidence</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Profile</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challengeSubmissions.map((sub, idx) => {
                  const score = sub.evaluation?.overall_score || 0;
                  const isShortlisted = sub.status === 'Shortlisted';
                  const isRevealed = sub.isRevealed;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setDrawerSubmissionId(sub.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {sub.anonymousId}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {score ? `${score}/100` : 'Pending'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {sub.evaluation?.confidence || 'Pending'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          isShortlisted ? 'text-emerald-700' : 'text-slate-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {isRevealed ? (
                          <span className="text-emerald-700 font-medium">Revealed</span>
                        ) : (
                          <span>Blinded</span>
                        )}
                      </td>

                      <td
                        className="py-3 px-4 text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setDrawerSubmissionId(sub.id)}
                          className="text-xs text-slate-700 hover:text-slate-900 underline font-medium"
                        >
                          Inspect
                        </button>

                        {!isShortlisted ? (
                          <button
                            onClick={() => shortlistCandidate(sub.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                          >
                            Shortlist
                          </button>
                        ) : !isRevealed ? (
                          <button
                            onClick={() => revealProfile(sub.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
                          >
                            Reveal Profile
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerSubmissionId && (
        <EvaluationDrawer
          submissionId={drawerSubmissionId}
          onClose={() => setDrawerSubmissionId(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateChallengeModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
