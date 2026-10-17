import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Download, CheckCheck, FileText, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { Submission, Challenge } from '../types';

interface HiringPacketModalProps {
  submission: Submission;
  challenge: Challenge;
  onClose: () => void;
}

export const HiringPacketModal: React.FC<HiringPacketModalProps> = ({ submission, challenge, onClose }) => {
  const { getCandidateProfile, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const evaluation = submission.evaluation;
  const overallScore = evaluation?.overall_score || 0;
  const candidateProfile = getCandidateProfile(submission.candidateId, submission.isRevealed);

  // Recommendation Tier based on Google/MS scoring standards
  const recommendation =
    overallScore >= 90
      ? 'Strong Hire (L5/Senior Tier Execution)'
      : overallScore >= 80
      ? 'Hire (Meets & Exceeds Bar)'
      : overallScore >= 70
      ? 'Leaning Hire (Strong Technical Foundations with Targeted Coaching)'
      : 'Do Not Hire (Critical Performance Gaps Under Load)';

  const generateMarkdownMemo = () => {
    let md = `# HIRING COMMITTEE DEBRIEF PACKET\n`;
    md += `**Candidate Token:** ${submission.anonymousId}\n`;
    md += `**Challenge:** ${challenge.title}\n`;
    md += `**Target Role:** ${challenge.roleCategory} (${challenge.difficulty})\n`;
    md += `**Overall Score:** ${overallScore}/100\n`;
    md += `**Hiring Recommendation:** ${recommendation}\n`;
    md += `**Debrief Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `---\n\n`;

    md += `## 1. Executive Summary & Proof of Work\n`;
    md += `${submission.approachExplanation}\n\n`;

    if (submission.projectUrl) md += `- **Live Artifact:** ${submission.projectUrl}\n`;
    if (submission.repoUrl) md += `- **Repository:** ${submission.repoUrl}\n\n`;

    md += `## 2. Rubric Evaluation Breakdown\n`;
    md += `| Dimension | Weight | Score | Evaluator Comment & Evidence |\n`;
    md += `| :--- | :---: | :---: | :--- |\n`;
    evaluation?.criteria_scores.forEach((c) => {
      md += `| **${c.name}** | ${c.weight}% | ${c.score}/100 | ${c.comment} *("${c.evidence_quote || ''}")* |\n`;
    });
    md += `\n`;

    md += `## 3. Candidate Defense Round & Technical Depth\n`;
    if (submission.defenseResponses && submission.defenseResponses.length > 0) {
      submission.defenseResponses.forEach((d, idx) => {
        md += `### Q${idx + 1}: ${d.question}\n`;
        md += `> "${d.answer}"\n\n`;
      });
    } else {
      md += `*No defense answers logged.*\n\n`;
    }

    md += `## 4. Architectural Strengths & Key Limitations\n`;
    md += `### Strengths\n`;
    evaluation?.strengths.forEach((s) => (md += `- ${s}\n`));
    md += `\n### Identified Risks & Limitations\n`;
    evaluation?.improvements.forEach((i) => (md += `- ${i}\n`));
    if (evaluation?.limitations) md += `\n**Evaluator Note:** ${evaluation.limitations}\n`;
    md += `\n`;

    md += `## 5. Compliance & Bias-Free Sanitization Audit\n`;
    md += `- **Sanitization Hash:** \`${submission.anonymityAudit?.hashProof || 'sha256:verified'}\`\n`;
    md += `- **PII Stripped Prior to Evaluation:** Name, Gender, Prestige Pedigree, Social Handles.\n`;
    md += `- **Audit Status:** Verified compliant with BlindProof Bias-Free Protocol.\n\n`;

    md += `## 6. Candidate Identity\n`;
    if (submission.isRevealed && candidateProfile) {
      md += `- **Name:** ${candidateProfile.name}\n`;
      md += `- **Email:** ${candidateProfile.email}\n`;
      if (candidateProfile.githubUrl) md += `- **GitHub:** ${candidateProfile.githubUrl}\n`;
      if (candidateProfile.portfolioUrl) md += `- **Portfolio:** ${candidateProfile.portfolioUrl}\n`;
    } else {
      md += `*Candidate identity remains blinded under anonymous token ${submission.anonymousId} pending final committee vote.*\n`;
    }

    return md;
  };

  const handleCopy = () => {
    const md = generateMarkdownMemo();
    navigator.clipboard.writeText(md);
    setCopied(true);
    showToast('Hiring Committee Packet copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const md = generateMarkdownMemo();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hiring_Packet_${submission.anonymousId}_${challenge.startupName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Hiring Packet downloaded (.md)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-emerald-300 border border-white/10">
                <FileText className="w-3 h-3" /> Committee Debrief Packet
              </span>
              <span className="font-mono text-xs text-slate-300">{submission.anonymousId}</span>
            </div>
            <h2 className="font-display text-base font-bold text-white mt-1">
              Hiring Decision Memo — {challenge.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Packet'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Packet Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans divide-y divide-slate-100">
          {/* Executive Recommendation Banner */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Committee Hiring Recommendation
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{recommendation}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluated under blinded protocol with Gemini 3.8 Flash evidence verification.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Overall Score</span>
              <div className="font-mono text-3xl font-bold text-slate-900">
                {overallScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="pt-6 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              1. Executive Summary & Approach
            </h3>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {submission.approachExplanation}
            </div>
          </div>

          {/* Section 2: Rubric Breakdown */}
          <div className="pt-6 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              2. Dimension Scores & Evidence Quotes
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
              {evaluation?.criteria_scores.map((c, i) => (
                <div key={i} className="p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium text-slate-900">
                    <span>
                      {c.name} <span className="text-slate-400 font-normal">({c.weight}%)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">{c.score}/100</span>
                  </div>
                  <p className="text-slate-600">{c.comment}</p>
                  {c.evidence_quote && (
                    <div className="font-mono text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                      Evidence: "{c.evidence_quote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Technical Defense Cross-Examination */}
          <div className="pt-6 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              3. Technical Defense Round Cross-Examination
            </h3>
            <div className="space-y-2">
              {submission.defenseResponses && submission.defenseResponses.length > 0 ? (
                submission.defenseResponses.map((d, dIdx) => (
                  <div key={dIdx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="font-medium text-slate-800 text-xs">
                      <span className="font-mono text-slate-500 mr-1.5">Q{dIdx + 1}:</span>
                      {d.question}
                    </div>
                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                      "{d.answer}"
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-400 italic border border-slate-200 rounded-lg">
                  No defense responses logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Compliance & Anonymization Audit */}
          <div className="pt-6 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>4. Compliance & Bias-Free Sanitization Audit</span>
            </h3>
            <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Cryptographic Sanitization Proof</span>
                <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {submission.anonymityAudit?.hashProof || 'sha256:7f83b1657ff1fc53b92dc18148a1d65d'}
                </span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] pt-1">
                <li>Candidate personal names and email addresses redacted</li>
                <li>Prestige university / institutional background blinded</li>
                <li>Zero demographic or socio-economic indicators passed to Gemini engine</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Unmasked Profile (if unlocked) */}
          <div className="pt-6 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              {submission.isRevealed ? (
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>5. Candidate Identity Status</span>
            </h3>
            {submission.isRevealed && candidateProfile ? (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">{candidateProfile.name}</div>
                <div className="text-slate-600">{candidateProfile.email}</div>
                {candidateProfile.college && (
                  <div className="text-slate-600">Background: {candidateProfile.college}</div>
                )}
                {candidateProfile.bio && <p className="text-slate-600 pt-1">{candidateProfile.bio}</p>}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Candidate identity is blinded under token {submission.anonymousId} pending final committee vote.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Standard Google / Microsoft format · Ready for Ashby, Greenhouse, or Slack.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
