export type UserRole = 'founder' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatar: string;
  company?: string;
  companyRole?: string;
  college?: string;
  bio?: string;
  githubUrl?: string;
  githubId?: string | number;
  githubUsername?: string;
  isOnboarded?: boolean;
  portfolioUrl?: string;
  skills: string[];
}

export interface AuthSession {
  userId: string;
  token: string;
  loginAt: string;
}


export type ChallengeTrack = 'Full-stack Web' | 'AI Engineering' | 'Product Growth';
export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CriterionWeight {
  id: string;
  name: string;
  weight: number; // e.g. 30
  description?: string;
}

export interface Challenge {
  id: string;
  founderId: string;
  startupName: string;
  startupLogo: string;
  title: string;
  roleCategory: ChallengeTrack;
  difficulty: ChallengeDifficulty;
  deadline: string;
  bountyAmount?: number; // Proposed reward in USD
  description: string;
  deliverables: string[];
  requiredSkills: string[];
  rubric: CriterionWeight[];
  createdAt: string;
}

export interface CriterionScore {
  criterion_id?: string;
  name: string;
  weight: number;
  score: number; // 0-100
  comment: string;
  evidence_quote?: string;
}

export interface RequirementCoverageItem {
  requirement: string;
  status: 'met' | 'partial' | 'missed';
  notes?: string;
}

export interface EvaluationResult {
  overall_score: number;
  criteria_scores: CriterionScore[];
  evidence: string[];
  strengths: string[];
  improvements: string[];
  requirement_coverage: RequirementCoverageItem[];
  defense_questions: string[];
  confidence: 'low' | 'medium' | 'high';
  limitations: string;
  evaluatedAt: string;
  evaluationSource?: string;
  isDemoFallback?: boolean;
}

export type SubmissionStatus = 'Submitted' | 'Evaluated' | 'Shortlisted' | 'Rejected';

export interface DefenseResponse {
  questionIndex: number;
  question: string;
  answer: string;
  answeredAt: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  candidateId: string;
  anonymousId: string; // e.g. "BP-1042"
  submittedAt: string;
  solutionText: string;
  projectUrl?: string;
  repoUrl?: string;
  approachExplanation: string;
  status: SubmissionStatus;
  isRevealed: boolean;
  revealedAt?: string;
  evaluation?: EvaluationResult;
  defenseResponses?: DefenseResponse[];
}
