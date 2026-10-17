import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Award, Copy, CheckCheck, Sparkles, ShieldCheck, Code2, AlertTriangle } from 'lucide-react';
import { Submission } from '../types';

interface CandidateCompareModalProps {
  submissionIds: string[];
  challengeTitle: string;
  onClose: () => void;
  onInspect: (submissionId: string) => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  submissionIds,
  challengeTitle,
  onClose,
  onInspect,
}) => {
  const { getSubmissionById, shortlistCandidate, updateCandidateStage, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const selectedSubs: Submission[] = submissionIds
    .map((id) => getSubmissionById(id))
    .filter((s): s is Submission => s !== undefined)
    .sort((a, b) => (b.evaluation?.overall_score || 0) - (a.evaluation?.overall_score || 0));

  if (selectedSubs.length < 2) return null;

  // Criteria list from the first submission's evaluation
  const criteriaList = selectedSubs[0]?.evaluation?.criteria_scores || [];

  const handleExportMarkdown = () => {
    let md = `# Blind Candidate Comparison Matrix\n**Challenge:** ${challengeTitle}\n**Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `| Criterion | ${selectedSubs.map((s) => `${s.anonymousId} (Score: ${s.evaluation?.overall_score || 'N/A'})`).join(' | ')} |\n`;
    md += `| :--- | ${selectedSubs.map(() => ':---:').join(' | ')} |\n`;

    criteriaList.forEach((c, idx) => {
      md += `| **${c.name}** (${c.weight}%) | ${selectedSubs
        .map((s) => `${s.evaluation?.criteria_scores[idx]?.score || 0}/100`)
        .join(' | ')} |\n`;
    });

    md += `| **Originality** | ${selectedSubs.map((s) => `${s.codeMetrics?.originalityScore || 'N/A'}%`).join(' | ')} |\n`;
    md += `| **Complexity** | ${selectedSubs.map((s) => `${s.codeMetrics?.cyclomaticComplexity || 'N/A'}`).join(' | ')} |\n`;
    md += `| **Status** | ${selectedSubs.map((s) => s.status).join(' | ')} |\n\n`;

    md += `## Approaches\n`;
    selectedSubs.forEach((s) => {
      md += `### ${s.anonymousId} (Overall: ${s.evaluation?.overall_score}/100)\n${s.approachExplanation}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    showToast('Comparison matrix copied as Markdown table!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-emerald-300 border border-white/10">
                <Sparkles className="w-3 h-3" /> Blind Head-to-Head Calibration
              </span>
              <span className="text-xs text-slate-300 font-medium">({selectedSubs.length} Candidates Selected)</span>
            </div>
            <h2 className="font-display text-base sm:text-lg font-bold text-white mt-1">
              {challengeTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side objective calibration matrix. Identities remain blinded until post-shortlist unmask.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Copy comparison as markdown table"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Export Table'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Comparison Grid */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 text-xs text-slate-700 divide-y divide-slate-100">
          {/* Top Candidate Cards Header */}
          <div className={`grid gap-4 ${selectedSubs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {selectedSubs.map((sub, rank) => {
              const score = sub.evaluation?.overall_score || 0;
              const isLead = rank === 0;
              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isLead
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900">
                      {sub.anonymousId}
                    </span>
                    {isLead && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3 text-emerald-700" /> Leader
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Rubric Score</span>
                      <div className="font-mono text-2xl font-bold text-slate-900">
                        {score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Stage</span>
                      <span className="font-medium text-slate-800 text-xs">{sub.status}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onInspect(sub.id)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
                    >
                      Inspect Drawer
                    </button>
                    {sub.status !== 'Shortlisted' ? (
                      <button
                        onClick={() => shortlistCandidate(sub.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                      >
                        Shortlist
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Shortlisted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 1: Detailed Rubric Score Breakdown Comparison */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>Criteria-by-Criteria Performance Delta</span>
                <span className="text-[11px] font-normal text-slate-500 lowercase">(green denotes criterion winner)</span>
              </h3>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className={`grid bg-slate-100/80 border-b border-slate-200 p-2.5 font-semibold text-slate-700 text-xs ${
                selectedSubs.length === 2 ? 'grid-cols-5' : 'grid-cols-7'
              }`}>
                <div className="col-span-2">Rubric Dimension</div>
                {selectedSubs.map((sub) => (
                  <div key={sub.id} className="text-center font-mono font-bold">
                    {sub.anonymousId}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {criteriaList.map((crit, cIdx) => {
                  const scores = selectedSubs.map((s) => s.evaluation?.criteria_scores[cIdx]?.score || 0);
                  const maxScore = Math.max(...scores);

                  return (
                    <div
                      key={cIdx}
                      className={`grid p-3 items-center hover:bg-slate-50/50 ${
                        selectedSubs.length === 2 ? 'grid-cols-5' : 'grid-cols-7'
                      }`}
                    >
                      <div className="col-span-2 pr-4">
                        <div className="font-medium text-slate-900">{crit.name}</div>
                        <div className="text-[11px] text-slate-400">Weight: {crit.weight}%</div>
                      </div>

                      {selectedSubs.map((sub, sIdx) => {
                        const critScore = sub.evaluation?.criteria_scores[cIdx]?.score || 0;
                        const isWinner = critScore === maxScore && critScore > 0;
                        return (
                          <div key={sub.id} className="text-center px-2">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded inline-block ${
                                isWinner
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'text-slate-700'
                              }`}
                            >
                              {critScore}/100
                            </span>
                            <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isWinner ? 'bg-emerald-600' : 'bg-slate-400'}`}
                                style={{ width: `${critScore}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Code Quality & Complexity Telemetry */}
          <div className="pt-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Static Telemetry & Code Quality Metrics</span>
            </h3>

            <div className={`grid gap-4 ${selectedSubs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {selectedSubs.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-mono font-bold text-slate-800 text-xs border-b border-slate-200 pb-1 flex justify-between">
                    <span>{sub.anonymousId}</span>
                    <span className="text-[11px] text-slate-400 font-normal">Static Telemetry</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Cyclomatic Risk</span>
                      <div className="font-mono font-semibold text-slate-800">
                        {sub.codeMetrics?.cyclomaticComplexity || 'A (Low Risk)'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Originality Score</span>
                      <div className="font-mono font-semibold text-slate-800">
                        {sub.codeMetrics?.originalityScore || 95}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Test Coverage</span>
                      <div className="font-mono font-semibold text-slate-800">
                        {sub.codeMetrics?.testCoverage || '90%'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Lines of Code</span>
                      <div className="font-mono font-semibold text-slate-800">
                        {sub.codeMetrics?.linesOfCode || sub.solutionText.split('\n').length} loc
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Technical Approach & Architectural Decision Diff */}
          <div className="pt-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Architectural Approach & Trade-offs
            </h3>

            <div className={`grid gap-4 ${selectedSubs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {selectedSubs.map((sub) => (
                <div key={sub.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 block mb-1">
                      {sub.anonymousId} Strategy
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                      {sub.approachExplanation}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Core Code Excerpt</span>
                    <pre className="p-2.5 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto max-h-40 leading-snug">
                      {sub.solutionText.slice(0, 350)}...
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Technical Defense Cross-Examination */}
          <div className="pt-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Technical Defense Round Answers</span>
            </h3>

            <div className={`grid gap-4 ${selectedSubs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {selectedSubs.map((sub) => {
                const defenseList = sub.defenseResponses || [];
                return (
                  <div key={sub.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                    <div className="font-mono font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                      {sub.anonymousId} Defense Logs
                    </div>
                    {defenseList.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No defense responses submitted yet.</div>
                    ) : (
                      defenseList.map((d, dIdx) => (
                        <div key={dIdx} className="space-y-1">
                          <div className="text-[11px] font-semibold text-slate-800">
                            Q{dIdx + 1}: {d.question}
                          </div>
                          <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                            "{d.answer}"
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Top performer:{' '}
            <strong className="text-slate-900 font-mono">{selectedSubs[0].anonymousId}</strong> (Score:{' '}
            {selectedSubs[0].evaluation?.overall_score}/100)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
            >
              Copy Decision Table
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Done Comparing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
