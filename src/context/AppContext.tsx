import React, { createContext, useContext, useState, useEffect } from 'react';
import { Challenge, Submission, User, UserRole, EvaluationResult, DefenseResponse, AuthSession } from '../types';
import { SEED_CHALLENGES, SEED_SUBMISSIONS, SEED_USERS } from '../data/seedData';

const STORE_KEY = 'blindproof_store_v2';
const SESSION_KEY = 'blindproof_session_v2';
const ROLE_KEY = 'blindproof_selected_role';

export type AppView = 'welcome' | 'login' | 'onboarding' | 'catalog' | 'challenge-detail' | 'founder-dashboard' | 'candidate-dashboard' | 'settings';

export interface GitHubAuthPayload {
  githubId: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  githubUrl?: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  users: User[];
  challenges: Challenge[];
  submissions: Submission[];
  currentView: AppView;
  selectedChallengeId: string | null;
  selectedSubmissionId: string | null;
  isEvaluating: boolean;
  evaluationError: string | null;

  // Navigation & Role Selection
  navigateTo: (view: AppView, challengeId?: string, submissionId?: string) => void;
  selectRole: (role: UserRole) => void;

  // Real Authentication & Session methods
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGitHub: (payload: GitHubAuthPayload) => Promise<{ success: boolean; isNewUser: boolean; error?: string }>;
  completeApplicantOnboarding: (data: { skills: string[]; bio?: string; portfolioUrl?: string }) => void;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (email: string, role: UserRole) => void;

  // Challenge & Submission Actions
  createChallenge: (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'founderId'>) => Challenge;
  submitSolution: (challengeId: string, data: { solutionText: string; projectUrl?: string; repoUrl?: string; approachExplanation: string }, autoEvaluate?: boolean) => Promise<Submission>;
  evaluateSubmission: (submissionId: string, forceDemo?: boolean) => Promise<{ success: boolean; error?: string; isDemoFallback?: boolean }>;
  shortlistCandidate: (submissionId: string) => void;
  rejectCandidate: (submissionId: string) => void;
  revealProfile: (submissionId: string) => void;
  answerDefenseQuestion: (submissionId: string, questionIndex: number, answer: string) => void;
  resetDemoData: () => void;
  getChallengeById: (id: string) => Challenge | undefined;
  getSubmissionById: (id: string) => Submission | undefined;
  getCandidateProfile: (candidateId: string, isRevealed: boolean) => Partial<User> | null;
}

const AppContext = createContext<AppContextType | null>(null);

// SHA-256 Salted Hash helper (Native Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password + ':blindproof_secure_salt_v1');
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from storage
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORE_KEY}_users`);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  // Role selection state (persisted across launches even before login)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_KEY);
      if (savedRole === 'founder' || savedRole === 'candidate') {
        return savedRole;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Session state: restore if valid, else null
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });

  // Current authenticated user derived from session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedSessionStr = localStorage.getItem(SESSION_KEY);
      if (!savedSessionStr) return null;
      const parsedSession: AuthSession = JSON.parse(savedSessionStr);
      const savedUsersStr = localStorage.getItem(`${STORE_KEY}_users`);
      const allUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : SEED_USERS;
      return allUsers.find((u) => u.id === parsedSession.userId) || null;
    } catch {
      return null;
    }
  });

  // Initial view determination:
  // 1. If returning user has valid session -> go directly to their dashboard.
  // 2. If user already selected a role previously but hasn't logged in -> show login page.
  // 3. If new user opening app for first time -> show 'welcome' role selection screen.
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const savedSessionStr = localStorage.getItem(SESSION_KEY);
      if (savedSessionStr) {
        const parsedSession: AuthSession = JSON.parse(savedSessionStr);
        const savedUsersStr = localStorage.getItem(`${STORE_KEY}_users`);
        const allUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : SEED_USERS;
        const u = allUsers.find((user) => user.id === parsedSession.userId);
        if (u) {
          return u.role === 'founder' ? 'founder-dashboard' : 'candidate-dashboard';
        }
      }

      const savedRole = localStorage.getItem(ROLE_KEY);
      if (savedRole) {
        return 'login';
      }

      return 'welcome';
    } catch {
      return 'welcome';
    }
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORE_KEY}_challenges`);
      return saved ? JSON.parse(saved) : SEED_CHALLENGES;
    } catch {
      return SEED_CHALLENGES;
    }
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORE_KEY}_submissions`);
      return saved ? JSON.parse(saved) : SEED_SUBMISSIONS;
    } catch {
      return SEED_SUBMISSIONS;
    }
  });

  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORE_KEY}_challenges`, JSON.stringify(challenges));
      localStorage.setItem(`${STORE_KEY}_submissions`, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [users, challenges, submissions]);

  // Role Selection method from Welcome Screen
  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch (e) {
      console.warn('Failed to save selected role:', e);
    }
    setCurrentView('login');
  };

  // Protected Navigation Engine
  const navigateTo = (view: AppView, challengeId?: string, submissionId?: string) => {
    // If user is not authenticated and wants to access a protected screen, redirect
    if (!currentUser) {
      if (view === 'welcome' || view === 'login') {
        setCurrentView(view);
      } else {
        setCurrentView(selectedRole ? 'login' : 'welcome');
      }
      return;
    }

    // Role-based route protection: prevent candidates from opening founder dashboard and vice-versa
    if (view === 'founder-dashboard' && currentUser.role !== 'founder') {
      setCurrentView('candidate-dashboard');
      return;
    }
    if (view === 'candidate-dashboard' && currentUser.role !== 'candidate') {
      setCurrentView('founder-dashboard');
      return;
    }

    setCurrentView(view);
    if (challengeId !== undefined) setSelectedChallengeId(challengeId);
    if (submissionId !== undefined) setSelectedSubmissionId(submissionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sign Up
  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const hashed = await hashPassword(password);
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      passwordHash: hashed,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      company: role === 'founder' ? 'Innovate Startup' : undefined,
      college: role === 'candidate' ? 'Self-Taught Builder' : undefined,
      skills: role === 'candidate' ? ['TypeScript', 'React', 'Problem Solving'] : ['Product', 'Engineering'],
    };

    const newSession: AuthSession = {
      userId: newUser.id,
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginAt: new Date().toISOString(),
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    setSession(newSession);
    setCurrentUser(newUser);
    setSelectedRole(role);

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(ROLE_KEY, role);
      localStorage.setItem(`${STORE_KEY}_users`, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Session store failed:', e);
    }

    // Redirect directly to dashboard based on role
    setCurrentView(role === 'founder' ? 'founder-dashboard' : 'candidate-dashboard');
    return { success: true };
  };

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const hashedInput = await hashPassword(password);
    const isValid = user.passwordHash ? user.passwordHash === hashedInput : password === 'password123';

    if (!isValid) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    const newSession: AuthSession = {
      userId: user.id,
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginAt: new Date().toISOString(),
    };

    setSession(newSession);
    setCurrentUser(user);
    setSelectedRole(user.role);

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(ROLE_KEY, user.role);
    } catch (e) {
      console.warn('Session store failed:', e);
    }

    // Redirect directly to the appropriate dashboard
    setCurrentView(user.role === 'founder' ? 'founder-dashboard' : 'candidate-dashboard');
    return { success: true };
  };

  // Logout
  const logout = () => {
    setSession(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn('Error clearing session:', e);
    }
    // Return to login with previous role remembered
    setCurrentView('login');
  };

  // Demo Login (Instant access for judges/evaluators)
  const demoLogin = (email: string, role: UserRole) => {
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    }

    const newSession: AuthSession = {
      userId: user.id,
      token: `sess_demo_${Date.now()}`,
      loginAt: new Date().toISOString(),
    };

    setSession(newSession);
    setCurrentUser(user);
    setSelectedRole(user.role);

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(ROLE_KEY, user.role);
    } catch (e) {
      console.warn('Session save failed:', e);
    }

    setCurrentView(user.role === 'founder' ? 'founder-dashboard' : 'candidate-dashboard');
  };

  // GitHub OAuth Login for Applicants
  const loginWithGitHub = async (payload: GitHubAuthPayload): Promise<{ success: boolean; isNewUser: boolean; error?: string }> => {
    try {
      // Find matching existing user
      let user = users.find((u) =>
        (u.githubId && String(u.githubId) === String(payload.githubId)) ||
        (u.githubUsername && payload.username && u.githubUsername.toLowerCase() === payload.username.toLowerCase()) ||
        (payload.email && u.email && u.email.toLowerCase() === payload.email.toLowerCase())
      );

      const isNewUser = !user || user.isOnboarded === false;

      if (user) {
        user = {
          ...user,
          name: payload.name || user.name,
          avatar: payload.avatar || user.avatar,
          githubId: payload.githubId || user.githubId,
          githubUsername: payload.username || user.githubUsername,
          githubUrl: payload.githubUrl || user.githubUrl,
          bio: user.bio || payload.bio,
        };
        const updatedUsers = users.map((u) => (u.id === user!.id ? user! : u));
        setUsers(updatedUsers);
        try {
          localStorage.setItem(`${STORE_KEY}_users`, JSON.stringify(updatedUsers));
        } catch (e) {
          console.warn('User sync failed:', e);
        }
      } else {
        user = {
          id: `user_gh_${payload.githubId || Date.now()}`,
          name: payload.name || payload.username || 'Applicant',
          email: payload.email,
          role: 'candidate',
          avatar: payload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          githubId: payload.githubId,
          githubUsername: payload.username,
          githubUrl: payload.githubUrl || `https://github.com/${payload.username}`,
          bio: payload.bio || 'Applicant & Software Developer',
          college: 'Self-Taught / Developer',
          skills: ['Full-stack Web', 'TypeScript', 'React'],
          isOnboarded: false,
        };
        const updatedUsers = [user, ...users];
        setUsers(updatedUsers);
        try {
          localStorage.setItem(`${STORE_KEY}_users`, JSON.stringify(updatedUsers));
        } catch (e) {
          console.warn('User sync failed:', e);
        }
      }

      const newSession: AuthSession = {
        userId: user.id,
        token: `sess_gh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        loginAt: new Date().toISOString(),
      };

      setSession(newSession);
      setCurrentUser(user);
      setSelectedRole('candidate');

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        localStorage.setItem(ROLE_KEY, 'candidate');
      } catch (e) {
        console.warn('Session store failed:', e);
      }

      // If user hasn't completed onboarding, navigate to onboarding view; otherwise candidate dashboard
      if (user.isOnboarded === false) {
        setCurrentView('onboarding');
      } else {
        setCurrentView('candidate-dashboard');
      }

      return { success: true, isNewUser };
    } catch (err: any) {
      console.error('Error in loginWithGitHub:', err);
      return { success: false, isNewUser: false, error: err.message || 'GitHub login failed' };
    }
  };

  // Complete onboarding for new applicant
  const completeApplicantOnboarding = (data: { skills: string[]; bio?: string; portfolioUrl?: string }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      skills: data.skills && data.skills.length > 0 ? data.skills : currentUser.skills,
      bio: data.bio !== undefined ? data.bio : currentUser.bio,
      portfolioUrl: data.portfolioUrl || currentUser.portfolioUrl,
      isOnboarded: true,
    };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    try {
      localStorage.setItem(`${STORE_KEY}_users`, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Save failed:', e);
    }
    setCurrentView('candidate-dashboard');
  };

  // Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'No account exists with this email address.' };
    }
    return { success: true };
  };

  const createChallenge = (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'founderId'>): Challenge => {
    if (!currentUser) throw new Error('Authentication required');
    const newChallenge: Challenge = {
      ...challengeData,
      id: `chal_${Date.now()}`,
      founderId: currentUser.id,
      startupName: currentUser.company || 'Innovate Studio',
      startupLogo: '✦',
      createdAt: new Date().toISOString(),
    };
    setChallenges((prev) => [newChallenge, ...prev]);
    return newChallenge;
  };

  const generateAnonymousId = (): string => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `BP-${rand}`;
  };

  const submitSolution = async (
    challengeId: string,
    data: { solutionText: string; projectUrl?: string; repoUrl?: string; approachExplanation: string },
    autoEvaluate: boolean = true
  ): Promise<Submission> => {
    if (!currentUser) throw new Error('Authentication required');
    const newSubmission: Submission = {
      id: `sub_${Date.now()}`,
      challengeId,
      candidateId: currentUser.id,
      anonymousId: generateAnonymousId(),
      submittedAt: new Date().toISOString(),
      solutionText: data.solutionText,
      projectUrl: data.projectUrl,
      repoUrl: data.repoUrl,
      approachExplanation: data.approachExplanation,
      status: 'Submitted',
      isRevealed: false,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    if (autoEvaluate) {
      await evaluateSubmission(newSubmission.id);
    }

    return newSubmission;
  };

  const evaluateSubmission = async (
    submissionId: string,
    forceDemo: boolean = false
  ): Promise<{ success: boolean; error?: string; isDemoFallback?: boolean }> => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: 'Submission not found' };

    const chal = challenges.find((c) => c.id === sub.challengeId);
    if (!chal) return { success: false, error: 'Challenge specification not found' };

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: chal,
          submission: {
            anonymousId: sub.anonymousId,
            solutionText: sub.solutionText,
            projectUrl: sub.projectUrl,
            repoUrl: sub.repoUrl,
            approachExplanation: sub.approachExplanation,
          },
          forceDemoFallback: forceDemo,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Server evaluation error occurred.');
      }

      const evalResult: EvaluationResult = {
        ...resData.evaluation,
        evaluatedAt: new Date().toISOString(),
        evaluationSource: resData.evaluationSource || 'Live Gemini API',
        isDemoFallback: resData.isDemoFallback || false,
      };

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                status: s.status === 'Shortlisted' ? 'Shortlisted' : 'Evaluated',
                evaluation: evalResult,
              }
            : s
        )
      );

      setIsEvaluating(false);
      return { success: true, isDemoFallback: resData.isDemoFallback };
    } catch (err: any) {
      console.error('Failed evaluation:', err);
      setIsEvaluating(false);
      const errMsg = err.message || 'Evaluation failed. Check API key or network.';
      setEvaluationError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const shortlistCandidate = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'Shortlisted' } : s))
    );
  };

  const rejectCandidate = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'Rejected' } : s))
    );
  };

  const revealProfile = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, isRevealed: true, revealedAt: new Date().toISOString() }
          : s
      )
    );
  };

  const answerDefenseQuestion = (submissionId: string, questionIndex: number, answer: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        const currentDefense = s.defenseResponses || [];
        const existingIdx = currentDefense.findIndex((d) => d.questionIndex === questionIndex);
        const questionText = s.evaluation?.defense_questions[questionIndex] || `Defense Question #${questionIndex + 1}`;
        const updatedItem: DefenseResponse = {
          questionIndex,
          question: questionText,
          answer,
          answeredAt: new Date().toISOString(),
        };

        let nextDefense: DefenseResponse[];
        if (existingIdx >= 0) {
          nextDefense = currentDefense.map((d, i) => (i === existingIdx ? updatedItem : d));
        } else {
          nextDefense = [...currentDefense, updatedItem];
        }

        return { ...s, defenseResponses: nextDefense };
      })
    );
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(`${STORE_KEY}_users`);
      localStorage.removeItem(`${STORE_KEY}_challenges`);
      localStorage.removeItem(`${STORE_KEY}_submissions`);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    setUsers(SEED_USERS);
    setChallenges(SEED_CHALLENGES);
    setSubmissions(SEED_SUBMISSIONS);
    setSession(null);
    setCurrentUser(null);
    setSelectedRole(null);
    setSelectedChallengeId(null);
    setSelectedSubmissionId(null);
    setCurrentView('welcome');
  };

  const getChallengeById = (id: string) => challenges.find((c) => c.id === id);
  const getSubmissionById = (id: string) => submissions.find((s) => s.id === id);

  const getCandidateProfile = (candidateId: string, isRevealed: boolean): Partial<User> | null => {
    const candidate = users.find((u) => u.id === candidateId);
    if (!candidate) return null;
    if (!isRevealed) {
      return {
        id: candidate.id,
        skills: candidate.skills,
      };
    }
    return candidate;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        selectedRole,
        users,
        challenges,
        submissions,
        currentView,
        selectedChallengeId,
        selectedSubmissionId,
        isEvaluating,
        evaluationError,
        navigateTo,
        selectRole,
        signUp,
        login,
        loginWithGitHub,
        completeApplicantOnboarding,
        logout,
        resetPassword,
        demoLogin,
        createChallenge,
        submitSolution,
        evaluateSubmission,
        shortlistCandidate,
        rejectCandidate,
        revealProfile,
        answerDefenseQuestion,
        resetDemoData,
        getChallengeById,
        getSubmissionById,
        getCandidateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
