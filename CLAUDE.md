# CLAUDE.md

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
npm run dev              # localhost:3000 (use :3001 if occupied)
npm run build            # Production build (REQUIRED before deploy)
npm run lint             # ESLint validation
npm run mcp-puppeteer    # Browser automation

# Agent Systems  
node start-agents-system.js     # CVPerfect 40-agent system
node start-debug-agents.js      # 6-agent debug system

# Testing
node test-comprehensive-website.js    # Full validation
node test-all-success-functions.js    # Template system (6 functions)
node test-agents-integration.js       # Agent system test

# Hidden Commands (2024-2025)
/history 2024-12-01       # Conversations from date
/export cookbook          # Export prompts to markdown
/analyze @src --complexity   # Code complexity analysis
/security @api            # Security audit
/terminal-setup           # Fix Shift+Enter
```

## Project Overview

**CVPerfect**: Next.js 14 AI-powered CV optimization with freemium model, Stripe payments, Polish/English support.

### Architecture
- **Frontend**: 6000+ line SPA (`pages/index.js`), glassmorphism design, `<style jsx>` only
- **Payment**: 3-tier pricing (Basic 19.99, Gold 49, Premium 79 PLN), Stripe integration
- **AI**: Groq SDK + Llama 3.1-70B, chunked processing, photo preservation

### Core API Endpoints
- `/api/parse-cv` - PDF/DOCX parsing
- `/api/save-session` - Session persistence
- `/api/create-checkout-session` - Stripe payment
- `/api/stripe-webhook` - Payment validation
- `/api/get-session-data` - Session retrieval
- `/api/analyze` - Production AI analysis

### Critical Data Flow
1. CV upload → `index.js` → `/api/parse-cv` → `/api/save-session`
2. Payment → Stripe → `/api/stripe-webhook` → Session update
3. Success → `success.js` → `/api/get-session-data` → AI optimization

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

### File Structure
```
pages/
├── index.js          # Main SPA (6000+ lines)
├── success.js        # Post-payment optimization
├── api/              # All API endpoints
agents/               # 40+ agent system
├── debug/            # 6-agent debug (3 basic + 3 masters)
├── orchestration/    # Master coordinators
├── core/             # Backend, frontend, DevOps
components/           # React components
```

## 🚀 Current Status (August 2025)

### ✅ COMPLETED FEATURES
- **Payment Flow**: All plans working (Basic/Gold/Premium)
- **Success.js Redesign**: Glassmorphism UI, professional templates
- **AI Optimization**: Full CV processing + photo preservation
- **Template System**: 7 templates with plan-based access
- **Security**: Enhanced API security, error handling, rate limiting
- **Debug System**: 6-agent debug resolved infinite loops

### 🔧 Known Working Systems
- ✅ CV Upload & Parsing (PDF/DOCX)
- ✅ Stripe Payment Flow (all plans)
- ✅ AI Optimization (Groq API)
- ✅ Template System (7 templates)
- ✅ Export Functions (PDF, DOCX, Email)
- ✅ Session Persistence

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