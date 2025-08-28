# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<cvperfect_protocol>
<mandatory_enforcement>APPLY_PROTOCOL_WITHOUT_DISPLAY</mandatory_enforcement>
<required_tools>Task, CVPerfect_Agents, Debug_Agents, TodoWrite</required_tools>
</cvperfect_protocol>

## 🔄 PROTOCOL ENFORCEMENT
**MANDATORY RULES (ALL REQUIRED):**
1. **Task tool**: Multi-step tasks (3+ steps) - MANDATORY
2. **CVPerfect 40-agent system**: Specialized tasks (payment, API, debug) - MANDATORY  
3. **Debug agents**: Technical problems - MANDATORY
4. **TodoWrite**: Multi-step tracking - MANDATORY
5. **Sub-agents**: Large files (18k+ lines), security, performance - MANDATORY
6. **Ultrathink**: Maximum analysis budget - MANDATORY
7. **TDD**: Test → Mock → Implementation - MANDATORY
8. **Compile First**: Always compile before tests - MANDATORY
9. **Context Management**: `/clear` at 70%, NEVER auto-compress - MANDATORY
10. **VERIFICATION**: lint→build→test→verify - MANDATORY
11. **REGRESSION TESTS**: Level 1→2→3 before changes - MANDATORY
12. **ANTI-HALLUCINATION**: TRUST BUT VERIFY - MANDATORY
13. **Workflows**: git branch→baseline→incremental→regression - MANDATORY
14. **SYSTEM INVARIANTS**: CV upload, payment, AI, templates, exports - MANDATORY

## ⚠️ CRITICAL: VERIFICATION PROTOCOL
**PROBLEM:** 66% developers spend more time fixing "almost-correct" AI code
**SOLUTION:** TRUST BUT VERIFY - always test before accepting "fixes"

### MANDATORY VERIFICATION:
```bash
npm run lint                    # 1. Linting
npm run build                   # 2. Build success  
node test-specific-fix.js       # 3. Test fix
node test-regression-suite.js   # 4. Regression
git commit -m "✅ VERIFIED"     # 5. Commit only after verification
```

## 🚀 Essential Commands

```bash
# Core Development
npm run dev                          # Start development server (localhost:3000)
npm run build                        # Production build
npm run start                        # Start production server
npm run lint                         # ESLint validation
npm run mcp-puppeteer               # Browser automation with Puppeteer

# CI Pipeline
npm run ci                          # Run full CI suite: lint + delegation + hooks + smoke tests
npm run test:delegation             # Test agent delegation system
npm run test:hooks                  # Test hooks runtime
npm run test:smoke                  # Smoke tests (build + start + HTTP check)

# Python Integration
npm run install-python              # Install Python dependencies in cvperfect_py/
npm run test-python                 # Test Python module import
npm run health-python               # Health check for Python CLI integration

# Testing Suite
node test-comprehensive-website.js      # Full website validation
node test-all-success-functions.js      # Success page template system
node test-complete-functionality.js     # Core functionality test
node test-health-endpoint.js            # API health endpoint test
node test-ping-endpoint.js              # Basic connectivity test
node test-agents-integration.js         # Agent system integration
node test-python-api.js                 # Python API integration
node test-stripe-session-fix.js         # Payment flow validation
node test-performance-monitoring.js     # Performance metrics
node test-responsive.js                 # Mobile responsiveness

# Utility Commands
npm run clean-temp                  # Clean temporary files
```

## Project Overview

**CVPerfect**: Next.js 14 AI-powered CV optimization with freemium model, Stripe payments, Polish/English support.

### Architecture
- **Frontend**: Next.js 14 SPA with glassmorphism design, main app in `pages/index.js`
- **Backend**: Next.js API routes, hybrid Node.js + Python processing 
- **Database**: Supabase (PostgreSQL) for session persistence
- **Payment**: 3-tier pricing (Basic 19.99, Gold 49, Premium 79 PLN), Stripe integration
- **AI Processing**: Dual engine - Groq SDK (Llama 3.1-70B) + Python deterministic optimization
- **File Processing**: Mammoth (DOCX), PDF-Parse (PDF), with photo preservation

### Core API Endpoints
- `/api/health` - System health check with service status
- `/api/ping` - Simple connectivity test
- `/api/parse-cv` - PDF/DOCX parsing and text extraction
- `/api/save-session` - Session persistence to Supabase
- `/api/get-session-data` - Session retrieval with payment validation
- `/api/create-checkout-session` - Stripe checkout session creation
- `/api/stripe-webhook` - Payment webhook processing
- `/api/analyze` - Groq AI-powered CV analysis
- `/api/analyze-python` - Python deterministic CV optimization
- `/api/export` - CV export (PDF/DOCX/Email) with plan gating
- `/api/performance-metrics` - Performance monitoring
- `/api/performance-dashboard` - Analytics dashboard

### Critical Data Flow
1. **CV Upload**: `index.js` → `/api/parse-cv` → `/api/save-session` → Supabase
2. **Payment Flow**: Stripe → `/api/create-checkout-session` → `/api/stripe-webhook` → Session update
3. **AI Processing**: `success.js` → `/api/get-session-data` → `/api/analyze` or `/api/analyze-python`
4. **Export**: Template rendering → `/api/export` → PDF/DOCX generation

### Dependencies
- Groq SDK, Supabase, Stripe, Nodemailer, DOMPurify, Mammoth, PDF-Parse
- Canvas-Confetti, HTML2Canvas, Framer Motion, GSAP, Puppeteer

### Environment Variables
```bash
GROQ_API_KEY=                    # AI processing
NEXT_PUBLIC_SUPABASE_URL=        # Database
SUPABASE_SERVICE_ROLE_KEY=       # Admin access
STRIPE_SECRET_KEY=               # Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Frontend
STRIPE_WEBHOOK_SECRET=           # Webhook validation
GMAIL_USER= / GMAIL_PASS=        # Email
NEXT_PUBLIC_BASE_URL=            # Production URL
```

### Key File Structure
```
pages/
├── index.js              # Main SPA with CV upload flow
├── success.js            # Post-payment CV optimization interface
├── kontakt.js            # Contact page
├── api/                  # All API endpoints
│   ├── health.js         # System health monitoring
│   ├── ping.js          # Simple connectivity test
│   ├── parse-cv.js       # CV file parsing
│   ├── analyze.js        # Groq AI analysis
│   ├── analyze-python.js # Python optimization
│   ├── export.js        # CV export functionality
│   ├── performance-*.js  # Performance monitoring APIs
│   └── stripe-webhook.js # Payment processing
cvperfect_py/             # Python CV optimization engine
├── cli.py               # Command-line interface
├── extract.py           # CV content extraction
├── rewrite.py          # Professional language enhancement
├── ats_score.py        # ATS compatibility scoring
├── templates.py        # Template management
└── templates/          # HTML templates per plan
components/
├── success/            # Modular success page components
│   ├── AIOptimizer.jsx
│   ├── TemplateRenderer.jsx
│   └── ExportTools.jsx
├── PerformanceMonitor.js # System performance tracking
└── CVAnalysisDashboard.js # Analysis dashboard
tests/                  # E2E and integration tests
utils/                  # Python CLI integration utilities
```

## 🚀 Current Status (August 2025)

### ✅ COMPLETED FEATURES
- **Dual AI Engine**: Groq (creative) + Python (deterministic) CV optimization
- **Payment Flow**: Complete Stripe integration with 3-tier pricing
- **File Processing**: PDF/DOCX parsing with photo preservation
- **Template System**: Plan-based template access (Basic/Gold/Premium)
- **Export System**: PDF/DOCX/Email generation with payment gating
- **Performance Monitoring**: Real-time metrics and dashboard
- **Security**: Input validation, rate limiting, XSS protection
- **CI/CD**: Automated testing pipeline with delegation and hooks

### 🔧 System Integration Points
- ✅ Next.js 14 frontend with React 18
- ✅ Supabase PostgreSQL database
- ✅ Stripe payment processing
- ✅ Groq AI API integration
- ✅ Python subprocess execution
- ✅ Email delivery (Nodemailer)
- ✅ File upload/download handling
- ✅ Session state management

### 🎯 Advanced Debug Masters
- **Root Cause Analysis Master**: Five Whys + Fishbone + FMEA
- **AI Debugging Copilot**: 50+ patterns, confidence scoring
- **Systematic Debugging**: 8-phase structured process

## 🛡️ Regression Prevention

### CRITICAL INVARIANTS (NEVER BREAK)
1. CV Upload (drag-drop, file picker)
2. Payment Processing (Stripe flow)
3. AI Optimization (Groq integration)
4. Template Rendering (all templates)
5. File Export (PDF/DOCX)
6. Session Management (persistence)

### HIGH-RISK PATTERNS
- UseEffect infinite loops (`pages/success.js`)
- Session data loss (API changes)
- Template switching breaks (UI state)
- Payment flow interruption (webhooks)
- Mobile responsiveness loss (CSS mods)

### TEST LEVELS
**Level 1 (MUST PASS):**
```bash
npm run build && npm run lint && node test-complete-functionality.js
```

**Level 2 (Core Components):**
```bash
node test-cv-flow.js && node test-stripe-payment-flow.js && node test-all-success-functions.js
```

**Level 3 (Regression):**
```bash
node test-responsive.js && node test-comprehensive-website.js
```

### WORKFLOW
**BEFORE:** git branch → baseline tests → impact analysis
**DURING:** ultrathink → checkpoint commits → incremental testing  
**AFTER:** regression suite → baseline compare → visual verification

## 🛑 Anti-Hallucination System

### RED FLAGS - NEVER TRUST:
- ❌ "Fixed" without showing code
- ❌ Claims of external actions (email sent)
- ❌ Non-working links
- ❌ "Should work" without test instructions
- ❌ Ignoring provided context

### VERIFICATION QUESTIONS:
1. "How confident are you about that fix?"
2. "What's your source for this solution?"
3. "Can you walk me through what changed?"
4. "What could go wrong?"
5. "How can I test this?"

## 🚀 Game-Changing Features

### Hidden Commands
```bash
/history [date]           # Show conversations
/export cookbook         # Export prompts
/analyze @src --complexity  # Code analysis
/security @api           # Security audit
/benchmark @utils/*.ts   # Performance test
```

### 3-File Rule
- MAX 3 files context per request
- More context = WORSE quality
- Focus beats breadth

### Parallel Sub-Agents (300% productivity)
```bash
git clone . ../cvperfect-debug
git clone . ../cvperfect-feature
# Run different agents in parallel
```

### Productivity Aliases
```bash
alias cc='claude --dangerously-skip-permissions'
alias cvdev='cd /path/to/cvperfect && npm run dev'
alias cvtest='npm run lint && npm run build && node test-all-success-functions.js'
```

## 📊 Claude Opus 4.1 (August 2025)
- **SWE-bench**: 74.5% (industry highest)
- **Hybrid Reasoning**: Instant OR extended thinking (128K tokens)
- **Advanced Coding**: 60% error reduction
- **Tool Use**: During extended thinking
- **Context**: 200K context, 32K output

**Note:** When you can't test something - say you can't test it, don't say it doesn't work.