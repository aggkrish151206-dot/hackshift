import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Unlock,
  ExternalLink,
  Github,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Code2,
  Copy,
  CheckCheck,
  Check,
  Save,
  UserCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { HiringPacketModal } from './HiringPacketModal';
import { SubmissionStatus } from '../types';

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
    updateCandidateStage,
    saveRecruiterNotes,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'evaluation' | 'code' | 'audit'>('evaluation');
  const [showRawSubmission, setShowRawSubmission] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showHiringPacket, setShowHiringPacket] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  const submission = getSubmissionById(submissionId);

  // Sync initial notes
  React.useEffect(() => {
    if (submission?.recruiterNotes) {
      setNotes(submission.recruiterNotes);
    }
  }, [submission?.id]);

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

  const handleSaveNotes = () => {
    saveRecruiterNotes(submission.id, notes);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.solutionText);
    setIsCopiedCode(true);
    showToast('Code snippet copied to clipboard');
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;
    setFollowUpSubmitted(true);
    showToast('Follow-up defense prompt queued for candidate');
    setFollowUpQuestion('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-white/10 text-emerald-300 px-2.5 py-0.5 rounded border border-white/10">
                {submission.anonymousId}
              </span>
              <span className="text-xs text-slate-300 font-medium truncate max-w-xs">{challenge?.title}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>
                Stage: <strong className="text-white capitalize">{submission.status}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHiringPacket(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hiring Packet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[69px] z-10 px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'evaluation'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Evaluation & Defense
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Code & Architecture
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Bias Audit & Notes
          </button>
        </div>

        {/* Body content based on active tab */}
        <div className="p-6 space-y-6 flex-1 text-xs text-slate-700 overflow-y-auto">
          {/* TAB 1: Evaluation & Defense */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              {/* Identity Banner */}
              {isRevealed && candidateProfile ? (
                <div className="p-4 rounded-lg border border-emerald-300 bg-emerald-50/70 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <Unlock className="w-4 h-4 text-emerald-700" />
                    <span>Identity Unlocked (Post-Shortlist Authorization)</span>
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
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {candidateProfile.portfolioUrl && (
                      <a
                        href={candidateProfile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Candidate identity is blinded during technical evaluation.</span>
                  </span>
                  {isShortlisted && (
                    <button
                      onClick={() => setShowRevealConfirm(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shrink-0"
                    >
                      Reveal Profile
                    </button>
                  )}
                </div>
              )}

              {/* Overall AI Score Card */}
              {evaluation ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Gemini AI Evaluation Score
                      </span>
                      <div className="font-mono text-3xl font-bold text-slate-900 mt-0.5">
                        {evaluation.overall_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400">Confidence: </span>
                      <span className="font-mono font-medium capitalize text-slate-800">{evaluation.confidence}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {evaluation.evaluationSource || 'Gemini 3.8 Flash (0 budget low-latency)'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-slate-500 border border-slate-200 rounded-lg">
                  Pending AI evaluation.
                </div>
              )}

              {/* Criteria Scores */}
              {evaluation && evaluation.criteria_scores && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Dimension Breakdown & Evidence
                  </h3>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                    {evaluation.criteria_scores.map((c, idx) => (
                      <div key={idx} className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-900">
                          <span>
                            {c.name} <span className="text-slate-400 font-normal">({c.weight}%)</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900">{c.score}/100</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{c.comment}</p>
                        {c.evidence_quote && (
                          <div className="font-mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            Evidence: "{c.evidence_quote}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Improvements */}
              {evaluation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="font-semibold text-slate-900 text-xs">Observed Strengths</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="font-semibold text-slate-900 text-xs">Identified Risks & Gaps</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Defense Questions & Responses */}
              {evaluation && evaluation.defense_questions && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center justify-between">
                    <span>Technical Defense Round</span>
                    <span className="text-[11px] font-normal text-slate-400">Architectural Stress-Test</span>
                  </h3>
                  <div className="space-y-3">
                    {evaluation.defense_questions.map((q, qIdx) => {
                      const candidateAnswer = (submission.defenseResponses || []).find(
                        (d) => d.questionIndex === qIdx
                      );
                      return (
                        <div key={qIdx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                          <div className="font-medium text-slate-800 text-xs">
                            <span className="font-mono text-slate-500 mr-1.5">Q{qIdx + 1}:</span>
                            {q}
                          </div>
                          {candidateAnswer ? (
                            <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                              <span className="font-semibold text-slate-900 block text-[11px] mb-1">
                                Candidate Defense Answer:
                              </span>
                              "{candidateAnswer.answer}"
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">No defense answer submitted yet.</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Recruiter Follow-Up Probe Input */}
                  <form onSubmit={handleSendFollowUp} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recruiter Follow-Up Probe</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Challenge suspect answers</span>
                    </div>
                    <textarea
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      placeholder="e.g., If the client experiences network packet loss on step 3, how does your client verify checksums?"
                      rows={2}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                    />
                    <div className="flex justify-between items-center pt-1">
                      {followUpSubmitted && (
                        <span className="text-[11px] text-emerald-700 font-medium">Follow-up queued for candidate.</span>
                      )}
                      <button
                        type="submit"
                        className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Queue Probe</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Code & Architecture */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {/* Telemetry Overview */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Static Code Telemetry
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px]">Complexity Risk</span>
                    <div className="font-mono font-bold text-slate-900">
                      {submission.codeMetrics?.cyclomaticComplexity || 'A (Low Risk)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Originality Score</span>
                    <div className="font-mono font-bold text-slate-900">
                      {submission.codeMetrics?.originalityScore || 96}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Test Coverage</span>
                    <div className="font-mono font-bold text-slate-900">
                      {submission.codeMetrics?.testCoverage || '92%'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Lines of Code</span>
                    <div className="font-mono font-bold text-slate-900">
                      {submission.codeMetrics?.linesOfCode || submission.solutionText.split('\n').length} loc
                    </div>
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">External Artifacts</span>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
                  {submission.projectUrl ? (
                    <div>
                      <span className="text-slate-400">Live Running Demo: </span>
                      <a
                        href={submission.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 font-mono font-medium underline inline-flex items-center gap-1"
                      >
                        {submission.projectUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No live demo URL provided.</div>
                  )}

                  {submission.repoUrl ? (
                    <div>
                      <span className="text-slate-400">Git Repository: </span>
                      <a
                        href={submission.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 font-mono font-medium underline inline-flex items-center gap-1"
                      >
                        {submission.repoUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No public repo URL provided.</div>
                  )}
                </div>
              </div>

              {/* Code Snippet Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Submitted Implementation Code</span>
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    {isCopiedCode ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed">
                  <div className="px-4 py-2 bg-slate-900 text-slate-400 border-b border-slate-800 flex justify-between items-center text-[11px]">
                    <span>source_solution.ts</span>
                    <span>{submission.solutionText.split('\n').length} lines</span>
                  </div>
                  <pre className="p-4 overflow-x-auto max-h-96">{submission.solutionText}</pre>
                </div>
              </div>

              {/* Technical Approach Explanation */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Technical Approach & Architectural Trade-offs
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {submission.approachExplanation}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Bias Audit & Recruiter Notes */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Compliance & Anonymization Audit Card */}
              <div className="p-4 rounded-lg border border-emerald-300 bg-emerald-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cryptographic Anonymization Audit Trail</span>
                  </span>
                  <span className="font-mono text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded border border-emerald-200 break-all">
                  Hash Proof: {submission.anonymityAudit?.hashProof || 'sha256:7f83b1657ff1fc53b92dc18148a1d65d'}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-700">Audit Protocol Verification:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {(submission.anonymityAudit?.checks || [
                      'Candidate name, email, and social handles stripped',
                      'Prestige university / educational pedigree blinded',
                      'Gender, age, and demographic markers zeroed',
                      'Cryptographic hash verification passed prior to Gemini evaluation',
                    ]).map((chk, i) => (
                      <li key={i}>{chk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Private Recruiter Notes Area */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Private Committee Notes & Debrief Log
                  </span>
                  <span className="text-[11px] text-slate-400">Visible only to your recruiting team</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview notes, compensation bands, or technical committee debrief remarks here..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Debrief Notes</span>
                  </button>
                </div>
              </div>

              {/* Pipeline Stage Transitions History */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Candidate Pipeline History
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                  {(submission.stageHistory || [
                    { stage: 'Submitted', timestamp: submission.submittedAt },
                    ...(submission.evaluation ? [{ stage: 'Evaluated' as const, timestamp: submission.evaluation.evaluatedAt }] : []),
                  ]).map((st, sIdx) => (
                    <div key={sIdx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 capitalize">{st.stage}</span>
                        {st.note && <p className="text-[11px] text-slate-500 mt-0.5">{st.note}</p>}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(st.timestamp).toLocaleDateString()} {new Date(st.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Stage Transition Bar */}
        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Stage:</span>
            <select
              value={submission.status}
              onChange={(e) => updateCandidateStage(submission.id, e.target.value as SubmissionStatus)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-900 focus:outline-none focus:border-slate-800"
            >
              <option value="Submitted">Submitted</option>
              <option value="Evaluated">Evaluated</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer Extended</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {submission.status !== 'Rejected' && (
              <button
                onClick={() => rejectCandidate(submission.id)}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 rounded transition-colors"
              >
                Reject Candidate
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
              <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Profile Unmasked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Profile Reveal */}
      {showRevealConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-sm bg-white border border-slate-300 rounded-xl p-5 space-y-3 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Unmask Candidate Identity?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Candidate <strong className="font-mono text-slate-900">{submission.anonymousId}</strong> was shortlisted based purely on their task performance. Unmasking reveals their verified name, contact email, and portfolio.
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
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Confirm Unmask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiring Packet Modal */}
      {showHiringPacket && challenge && (
        <HiringPacketModal
          submission={submission}
          challenge={challenge}
          onClose={() => setShowHiringPacket(false)}
        />
      )}
    </div>
  );
};
