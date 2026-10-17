import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to construct GoogleGenAI instance safely
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasGithub = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID.trim() !== '');
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    githubConfigured: hasGithub,
    timestamp: new Date().toISOString(),
  });
});

// Helper to determine base URL
function getBaseUrl(req: express.Request): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl !== 'MY_APP_URL') {
    return envUrl.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

// GitHub OAuth URL Endpoint
app.get('/api/auth/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/github/callback`;
  const isConfigured = Boolean(clientId && clientId.trim() !== '');

  if (!isConfigured) {
    return res.json({
      configured: false,
      redirectUri,
      message: 'GitHub OAuth is not configured with GITHUB_CLIENT_ID.',
      url: null,
    });
  }

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.json({
    configured: true,
    clientId,
    redirectUri,
    url: authUrl,
  });
});

// GitHub OAuth Callback Route
app.get(['/auth/github/callback', '/auth/github/callback/'], async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Authentication Error</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
          <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 400px; text-align: center;">
            <h3 style="color: #e11d48; margin-top: 0;">Authentication Cancelled</h3>
            <p style="color: #475569; font-size: 14px;">${error_description || error}</p>
            <p style="color: #94a3b8; font-size: 12px;">This window will close automatically.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: ${JSON.stringify(error_description || error)} }, '*');
              setTimeout(function() { window.close(); }, 1200);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Missing code parameter in OAuth callback.');
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>OAuth Config Missing</title></head>
        <body style="font-family: sans-serif; padding: 24px; text-align: center;">
          <h3>OAuth Setup Required</h3>
          <p>GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing in server environment variables.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: 'Missing GitHub OAuth server credentials.' }, '*');
            }
            setTimeout(function() { window.close(); }, 2000);
          </script>
        </body>
      </html>
    `);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as any;

    if (tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || 'Failed to exchange authorization code.';
      return res.send(`
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
              }
              window.close();
            </script>
            <p>Authentication failed: ${errMsg}</p>
          </body>
        </html>
      `);
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub User profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'BlindProof-App',
      },
    });

    const githubUser = (await userRes.json()) as any;

    // Fetch primary email if private on profile
    let primaryEmail = githubUser.email;
    if (!primaryEmail) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'BlindProof-App',
          },
        });
        const emails = (await emailsRes.json()) as any[];
        if (Array.isArray(emails)) {
          const primaryObj = emails.find((e) => e.primary && e.verified) || emails[0];
          if (primaryObj) primaryEmail = primaryObj.email;
        }
      } catch (err) {
        console.warn('Failed to fetch github emails:', err);
      }
    }

    const userPayload = {
      githubId: String(githubUser.id),
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      email: primaryEmail || `${githubUser.login}@users.noreply.github.com`,
      avatar: githubUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: githubUser.bio || 'Applicant & Software Developer',
      githubUrl: githubUser.html_url || `https://github.com/${githubUser.login}`,
    };

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BlindProof · GitHub Connected</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #0f172a;
            }
            .card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              text-align: center;
              max-width: 340px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .title { font-weight: 600; font-size: 15px; margin-bottom: 6px; }
            .desc { font-size: 12px; color: #64748b; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Authenticated via GitHub</div>
            <div class="desc">Connecting your account to BlindProof... This window will close automatically.</div>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GITHUB_OAUTH_SUCCESS',
                  payload: ${JSON.stringify(userPayload)}
                }, '*');
                setTimeout(function() {
                  window.close();
                }, 400);
              } else {
                window.location.href = '/';
              }
            } catch (err) {
              console.error(err);
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('GitHub OAuth Error:', error);
    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GITHUB_OAUTH_ERROR',
                error: ${JSON.stringify(error.message || 'Internal OAuth Error')}
              }, '*');
            }
            window.close();
          </script>
          <p>Authentication failed. Closing window...</p>
        </body>
      </html>
    `);
  }
});

// AI Evaluation Endpoint
app.post('/api/evaluate', async (req, res) => {
  const { challenge, submission, forceDemoFallback } = req.body;

  if (!challenge || !submission) {
    return res.status(400).json({
      success: false,
      error: 'Missing required challenge or submission payload.',
    });
  }

  // If client explicitly requested demo fallback or Gemini is not available
  const ai = getGenAIClient();

  if (forceDemoFallback || !ai) {
    // Generate an authentic, structured, explicitly labeled demo fallback evaluation
    const demoEval = generateStructuredDemoEvaluation(challenge, submission);
    return res.json({
      success: true,
      isDemoFallback: true,
      evaluationSource: 'Demonstration Engine (Simulation)',
      evaluation: demoEval,
      disclaimer: 'Evaluated in Offline Demo Mode. This is a simulated assessment for demonstration purposes.',
    });
  }

  try {
    const defaultRubric = [
      { id: 'correctness', name: 'Correctness and Task Completion', weight: 30 },
      { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25 },
      { id: 'usability', name: 'Quality and Usability', weight: 20 },
      { id: 'creativity', name: 'Creativity and Originality', weight: 15 },
      { id: 'explanation', name: 'Explanation and Clarity', weight: 10 },
    ];

    const activeRubric = challenge.rubric && challenge.rubric.length > 0 ? challenge.rubric : defaultRubric;

    const evaluationPrompt = `
You are the BlindProof Technical Evaluation Engine.
Your task is to objectively, rigorously, and fairly evaluate an ANONYMOUS technical submission against a startup challenge.

### STRICT PRIVACY & BLIND EVALUATION RULES:
1. The candidate identity is completely blinded. You only know them by their anonymous code: "${submission.anonymousId || 'BP-ANON'}".
2. Base your scoring ENTIRELY on the provided submission text, architecture, repository structure, and explanation.
3. NEVER invent or hallucinate evidence not present in the submission.
4. If a criterion cannot be verified from the submission artifacts, explicitly state that in the comment and mark confidence accordingly.
5. Provide concise, insightful, technical feedback. Do NOT provide generic platitudes.
6. Generate 3 sharp, deep defense questions specifically about the candidate's actual implementation choices and trade-offs.

### CHALLENGE SPECIFICATION:
- Title: ${challenge.title}
- Track / Role: ${challenge.roleCategory}
- Difficulty: ${challenge.difficulty}
- Description: ${challenge.description}
- Required Deliverables:
${(challenge.deliverables || []).map((d: string, i: number) => `  ${i + 1}. ${d}`).join('\n')}
- Required Skills: ${(challenge.requiredSkills || []).join(', ')}

### EVALUATION RUBRIC CRITERIA:
${activeRubric.map((r: any) => `- ${r.name} (Weight: ${r.weight}%): ${r.description || ''}`).join('\n')}

### CANDIDATE SUBMISSION (ANONYMOUS ID: ${submission.anonymousId || 'BP-ANON'}):
- Solution Content / Code / Architecture:
"""
${submission.solutionText || '(No inline text provided)'}
"""
- Live Project URL: ${submission.projectUrl || 'None'}
- Repository URL: ${submission.repoUrl || 'None'}
- Approach & Architectural Decision Rationale:
"""
${submission.approachExplanation || '(No approach explanation provided)'}
"""

Evaluate this submission thoroughly. Calculate the overall_score (0-100) as the weighted sum of the criteria scores.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        systemInstruction:
          'You are BlindProof AI - a fair, rigorous, evidence-based technical hiring evaluator. You assess real work against startup rubrics without background bias, providing granular evidence citations and technical defense questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_score: {
              type: Type.INTEGER,
              description: 'Weighted composite score between 0 and 100 based on the rubric weights.',
            },
            criteria_scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion_id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  weight: { type: Type.INTEGER },
                  score: { type: Type.INTEGER, description: 'Score from 0 to 100 for this specific criterion' },
                  comment: { type: Type.STRING, description: 'Concise, rigorous analysis of the candidate work for this criterion' },
                  evidence_quote: { type: Type.STRING, description: 'Direct snippet, design decision, or artifact citation from the submission' },
                },
                required: ['name', 'weight', 'score', 'comment'],
              },
            },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific factual observations and artifacts found in the submission',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of top demonstrable strengths',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable technical suggestions for improvement',
            },
            requirement_coverage: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  requirement: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'met | partial | missed' },
                  notes: { type: Type.STRING },
                },
                required: ['requirement', 'status'],
              },
            },
            defense_questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 technical defense questions directly interrogating specific architectural or implementation choices made in the submission',
            },
            confidence: {
              type: Type.STRING,
              description: 'low, medium, or high based on amount of inspectable evidence',
            },
            limitations: {
              type: Type.STRING,
              description: 'Important uncertainties, unverified runtime behavior, or missing components',
            },
          },
          required: [
            'overall_score',
            'criteria_scores',
            'evidence',
            'strengths',
            'improvements',
            'requirement_coverage',
            'defense_questions',
            'confidence',
            'limitations',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini model returned empty response text.');
    }

    const parsedJson = JSON.parse(responseText.trim());

    return res.json({
      success: true,
      isDemoFallback: false,
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      evaluation: parsedJson,
    });
  } catch (error: any) {
    console.error('Gemini evaluation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete AI evaluation.',
      canUseDemoFallback: true,
    });
  }
});

// Deterministic structured demo evaluation generator (used for offline resilience or demo mode)
function generateStructuredDemoEvaluation(challenge: any, submission: any) {
  const hasText = Boolean(submission.solutionText && submission.solutionText.length > 30);
  const hasExplanation = Boolean(submission.approachExplanation && submission.approachExplanation.length > 20);
  const hasUrls = Boolean(submission.projectUrl || submission.repoUrl);

  const baseScore = hasText && hasExplanation ? 86 : hasText || hasExplanation ? 74 : 62;
  const overall = Math.min(96, Math.max(55, baseScore + (hasUrls ? 4 : 0)));

  const rubric = challenge.rubric || [
    { id: 'correctness', name: 'Correctness and Task Completion', weight: 30 },
    { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25 },
    { id: 'usability', name: 'Quality and Usability', weight: 20 },
    { id: 'creativity', name: 'Creativity and Originality', weight: 15 },
    { id: 'explanation', name: 'Explanation and Clarity', weight: 10 },
  ];

  const criteriaScores = rubric.map((r: any) => {
    let score = overall;
    let quote = 'Candidate submission documentation';
    if (r.id === 'correctness') {
      score = Math.min(100, overall + 2);
      quote = submission.solutionText ? submission.solutionText.slice(0, 80) + '...' : 'Modular handler specification';
    } else if (r.id === 'problem_solving') {
      score = overall;
      quote = submission.approachExplanation ? submission.approachExplanation.slice(0, 80) + '...' : 'System trade-off rationale';
    } else if (r.id === 'explanation') {
      score = Math.min(100, overall + (hasExplanation ? 5 : -10));
      quote = 'Approach writeup and trade-off justification';
    }
    return {
      criterion_id: r.id,
      name: r.name,
      weight: r.weight,
      score,
      comment: `Evaluated against ${r.name}. Submission demonstrates solid grasp of core objectives with demonstrable technical judgment.`,
      evidence_quote: quote,
    };
  });

  const deliverables = challenge.deliverables || ['Working Implementation', 'Architecture Document', 'Test Cases'];
  const coverage = deliverables.map((deliv: string, idx: number) => ({
    requirement: deliv,
    status: idx === deliverables.length - 1 && !hasUrls ? 'partial' : 'met',
    notes: idx === 0 ? 'Core logic and code components provided in submission text.' : 'Provided in solution artifacts.',
  }));

  return {
    overall_score: overall,
    criteria_scores: criteriaScores,
    evidence: [
      `Delivered submission with ${submission.solutionText ? submission.solutionText.length : 0} characters of solution detail.`,
      submission.repoUrl ? `Provided public repository link: ${submission.repoUrl}` : 'No external repository link specified.',
      submission.projectUrl ? `Live deployment demonstrated at: ${submission.projectUrl}` : 'Local architectural setup documented.',
      'Clear breakdown of design choices provided in approach notes.',
    ],
    strengths: [
      'Strong separation of concerns and modular architectural structure.',
      'Practical handling of latency, edge conditions, and error boundaries.',
      'Transparent communication of trade-offs in approach explanation.',
    ],
    improvements: [
      'Expand automated test coverage suite to cover concurrent load scenarios.',
      'Add benchmark profiling telemetry for high-throughput scaling.',
    ],
    requirement_coverage: coverage,
    defense_questions: [
      `In your solution for ${challenge.title}, how did you handle state synchronization under network partition or abrupt disconnection?`,
      'If request traffic scaled by 100x within 5 minutes, which specific component would experience the first bottleneck, and how would you mitigate it?',
      'What alternative architectural patterns did you discard during initial prototyping, and what trade-off determined your final approach?',
    ],
    confidence: hasText && hasExplanation ? 'high' : 'medium',
    limitations: 'Static code and architectural inspection completed. Live end-to-end execution environment was not spun up in sandbox.',
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BlindProof Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
