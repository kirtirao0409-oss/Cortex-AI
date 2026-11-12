import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RotateCcw,
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Key
} from 'lucide-react';
import { 
  INITIAL_CRM_OPPORTUNITIES, 
  DEMO_HRMS_ROLES, 
  DEMO_PROJECT_LIST 
} from '../../data/mockData';
import type { CrmOpportunity, HrmsRequisition, ProjectItem } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const CRM_KEY = 'cortex_crm_opportunities';
const HRMS_KEY = 'cortex_hrms_requisitions';
const PROJECTS_KEY = 'cortex_projects';

// Helper to gather live context from application storage with full dataset preservation
function getLiveApplicationContext() {
  let crm: CrmOpportunity[] = INITIAL_CRM_OPPORTUNITIES;
  let hrms: HrmsRequisition[] = DEMO_HRMS_ROLES;
  let projects: ProjectItem[] = DEMO_PROJECT_LIST;

  try {
    const rawCrm = localStorage.getItem(CRM_KEY);
    if (rawCrm) {
      const parsed = JSON.parse(rawCrm);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reconcile with INITIAL_CRM_OPPORTUNITIES to ensure complete dataset (e.g. Apex Logistics Global)
        // is never omitted due to stale or partial localStorage from older revisions
        const existingNames = new Set(parsed.map((item: any) => (item.company || '').toLowerCase().trim()));
        const missingInitial = INITIAL_CRM_OPPORTUNITIES.filter(
          (init) => !existingNames.has(init.company.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
        );

        if (missingInitial.length > 0) {
          crm = [...parsed, ...missingInitial];
          try {
            localStorage.setItem(CRM_KEY, JSON.stringify(crm));
          } catch {}
        } else {
          crm = parsed;
        }
      }
    }
  } catch {}

  try {
    const rawHrms = localStorage.getItem(HRMS_KEY);
    if (rawHrms) {
      const parsed = JSON.parse(rawHrms);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingRoles = new Set(parsed.map((item: any) => (item.role || '').toLowerCase().trim()));
        const missingInitialHrms = DEMO_HRMS_ROLES.filter(
          (init) => !existingRoles.has(init.role.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
        );
        hrms = missingInitialHrms.length > 0 ? [...parsed, ...missingInitialHrms] : parsed;
      }
    }
  } catch {}

  try {
    const rawProjects = localStorage.getItem(PROJECTS_KEY);
    if (rawProjects) {
      const parsed = JSON.parse(rawProjects);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingNames = new Set(parsed.map((item: any) => (item.name || '').toLowerCase().trim()));
        const missingInitialProjects = DEMO_PROJECT_LIST.filter(
          (init) => !existingNames.has(init.name.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
        );
        projects = missingInitialProjects.length > 0 ? [...parsed, ...missingInitialProjects] : parsed;
      }
    }
  } catch {}

  const totalPipeline = crm.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
  const closedWonValue = crm.filter((o) => o.stage === 'Closed Won').reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
  const totalApplicants = hrms.reduce((sum, r) => sum + (Number(r.applicants) || 0), 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / projects.length)
    : 0;

  return {
    crm,
    hrms,
    projects,
    analytics: {
      totalPipeline,
      closedWonValue,
      totalApplicants,
      totalRequisitions: hrms.length,
      totalProjects: projects.length,
      avgProgress,
    },
  };
}

// Helper to safely render line breaks in table cells and paragraphs without raw HTML
const renderWithBr = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      const parts = child.split(/(<br\s*\/?>)/gi);
      if (parts.length > 1) {
        return parts.map((part, i) =>
          /<br\s*\/?>/i.test(part) ? <br key={i} className="my-0.5" /> : part
        );
      }
    }
    return child;
  });
};

// Preprocess common inline HTML tags produced by models into safe markdown equivalents
function sanitizeMarkdownContent(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<\/?(?:b|strong)>/gi, '**')
    .replace(/<\/?(?:i|em)>/gi, '*')
    .replace(/<hr\s*\/?>/gi, '\n---\n');
}

// Enterprise Markdown renderer supporting GFM tables, code blocks, lists, and headings
const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  const sanitized = sanitizeMarkdownContent(content);

  return (
    <div className="text-xs leading-relaxed font-sans text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-purple-500/25 bg-zinc-950/70 shadow-lg">
              <table className="w-full text-left border-collapse text-xs" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-purple-950/70 border-b border-purple-500/25 text-purple-200 uppercase font-mono text-[10px] tracking-wider" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-purple-500/10 text-zinc-200" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-purple-600/10 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3.5 py-2.5 font-semibold font-mono whitespace-nowrap text-purple-300" {...props}>
              {renderWithBr(children)}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-3.5 py-2.5 align-top leading-relaxed text-zinc-300" {...props}>
              {renderWithBr(children)}
            </td>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-base font-bold text-white mt-4 mb-2 pb-1.5 border-b border-purple-500/20 tracking-tight" {...props}>
              {renderWithBr(children)}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-sm font-bold text-purple-200 mt-3.5 mb-1.5 flex items-center gap-1.5" {...props}>
              {renderWithBr(children)}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono mt-3 mb-1" {...props}>
              {renderWithBr(children)}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-xs font-semibold text-zinc-100 mt-2 mb-1" {...props}>
              {renderWithBr(children)}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p className="text-xs leading-relaxed text-zinc-200 mb-2.5 last:mb-0" {...props}>
              {renderWithBr(children)}
            </p>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-white" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-purple-200/90" {...props}>
              {children}
            </em>
          ),
          ul: ({ children, ...props }) => (
            <ul className="space-y-1.5 my-2 pl-4 list-disc list-outside text-xs text-zinc-200 marker:text-purple-400" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal list-outside text-xs text-zinc-200 font-sans marker:text-purple-400 marker:font-mono marker:font-bold" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed pl-1" {...props}>
              {renderWithBr(children)}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="my-3 pl-3.5 border-l-2 border-purple-400/80 bg-purple-950/30 py-2 pr-3 rounded-r-lg text-xs italic text-zinc-300" {...props}>
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className="text-xs font-mono text-purple-200 leading-normal block" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-[11px]" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre className="my-2.5 p-3 rounded-xl bg-zinc-950/90 border border-purple-500/25 overflow-x-auto text-xs font-mono" {...props}>
              {children}
            </pre>
          ),
          hr: (props) => (
            <hr className="my-3 border-purple-500/20" {...props} />
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  );
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:3001';

export const AiAssistantView: React.FC = () => {
  const [promptText, setPromptText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConfigured, setBackendConfigured] = useState<boolean | null>(null);
  const [activeModel, setActiveModel] = useState<string>('Llama 3.3 70B');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Analyze my CRM opportunities and identify high-risk deals.',
    'Summarize open HRMS requisitions and candidate intake volume.',
    'Which delivery projects have the lowest completion progress or highest risk?',
    'Give me an executive summary of the business dashboard telemetry.',
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setBackendConfigured(Boolean(data.groqConfigured));
        if (data.model) {
          setActiveModel(data.model);
        }
      })
      .catch(() => {
        setBackendConfigured(false);
      });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || promptText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setPromptText('');
    setIsLoading(true);

    try {
      const liveContext = getLiveApplicationContext();

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: liveContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (data.model) {
        setActiveModel(data.model);
      }

      setMessages([
        ...newHistory,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setBackendConfigured(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Cortex AI service.';
      setMessages([
        ...newHistory,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setPromptText('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Informational Integration Banner */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Cortex AI Assistant Engine</span>
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono normal-case">
                {activeModel} via Groq
              </span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
              Securely connected via backend Express service with zero frontend credential exposure. 
              The assistant dynamically analyzes your active CRM, HRMS, and Projects datasets.
            </p>
          </div>
        </div>

        {backendConfigured === false && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs shrink-0 font-mono">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Set GROQ_API_KEY in .env</span>
          </div>
        )}
      </div>

      {/* Main Agent Interface Shell */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121222]/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl flex flex-col h-[580px]">
        {/* Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Agent Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/15 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/30 text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Cortex Autonomous Orchestrator</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Model: {activeModel} • Context: CRM, HRMS, Delivery Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleStartNewChat}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                title="Start a new conversation"
              >
                <RotateCcw className="w-3 h-3 text-purple-400" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            /* Introduction / Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 shadow-lg shadow-purple-950/50">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Enterprise Autonomous Copilot
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                Prompt Cortex to analyze live pipeline opportunities, summarize open talent requisitions, or evaluate sprint delivery health.
              </p>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full text-left">
                {samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-purple-950/40 border border-purple-500/10 hover:border-purple-500/30 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-zinc-300 group-hover:text-white leading-snug">
                        {prompt}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Messages Stream */
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className={`p-2 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center ${
                      msg.isError
                        ? 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                        : 'bg-purple-950/60 border border-purple-500/30 text-purple-300'
                    }`}>
                      {msg.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Bot className="w-4 h-4 text-purple-400" />}
                    </div>
                  )}

                  <div className={`rounded-2xl p-4 shadow-lg ${
                    msg.role === 'user'
                      ? 'max-w-[80%] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm border border-purple-400/30'
                      : msg.isError
                      ? 'max-w-[85%] bg-rose-950/30 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                      : 'max-w-[92%] sm:max-w-[90%] bg-zinc-900/80 border border-purple-500/20 text-zinc-100 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                    ) : msg.isError ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Assistant Notice</span>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-300">{msg.content}</p>
                        {msg.content.includes('GROQ_API_KEY') && (
                          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-purple-500/20 text-[11px] font-mono text-zinc-400 mt-2">
                            <span>Open <code>.env</code> and set:</span>
                            <div className="text-purple-300 font-bold mt-1">GROQ_API_KEY=gsk_your_groq_key</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}

                    <div className="flex items-center justify-end mt-2 pt-1 text-[10px] font-mono text-zinc-400/70">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking / Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0 h-8 w-8 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-zinc-900/80 border border-purple-500/20 p-4 shadow-lg flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      Cortex is analyzing live business records...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-purple-500/15 bg-zinc-950/50">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Instruct Cortex (e.g., 'Analyze our CRM pipeline and detect high-risk deals')..."
                disabled={isLoading}
                className="w-full px-4 py-3 text-xs bg-zinc-900/80 border border-purple-500/25 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all font-sans disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!promptText.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-40 text-white rounded-xl text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-purple-950/50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dispatch</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 px-1 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
              Enclave Policy: Credentials Secured in Backend
            </span>
            <span>Engine: {activeModel} via Groq</span>
          </div>
        </div>
      </div>
    </div>
  );
};
