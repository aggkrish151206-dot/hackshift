import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Unlock, ExternalLink, Github, ChevronDown, ChevronUp } from 'lucide-react';

interface EvaluationDrawerProps {
  submissionId: string;
  onClose: () => void;
}

export const EvaluationDrawer: React.FC<EvaluationDrawerProps> = ({ submissionId, onClose }) => {
  const {
    getSubmissionById,
    getChallengeById,
    getCandidateProfile,
    shortlistCandidate,
    rejectCandidate,
    revealProfile,
  } = useApp();

  const [showRawSubmission, setShowRawSubmission] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);

  const submission = getSubmissionById(submissionId);
  if (!submission) return null;

  const challenge = getChallengeById(submission.challengeId);
  const evaluation = submission.evaluation;
  const isShortlisted = submission.status === 'Shortlisted';
  const isRevealed = submission.isRevealed;

  const candidateProfile = getCandidateProfile(submission.candidateId, isRevealed);

  const handleReveal = () => {
    revealProfile(submission.id);
    setShowRevealConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-lg flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {submission.anonymousId}
              </span>
              <span className="text-xs text-slate-500 font-medium">{challenge?.title}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Submitted {new Date(submission.submittedAt).toLocaleDateString()} · Status: <span className="font-semibold text-slate-800">{submission.status}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 flex-1 text-xs text-slate-700">
          {/* Unmasked Identity Card if revealed */}
          {isRevealed && candidateProfile ? (
            <div className="p-4 rounded border border-emerald-300 bg-emerald-50/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <Unlock className="w-3.5 h-3.5" />
                <span>Identity Unlocked (Post-Shortlist)</span>
              </div>
              <div className="text-sm font-bold text-slate-900">{candidateProfile.name}</div>
              <div className="text-xs text-slate-600">{candidateProfile.email}</div>
              {candidateProfile.college && (
                <div className="text-xs text-slate-600">Background: {candidateProfile.college}</div>
              )}
              {candidateProfile.bio && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{candidateProfile.bio}</p>
              )}
              <div className="flex gap-4 pt-1 text-xs font-medium">
                {candidateProfile.githubUrl && (
                  <a
                    href={candidateProfile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-900 hover:underline inline-flex items-center gap-1"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                )}
                {candidateProfile.portfolioUrl && (
                  <a
                    href={candidateProfile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-900 hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Candidate personal identity is blinded during evaluation.
              </span>
              {isShortlisted && (
                <button
                  onClick={() => setShowRevealConfirm(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                >
                  Reveal Profile
                </button>
              )}
            </div>
          )}

          {/* AI Score Overview */}
          {evaluation ? (
            <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    AI Evaluation Score
                  </span>
                  <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
                    {evaluation.overall_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400">Confidence: </span>
                  <span className="font-mono font-medium capitalize text-slate-700">{evaluation.confidence}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{evaluation.evaluationSource || 'Gemini 3.8 Flash'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-500 border border-slate-200 rounded">
              Pending AI evaluation.
            </div>
          )}

          {/* Criteria Breakdown */}
          {evaluation && evaluation.criteria_scores && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Criteria Breakdown
              </h3>
              <div className="border border-slate-200 rounded divide-y divide-slate-200">
                {evaluation.criteria_scores.map((c, idx) => (
                  <div key={idx} className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900">
                      <span>{c.name} ({c.weight}%)</span>
                      <span className="font-mono font-bold">{c.score}/100</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.comment}</p>
                    {c.evidence_quote && (
                      <div className="font-mono text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded mt-1 truncate">
                        Evidence: "{c.evidence_quote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirement Coverage */}
          {evaluation && evaluation.requirement_coverage && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Deliverables Coverage
              </h3>
              <ul className="border border-slate-200 rounded divide-y divide-slate-100">
                {evaluation.requirement_coverage.map((req, idx) => (
                  <li key={idx} className="p-2.5 flex items-start justify-between gap-3 text-xs">
                    <span className="text-slate-800">{req.requirement}</span>
                    <span className={`font-mono text-[11px] font-semibold capitalize shrink-0 ${
                      req.status === 'met' ? 'text-emerald-700' : req.status === 'partial' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {req.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Improvements */}
          {evaluation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 text-xs">Strengths</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 text-xs">Improvements</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {evaluation.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Defense Questions & Answers */}
          {evaluation && evaluation.defense_questions && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Candidate Defense Round
              </h3>
              <div className="space-y-2">
                {evaluation.defense_questions.map((q, qIdx) => {
                  const candidateAnswer = (submission.defenseResponses || []).find(
                    (d) => d.questionIndex === qIdx
                  );
                  return (
                    <div key={qIdx} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1.5">
                      <div className="font-medium text-slate-800 text-xs">
                        <span className="font-mono text-slate-500 mr-1">Q{qIdx + 1}:</span>
                        {q}
                      </div>
                      {candidateAnswer ? (
                        <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 mt-1">
                          <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">Candidate Answer:</span>
                          {candidateAnswer.answer}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No defense answer submitted yet.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Original Submission Viewer */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => setShowRawSubmission(!showRawSubmission)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              <span>View Raw Submission Artifacts</span>
              {showRawSubmission ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawSubmission && (
              <div className="mt-2 space-y-3 p-3 rounded border border-slate-200 bg-slate-50 text-xs">
                {submission.projectUrl && (
                  <div>
                    <span className="text-slate-500">Live URL: </span>
                    <a href={submission.projectUrl} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                      {submission.projectUrl}
                    </a>
                  </div>
                )}
                {submission.repoUrl && (
                  <div>
                    <span className="text-slate-500">Repo URL: </span>
                    <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                      {submission.repoUrl}
                    </a>
                  </div>
                )}
                <div>
                  <div className="text-slate-500 mb-1">Code / Solution:</div>
                  <pre className="p-2.5 bg-white border border-slate-200 rounded font-mono text-[11px] overflow-x-auto max-h-48">
                    {submission.solutionText}
                  </pre>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Approach:</div>
                  <p className="text-slate-700 leading-relaxed">{submission.approachExplanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Status: <span className="font-semibold text-slate-800">{submission.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {submission.status !== 'Rejected' && (
              <button
                onClick={() => rejectCandidate(submission.id)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 transition-colors"
              >
                Reject
              </button>
            )}

            {!isShortlisted ? (
              <button
                onClick={() => shortlistCandidate(submission.id)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Shortlist Candidate
              </button>
            ) : !isRevealed ? (
              <button
                onClick={() => setShowRevealConfirm(true)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Reveal Profile
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700">Profile Revealed</span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showRevealConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-sm bg-white border border-slate-300 rounded-lg p-5 space-y-3 shadow-lg">
            <h3 className="font-bold text-sm text-slate-900">Reveal Candidate Identity?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This candidate was shortlisted based purely on their task performance. Unlocking reveals their name, contact details, and portfolio.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevealConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReveal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Confirm Reveal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
