import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Sliders,
  Sparkles,
  Search,
  Check,
  UserCheck,
  Lock,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  Code,
  Zap,
} from 'lucide-react';
import { EvaluationDrawer } from './EvaluationDrawer';
import { CreateChallengeModal } from './CreateChallengeModal';
import { CandidateCompareModal } from './CandidateCompareModal';
import { RubricRecalibratorModal } from './RubricRecalibratorModal';
import { HiringPacketModal } from './HiringPacketModal';
import { Submission, SubmissionStatus } from '../types';

export const FounderDashboard: React.FC = () => {
  const {
    currentUser,
    challenges,
    submissions,
    selectedChallengeId,
    selectedSubmissionId,
    shortlistCandidate,
    revealProfile,
    batchShortlistCandidates,
    seedQuickCandidate,
    navigateTo,
    demoLogin,
    toastMessage,
  } = useApp();

  const [activeChallengeId, setActiveChallengeId] = useState<string>(
    selectedChallengeId || (challenges.length > 0 ? challenges[0].id : '')
  );
  const [drawerSubmissionId, setDrawerSubmissionId] = useState<string | null>(selectedSubmissionId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecalibrateModal, setShowRecalibrateModal] = useState(false);
  const [hiringPacketSub, setHiringPacketSub] = useState<Submission | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreTierFilter, setScoreTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-selection for Head-to-Head Compare
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  if (!currentUser) return null;

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  // Filtered & sorted submissions
  const challengeSubmissions = useMemo(() => {
    return submissions
      .filter((s) => s.challengeId === activeChallenge?.id)
      .filter((s) => {
        if (statusFilter === 'all') return true;
        return s.status === statusFilter;
      })
      .filter((s) => {
        const score = s.evaluation?.overall_score || 0;
        if (scoreTierFilter === 'top') return score >= 90;
        if (scoreTierFilter === 'high') return score >= 80 && score < 90;
        if (scoreTierFilter === 'mid') return score >= 70 && score < 80;
        if (scoreTierFilter === 'low') return score < 70;
        return true;
      })
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.anonymousId.toLowerCase().includes(q) ||
          s.approachExplanation.toLowerCase().includes(q) ||
          s.solutionText.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const scoreA = a.evaluation?.overall_score || 0;
        const scoreB = b.evaluation?.overall_score || 0;
        return scoreB - scoreA;
      });
  }, [submissions, activeChallenge?.id, statusFilter, scoreTierFilter, searchQuery]);

  const totalSubmissions = submissions.length;
  const totalEvaluated = submissions.filter((s) => s.evaluation).length;
  const totalShortlisted = submissions.filter((s) => s.status === 'Shortlisted').length;
  const highScorers = submissions.filter((s) => (s.evaluation?.overall_score || 0) >= 85).length;

  const toggleSelectSub = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubIds((prev) => {
      if (prev.includes(subId)) {
        return prev.filter((id) => id !== subId);
      } else {
        if (prev.length >= 3) {
          return [prev[1], prev[2], subId]; // keep max 3
        }
        return [...prev, subId];
      }
    });
  };

  const handleLaunchCompare = () => {
    if (selectedSubIds.length >= 2) {
      setShowCompareModal(true);
    }
  };

  const handleBatchShortlist = () => {
    batchShortlistCandidates(selectedSubIds);
    setSelectedSubIds([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast Notification Banner if active */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">Talent Command Center</h1>
            <span className="text-xs text-slate-500 font-medium">({currentUser.company || 'Kinetic Labs'})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective, bias-free candidate calibration powered by Gemini 3.8 Flash technical defense evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => activeChallenge && seedQuickCandidate(activeChallenge.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
            title="Seed benchmark candidate submission for quick judging demo"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Seed Candidate</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Challenge</span>
          </button>
        </div>
      </div>

      {/* Clean Metric Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Active Challenges</span>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">{challenges.length}</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Total Submissions</span>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">{totalSubmissions}</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">High Potential (85+)</span>
          <div className="font-mono text-xl font-bold text-emerald-800 tabular-nums">{highScorers}</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Shortlisted in Pipeline</span>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">{totalShortlisted}</div>
        </div>
      </div>

      {/* Challenge Selector & Rubric Calibration Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-semibold shrink-0">Active Challenge:</label>
          <select
            value={activeChallenge?.id}
            onChange={(e) => {
              setActiveChallengeId(e.target.value);
              setSelectedSubIds([]);
            }}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-900 focus:outline-none focus:border-slate-800 max-w-sm truncate"
          >
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.startupName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {activeChallenge && (
            <button
              onClick={() => setShowRecalibrateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Calibrate Rubric Weights</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate ID or keywords..."
            className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 mr-1 font-medium">Stage:</span>
            {(['all', 'Evaluated', 'Shortlisted', 'Interview'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Score Tier Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 mr-1 font-medium">Score:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'top', label: '90+' },
              { id: 'high', label: '80-89' },
              { id: 'mid', label: '70-79' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setScoreTierFilter(tier.id)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  scoreTierFilter === tier.id
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              Anonymous Calibration Leaderboard: {activeChallenge?.title}
            </span>
            <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {challengeSubmissions.length} Candidate{challengeSubmissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Select 2 or 3 candidates to compare head-to-head
          </span>
        </div>

        {challengeSubmissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <p className="font-medium text-slate-700">No submissions found matching your active filters.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setScoreTierFilter('all');
                  setSearchQuery('');
                }}
                className="text-slate-900 font-semibold underline"
              >
                Reset filters
              </button>
              <span>·</span>
              <button
                onClick={() => activeChallenge && seedQuickCandidate(activeChallenge.id)}
                className="text-emerald-800 font-semibold underline"
              >
                Seed benchmark submission
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        challengeSubmissions.length > 0 &&
                        selectedSubIds.length === Math.min(3, challengeSubmissions.length)
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubIds(challengeSubmissions.slice(0, 3).map((s) => s.id));
                        } else {
                          setSelectedSubIds([]);
                        }
                      }}
                      className="rounded accent-slate-900 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-10">#</th>
                  <th className="py-3 px-4">Candidate Token</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Code Risk</th>
                  <th className="py-3 px-4">Defense Round</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Identity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challengeSubmissions.map((sub, idx) => {
                  const score = sub.evaluation?.overall_score || 0;
                  const isShortlisted = sub.status === 'Shortlisted';
                  const isRevealed = sub.isRevealed;
                  const isSelected = selectedSubIds.includes(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setDrawerSubmissionId(sub.id)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectSub(sub.id, e as any)}
                          className="rounded accent-slate-900 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{sub.anonymousId}</span>
                          <span
                            title="PII verified redacted prior to AI evaluation"
                            className="inline-flex items-center text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Blinded
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-xs ${
                            score >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : score >= 80
                              ? 'bg-indigo-50 text-indigo-800'
                              : score >= 70
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {score ? `${score}/100` : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {sub.codeMetrics?.cyclomaticComplexity || 'A (Low)'}
                      </td>

                      <td className="py-3.5 px-4">
                        {sub.defenseResponses && sub.defenseResponses.length > 0 ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Defended
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold capitalize ${
                            isShortlisted
                              ? 'text-emerald-700'
                              : sub.status === 'Rejected'
                              ? 'text-rose-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {isRevealed ? (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Unmasked
                          </span>
                        ) : (
                          <span className="text-slate-400 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Blinded
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setHiringPacketSub(sub)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                          title="Generate Google/MS Hiring Decision Packet"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Memo</span>
                        </button>

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
                            Unmask
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

      {/* Floating Multi-Select Action Bar (Linear / Ashby style) */}
      {selectedSubIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-full bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-4 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <span className="text-slate-300 font-mono font-medium">
            {selectedSubIds.length} candidate{selectedSubIds.length > 1 ? 's' : ''} selected
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={handleLaunchCompare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compare Blind ({selectedSubIds.length})</span>
          </button>

          <button
            onClick={handleBatchShortlist}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Batch Shortlist</span>
          </button>

          <button
            onClick={() => setSelectedSubIds([])}
            className="text-slate-400 hover:text-white transition-colors text-[11px]"
          >
            Deselect
          </button>
        </div>
      )}

      {/* Evaluation Drawer */}
      {drawerSubmissionId && (
        <EvaluationDrawer
          submissionId={drawerSubmissionId}
          onClose={() => setDrawerSubmissionId(null)}
        />
      )}

      {/* Head-to-Head Compare Modal */}
      {showCompareModal && activeChallenge && (
        <CandidateCompareModal
          submissionIds={selectedSubIds}
          challengeTitle={activeChallenge.title}
          onClose={() => setShowCompareModal(false)}
          onInspect={(id) => {
            setShowCompareModal(false);
            setDrawerSubmissionId(id);
          }}
        />
      )}

      {/* Rubric Recalibration Modal */}
      {showRecalibrateModal && activeChallenge && (
        <RubricRecalibratorModal
          challenge={activeChallenge}
          onClose={() => setShowRecalibrateModal(false)}
        />
      )}

      {/* Hiring Packet Modal */}
      {hiringPacketSub && activeChallenge && (
        <HiringPacketModal
          submission={hiringPacketSub}
          challenge={activeChallenge}
          onClose={() => setHiringPacketSub(null)}
        />
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && <CreateChallengeModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
