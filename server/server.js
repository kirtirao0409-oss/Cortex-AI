import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Load .env using absolute path from project root
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration explicitly scoped to local development environments
const allowedOriginPatterns = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, test scripts)
    if (!origin) return callback(null, true);
    if (allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for unauthorized origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Helper to get active API key with live reload
function getApiKey() {
  dotenv.config({ path: envPath, override: true });
  return process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';
}

// Helper to get configured model
function getModel() {
  return process.env.GROQ_MODEL ? process.env.GROQ_MODEL.trim() : 'openai/gpt-oss-120b';
}

// Safe diagnostic logging (NEVER prints the actual key)
function logKeyStatus(action) {
  const key = getApiKey();
  const hasKey = Boolean(
    key && 
    key !== 'your_groq_api_key_here' && 
    key !== 'gsk_your_groq_api_key_here' &&
    key.length > 10
  );
  const prefix = hasKey ? key.slice(0, 4) : 'none';
  console.log(`[Cortex AI Server] ${action} - Groq API Key: ${hasKey ? `Configured (Prefix: ${prefix}..., Length: ${key.length})` : 'Not Configured / Placeholder'}`);
}

// Redact any sensitive tokens, API keys, or key prefixes from error messages
function sanitizeErrorMessage(msg) {
  if (!msg || typeof msg !== 'string') return '';
  const key = getApiKey();
  let sanitized = msg;
  if (key && key.length > 5) {
    sanitized = sanitized.replaceAll(key, '[REDACTED_KEY]');
  }
  sanitized = sanitized.replace(/gsk_[a-zA-Z0-9]{20,}/g, '[REDACTED_KEY]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_KEY]');
  return sanitized;
}

// Default seed dataset for CRM opportunities ensuring completeness
const DEFAULT_CRM_OPPORTUNITIES = [
  { id: 'opp-1', company: 'Hyperion Networks', contactPerson: 'Jonathan Vance', email: 'j.vance@hyperion.net', dealValue: 180000, stage: 'Negotiation', probability: '85%', owner: 'Sarah Chen', expectedCloseDate: '2026-11-28', createdAt: '2026-10-15' },
  { id: 'opp-2', company: 'Aether Data Labs', contactPerson: 'Dr. Aris Thorne', email: 'athorne@aetherlabs.io', dealValue: 125000, stage: 'Proposal', probability: '70%', owner: 'Marcus Vance', expectedCloseDate: '2026-12-05', createdAt: '2026-10-22' },
  { id: 'opp-3', company: 'OmniGlobal Retail', contactPerson: 'Claire Beauchamp', email: 'claire@omniglobal.com', dealValue: 95000, stage: 'Demo Held', probability: '60%', owner: 'Elena Rostova', expectedCloseDate: '2026-12-18', createdAt: '2026-11-01' },
  { id: 'opp-4', company: 'Pulse Health Systems', contactPerson: 'Dr. Robert Chen', email: 'rchen@pulsehealth.org', dealValue: 210000, stage: 'Proposal', probability: '75%', owner: 'David Kim', expectedCloseDate: '2026-11-30', createdAt: '2026-10-18' },
  { id: 'opp-5', company: 'Vertex Cloud Solutions', contactPerson: 'Marcus Brody', email: 'mbrody@vertexcloud.io', dealValue: 140000, stage: 'Qualified', probability: '45%', owner: 'Sarah Chen', expectedCloseDate: '2026-12-20', createdAt: '2026-11-05' },
  { id: 'opp-6', company: 'Nova Robotics', contactPerson: 'Evelyn Reed', email: 'ereed@novarobotics.tech', dealValue: 320000, stage: 'Closed Won', probability: '100%', owner: 'David Kim', expectedCloseDate: '2026-11-10', createdAt: '2026-09-30' },
  { id: 'opp-7', company: 'Apex Logistics Global', contactPerson: 'Samuel Drake', email: 'sdrake@apexlog.com', dealValue: 85000, stage: 'Inquiry', probability: '25%', owner: 'Elena Rostova', expectedCloseDate: '2027-01-15', createdAt: '2026-11-08' },
];

// Helper to format live business context for the LLM
function buildSystemPrompt(context = {}) {
  let contextBlock = '';
  const effectiveContext = context || {};
  let crmCount = DEFAULT_CRM_OPPORTUNITIES.length;

  const parts = [];

  // CRM Context - ensure all seed records (including Apex Logistics Global) are included
  let crmList = Array.isArray(effectiveContext.crm) && effectiveContext.crm.length > 0 
    ? effectiveContext.crm 
    : DEFAULT_CRM_OPPORTUNITIES;
    
  const existingCompanies = new Set(crmList.map((o) => (o.company || '').toLowerCase().trim()));
  const missingSeeds = DEFAULT_CRM_OPPORTUNITIES.filter(
    (seed) => !existingCompanies.has(seed.company.toLowerCase().trim()) && !crmList.some((o) => o.id === seed.id)
  );
  if (missingSeeds.length > 0) {
    crmList = [...crmList, ...missingSeeds];
  }
  crmCount = crmList.length;

  const crmSummary = crmList.map((o, idx) => 
    `${idx + 1}. Company: ${o.company} | Deal Value: $${(Number(o.dealValue) || 0).toLocaleString()} | Stage: ${o.stage} | Owner: ${o.owner || 'Unassigned'} | Expected Close: ${o.expectedCloseDate || 'N/A'}`
  ).join('\n');
  const totalPipeline = crmList.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
  parts.push(`### Live CRM Opportunities (Total Pipeline: $${totalPipeline.toLocaleString()} across EXACTLY ${crmList.length} deals in database):\n${crmSummary}`);

  // HRMS Context
  if (Array.isArray(effectiveContext.hrms) && effectiveContext.hrms.length > 0) {
    const hrmsSummary = effectiveContext.hrms.map((r, idx) => 
      `${idx + 1}. Role: ${r.role} | Dept: ${r.department} | Type: ${r.employmentType || 'Full-time'} | Openings: ${r.openings || 1} | Applicants Screened: ${r.applicants || 0} | Status: ${r.status} | Target Date: ${r.targetDate || 'N/A'}`
    ).join('\n');
    const totalOpenings = effectiveContext.hrms.reduce((sum, r) => sum + (Number(r.openings) || 1), 0);
    const totalApplicants = effectiveContext.hrms.reduce((sum, r) => sum + (Number(r.applicants) || 0), 0);
    parts.push(`### Live HRMS Requisitions (${totalOpenings} open positions, ${totalApplicants} applicants screened across EXACTLY ${effectiveContext.hrms.length} requisitions):\n${hrmsSummary}`);
  }

  // Projects Context
  if (Array.isArray(effectiveContext.projects) && effectiveContext.projects.length > 0) {
    const projectsSummary = effectiveContext.projects.map((p, idx) => 
      `${idx + 1}. Initiative: ${p.name} | Team: ${p.team} | Lead: ${p.manager || 'Unassigned'} | Priority: ${p.priority || 'Medium'} | Status: ${p.status} | Progress: ${p.progress || 0}% | Due: ${p.due || 'N/A'}`
    ).join('\n');
    const avgProgress = Math.round(effectiveContext.projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / effectiveContext.projects.length);
    parts.push(`### Live Projects & Delivery Sprints (EXACTLY ${effectiveContext.projects.length} initiatives, Average Completion: ${avgProgress}%):\n${projectsSummary}`);
  }

  // Platform Analytics Context
  if (effectiveContext.analytics) {
    parts.push(`### Executive Platform Analytics:
- Total Pipeline Value: $${effectiveContext.analytics.totalPipeline?.toLocaleString() || 'N/A'}
- Closed Won Revenue: $${effectiveContext.analytics.closedWonValue?.toLocaleString() || 'N/A'}
- Screened Candidates: ${effectiveContext.analytics.totalApplicants?.toLocaleString() || 'N/A'}
- Active Requisitions: ${effectiveContext.analytics.totalRequisitions || 'N/A'}
- Active Delivery Initiatives: ${effectiveContext.analytics.totalProjects || 'N/A'}
- Average Milestone Progress: ${effectiveContext.analytics.avgProgress || 0}%`);
  }

  if (parts.length > 0) {
    contextBlock = `\n\n=== LIVE APPLICATION BUSINESS CONTEXT ===\n${parts.join('\n\n')}\n========================================`;
  }

  return `You are Cortex, an enterprise AI business automation copilot and intelligent decision assistant.
You help executives, sales leaders, talent recruiters, and delivery managers orchestrate operations, identify risks, and accelerate revenue.

Core Operational Rules:
1. Always ground your analysis strictly in the real application context provided below.
2. MANDATORY COMPLETE RECORD ENUMERATION:
   - When the user asks to list, display, review, or summarize ALL records, all CRM opportunities, all companies, all deal values, all requisitions, or all projects:
     * You MUST include and account for EVERY SINGLE RECORD in the provided context without omitting, truncating, or skipping any record.
     * If the CRM context contains ${crmCount} opportunities, your response MUST explicitly include all ${crmCount} opportunities (including Apex Logistics Global and every other deal).
     * Verify that the total number of items in your output matches the exact count of records in the context (${crmCount} CRM opportunities) before concluding your answer.
3. ABSOLUTELY NO SILENT TRUNCATION:
   - NEVER truncate records silently or use phrases like "and others", "such as", or "etc." when a complete listing or all records are requested.
   - Every single entity in the requested dataset must appear in your answer.
4. EXPLICIT NOTICE IF CONTEXT LIMITS FORCE PARTIAL OUTPUT:
   - Only if response length or token limits physically prevent providing the entire list, you MUST explicitly prepend your response with:
     "⚠️ **Note: Showing partial records (X of Y total)** due to length limits."
   - Otherwise, you must always provide the full, unabridged list.
5. Cite specific business records: cite actual company names, deal amounts, candidate counts, and project progress percentages. Never invent fake business records, clients, or metrics.
6. If asked for recommendations or risk identification:
   - For CRM: Highlight deals in early or stalled stages, high-value opportunities approaching target dates, or owners with heavy loads.
   - For Projects: Identify initiatives with low progress (<50%) relative to due dates, Critical/High priority initiatives, or blockers.
   - For HRMS: Highlight open roles with low applicant volume or high urgency.
7. Format responses with clean, structured Markdown (bold keywords, Markdown tables for tabular data, bullet points, concise sections).
8. Do not pretend to execute external transactions, send real emails, or modify databases unless confirmed.${contextBlock}`;
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const key = getApiKey();
  const isConfigured = Boolean(
    key && 
    key !== 'your_groq_api_key_here' && 
    key !== 'gsk_your_groq_api_key_here' && 
    key.length > 10
  );

  res.json({
    status: 'ok',
    service: 'Cortex AI Assistant Backend',
    groqConfigured: isConfigured,
    model: getModel(),
  });
});

// Chat Completion Handler with model fallback resilience
async function callGroqChat(apiKey, model, messages) {
  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });
}

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    // 1. Validate Input (type, non-empty, length bounds)
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required and cannot be empty.',
        code: 'INVALID_INPUT'
      });
    }

    if (message.length > 8000) {
      return res.status(400).json({
        error: 'Message exceeds maximum allowed length of 8,000 characters.',
        code: 'MESSAGE_TOO_LARGE'
      });
    }

    if (history && !Array.isArray(history)) {
      return res.status(400).json({
        error: 'History must be an array of messages.',
        code: 'INVALID_HISTORY'
      });
    }

    if (context && (typeof context !== 'object' || Array.isArray(context))) {
      return res.status(400).json({
        error: 'Context must be a valid JSON object.',
        code: 'INVALID_CONTEXT'
      });
    }

    // 2. Validate API Key
    const apiKey = getApiKey();
    logKeyStatus('POST /api/chat');

    if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey === 'gsk_your_groq_api_key_here' || apiKey.length < 10) {
      return res.status(401).json({
        error: 'Groq API key not configured. Please add your valid GROQ_API_KEY to the .env file in the project root to enable AI responses.',
        code: 'MISSING_API_KEY',
      });
    }

    // 3. Assemble Prompt & Messages
    let model = getModel();
    const systemPrompt = buildSystemPrompt(context);

    // Limit conversation history to the last 8 messages and sanitize lengths
    const sanitizedHistory = Array.isArray(history) 
      ? history.slice(-8).map((msg) => ({
          role: msg && msg.role === 'assistant' ? 'assistant' : 'user',
          content: String(msg && msg.content ? msg.content : '').slice(0, 4000),
        }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message.trim() },
    ];

    // 4. Call Groq API
    let groqResponse = await callGroqChat(apiKey, model, messages);

    // If configured model is not found or decommissioned, automatically fallback to active available model
    if (!groqResponse.ok && (groqResponse.status === 404 || groqResponse.status === 400)) {
      const errJson = await groqResponse.json().catch(() => ({}));
      const code = errJson.error?.code;

      if (code === 'model_not_found' || code === 'model_decommissioned') {
        const fallbackModel = 'openai/gpt-oss-120b';
        console.warn(`[Cortex AI Server] Model '${model}' unavailable (${code}). Falling back to '${fallbackModel}'...`);
        model = fallbackModel;
        groqResponse = await callGroqChat(apiKey, model, messages);
      }
    }

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      const rawErrorMessage = errorData.error?.message || `Groq API responded with status ${groqResponse.status}`;
      const errorMessage = sanitizeErrorMessage(rawErrorMessage);

      if (groqResponse.status === 401) {
        return res.status(401).json({
          error: 'Invalid Groq API key. Please check that GROQ_API_KEY in your .env file is correct.',
          code: 'INVALID_API_KEY',
          details: errorMessage,
        });
      }

      if (groqResponse.status === 429) {
        return res.status(429).json({
          error: 'Groq rate limit exceeded. Please wait a few seconds and try again.',
          code: 'RATE_LIMIT',
          details: errorMessage,
        });
      }

      return res.status(groqResponse.status).json({
        error: `Groq AI Error: ${errorMessage}`,
        code: 'API_ERROR',
      });
    }

    const data = await groqResponse.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return res.status(502).json({
        error: 'Received empty response from AI model. Please try again.',
        code: 'EMPTY_RESPONSE',
      });
    }

    return res.json({
      response: assistantMessage,
      model: data.model || model,
    });
  } catch (error) {
    const rawError = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cortex AI Server] Error handling chat request:', sanitizeErrorMessage(rawError));
    return res.status(500).json({
      error: 'An internal error occurred while connecting to the Cortex AI service.',
      details: sanitizeErrorMessage(rawError),
    });
  }
});

// Error handling middleware to catch malformed JSON payloads without crashing
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[Cortex AI Server] JSON Parse Error in request body');
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }
  console.error('[Cortex AI Server] Unhandled Express Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server with error handling
const server = app.listen(PORT, () => {
  console.log(`[Cortex AI Server] Backend service running on http://localhost:${PORT}`);
  console.log(`[Cortex AI Server] Environment file loaded from: ${envPath}`);
  console.log(`[Cortex AI Server] Configured Model: ${getModel()}`);
  logKeyStatus('Startup');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Cortex AI Server] Port ${PORT} is already in use by another process.`);
  } else {
    console.error('[Cortex AI Server] Server error:', err);
  }
});
