# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 CRITICAL: Read CLAUDE_BEST_PRACTICES.md First
Before starting any significant coding session, review `CLAUDE_BEST_PRACTICES.md` which contains:
- Best practices for error prevention
- Boundaries where Claude may fail
- Sub-agent system and task delegation
- Context management and workflow automation
- CVPerfect-specific techniques

## 🚀 Quick Start Guide

### Essential Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build production bundle (REQUIRED before deployment)
npm run lint             # ESLint validation (TypeScript-aware)
npm run mcp-puppeteer    # Browser automation for testing
node start-agents-system.js  # Auto-start CVPerfect 40-agent system
```

### Development Workflow
1. **Port handling**: Use localhost:3001 if port 3000 is occupied
2. **Before commits**: Always run `npm run build` && `npm run lint`
3. **Testing sequence**: lint → build → test scripts → commit
4. **Context management**: Use `/clear` when context > 70%


## Project Overview

**CVPerfect** is a Next.js 14 application providing AI-powered CV optimization services with a freemium model, Stripe payments, and bilingual support (Polish/English).

### Architecture

**Frontend (Next.js 14):**
- Single-page app with 6000+ line main component (`pages/index.js`)
- Embedded CSS using `<style jsx>` - no external CSS framework
- Glassmorphism design with backdrop-filter effects
- Modal-driven UX with complex state management (20+ variables)
- Bilingual interface with `currentLanguage` state switching
- Deterministic client-side statistics using hash-based random generation

**Payment Flow:**
- Three-tier pricing: Basic (19.99 PLN), Gold (49 PLN), Premium (79 PLN)
- Stripe Checkout integration with webhook validation
- Session persistence through payment process
- Usage limits tracked in Supabase

**AI Processing:**
- Groq SDK with Llama 3.1-70B model for CV optimization
- Chunked processing for long CVs (50k+ characters)
- Photo preservation through optimization process
- Multiple output formats: PDF, DOCX, email delivery

### API Endpoints

**Core Flow:**
- `/api/parse-cv` - PDF/DOCX file parsing and text extraction
- `/api/save-session` - Session data persistence during payment
- `/api/create-checkout-session` - Stripe payment initialization
- `/api/stripe-webhook` - Payment completion and validation
- `/api/get-session-data` - Session retrieval for success page
- `/api/analyze` - Production AI CV analysis (Groq/Llama)
- `/api/demo-optimize` - Testing AI endpoint (no auth required)
- `/api/contact` - Email notifications via Nodemailer

**Critical Data Flow:**
1. User uploads CV → `index.js` → `/api/parse-cv` → `/api/save-session`
2. Payment → Stripe Checkout → `/api/stripe-webhook` → Session update
3. Success page → `success.js` → `/api/get-session-data` → AI optimization

**External Dependencies:**
- Groq SDK (Llama 3.1-70B for AI processing)
- Supabase (user management, usage tracking)
- Stripe (payment processing, webhooks)
- Nodemailer (email delivery)

### Key Technical Patterns

**Styling Approach:**
- No external CSS framework - all styles in JSX using `<style jsx>`
- Glassmorphism design with `backdrop-filter` effects
- Responsive breakpoints: 480px, 768px, 1024px, 1440px
- Touch-optimized mobile interface (44px minimum targets)

**Animation Stack:**
- Framer Motion (page transitions, modal animations)
- GSAP (timeline animations, scroll triggers)
- Canvas Confetti (success celebrations)

**State Management:**
- Complex modal overlay system with step progression
- Language switching affects entire application state
- File upload with drag-and-drop validation
- Deterministic statistics generation (no backend required)

### Environment Variables Required

```bash
GROQ_API_KEY=                          # AI processing (Llama model)
NEXT_PUBLIC_SUPABASE_URL=             # Database connection
SUPABASE_SERVICE_ROLE_KEY=            # Admin database access
STRIPE_SECRET_KEY=                    # Payment processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # Frontend payment integration
STRIPE_WEBHOOK_SECRET=                # Payment webhook validation
GMAIL_USER=                           # Email delivery
GMAIL_PASS=                           # Gmail app password
NEXT_PUBLIC_BASE_URL=                 # Production URL for Stripe redirects
```

### Testing and Browser Automation

**Puppeteer Integration:**
- MCP server configured for Claude Code browser automation
- **Auto-start configured** - MCP Puppeteer starts automatically when connecting to project
- **Headless mode** - Browser runs invisibly in background for performance
- **No UI distractions** - All browser automation happens without visible windows
- Test scripts available: `test-responsive.js`, `test-forms.js`, `test-main-page.js`, `test-website.js`
- Screenshot generation for visual testing (saved to files)
- Configuration in `.claude/settings.json` enables automatic MCP server startup
- Manual startup: `npm run mcp-puppeteer`

**CVPerfect Agents System:**
- **Auto-start configured** - CVPerfect agents system starts automatically with each Claude Code session
- **40 specialized agents** - Backend, frontend, security, optimization, testing, and business intelligence agents
- **Supreme Orchestrator** - Central coordination system managing all agents
- **Background execution** - Runs seamlessly without interrupting workflow
- **Hook configuration** - Session-start hook in `.claude/settings.json` ensures automatic startup
- **Claude Integration** - Claude Code automatically delegates CVPerfect tasks to specialized agents
- **Smart task routing** - Automatic agent selection based on task keywords and context
- **Fallback system** - Falls back to Claude Code tools when agents are unavailable
- Manual startup: `node start-agents-system.js`
- Integration test: `node test-agents-integration.js`

**Agent Task Mapping:**
- **Frontend**: React, components, JSX, CSS, responsive design → `frontend_development`
- **Backend**: API, endpoints, database, Stripe, payments → `backend_api`
- **CV Optimization**: CV analysis, ATS scoring, templates → `ats_optimization`, `cv_content_analysis`
- **Security**: Authentication, GDPR, data protection → `api_security`, `gdpr_compliance`
- **Performance**: Optimization, caching, speed → `performance_monitor`, `cache_optimization`
- **Testing**: Bug fixes, QA, debugging → `testing_qa`, `auto_fix`
- **Business**: Analytics, marketing, SEO → `data_analytics_insights`, `marketing_automation`

**Performance Considerations:**
- Bundle size optimized by removing unused dependencies
- Responsive images and lazy loading implemented  
- CSS-in-JS approach for component-scoped styling

### File Organization

```
pages/
├── index.js          # Main SPA (6000+ lines) - CV upload, payment flow
├── success.js        # Post-payment CV optimization and templates
├── kontakt.js        # Contact page
├── api/
│   ├── analyze.js           # Main AI CV analysis (production)
│   ├── demo-optimize.js     # Demo AI endpoint (testing)
│   ├── create-checkout-session.js  # Stripe payment init
│   ├── stripe-webhook.js    # Payment completion handler
│   ├── get-session-data.js  # Session retrieval for success page
│   ├── save-session.js      # Session persistence during flow
│   └── parse-cv.js          # PDF/DOCX file parsing
└── [legal pages]     # Privacy, terms, GDPR (regulamin.js, etc.)

agents/                # 40+ agent system for specialized tasks
├── orchestration/     # Master orchestrators and coordinators
├── core/              # Backend, frontend, DevOps agents  
├── ai_optimization/   # CV analysis, ATS scoring, content
├── debug/             # 6-agent debug system (File Reader, Bug Fixer, Supervisor + 3 Masters)
│   ├── root_cause_analysis_master.js      # Five Whys, Fishbone, FMEA methodology
│   ├── ai_debugging_copilot_master.js     # AI-powered debugging with pattern recognition
│   └── systematic_debugging_master.js     # 8-phase structured debugging process
└── [specialized]/     # Security, performance, business, quality agents

components/
├── CVAnalysisDashboard.js  # Results display
├── PremiumCVAnalysis.js    # Premium features
└── Footer.js               # Site footer
```

### Styling Approach

- **No external CSS framework** - All styles embedded in JSX
- **Glassmorphism design** - Heavy use of backdrop-filter and transparency
- **CSS Custom Properties** - Consistent color scheme and spacing
- **Media queries** - Responsive breakpoints defined per component

### Development Notes

- **Build errors** - Watch for syntax issues in large JSX files
- **State complexity** - Main component manages 20+ state variables
- **Modal system** - Complex overlay management with step progression
- **File handling** - PDF/DOCX parsing capabilities built-in
- **Internationalization** - Manual translation system, not using i18n library

## Recent Major Updates (August 2025)

### ✅ Success.js Complete Redesign
**Status: COMPLETED AND FULLY FUNCTIONAL**

**Design Improvements:**
- Applied glassmorphism design pattern from `regulamin.js` for visual consistency
- Premium sections with `backdrop-filter: blur(30px) saturate(200%)` effects
- Gradient borders, hover animations, and professional styling
- Responsive template cards with lock states for plan hierarchy

**CV Template Overhaul:**
- **Tech Template**: Terminal-style design with circuit patterns, cyan color scheme, developer@portfolio interface
- **Luxury Template**: Premium executive styling with amber/gold gradients, diamond patterns, numbered sections
- **Minimal Template**: Ultra-clean design with geometric accents, extralight typography, dot indicators
- **All Templates**: Now support profile photos with professional styling

**AI Optimization System:**
- **FULL CV PROCESSING**: AI now receives complete CV data (1000+ characters) including all sections
- **Photo Preservation**: Images are maintained throughout the optimization process
- **Smart Endpoint Routing**: Demo endpoint for testing, production endpoint for paying users
- **Enhanced Parsing**: Multiple pattern recognition for experience, skills, education extraction
- **Quality Assurance**: All 6/6 core functions tested and verified working

**Template Access Hierarchy:**
- **Basic Plan**: 1 template (Simple only)
- **Gold Plan**: 3 templates (Simple, Modern, Executive)
- **Premium Plan**: 7 templates (All templates including Tech, Luxury, Minimal)

**Core Functions Status:**
- ✅ AI Optimization: Complete CV processing with photo preservation
- ✅ PDF Export: html2canvas with professional rendering
- ✅ DOCX Export: Full document structure with styling
- ✅ Email Function: Modal-based sending system
- ✅ Template Switching: Real-time preview updates
- ✅ Responsive Design: Mobile-optimized with proper touch targets

### Test Files Created
- `test-success-redesign.js`: Design pattern validation
- `test-ai-optimization.js`: AI functionality comprehensive testing
- `test-all-success-functions.js`: Complete function verification
- Screenshots: Visual documentation of improvements

### Important Context for Future Sessions
**What was accomplished:** Complete success.js redesign with glassmorphism UI, professional CV templates, full AI optimization (processes entire CV + preserves photos), and verified all 6 core functions working perfectly.

**Current State:** All requested improvements implemented and tested. Success.js is production-ready with premium UX matching regulamin.js design consistency.

## 🚀 Current Development Status (August 2025)

### ⚡ Payment Flow Optimization - Branch: `hotfix/payment-optimization-fix`
**Status: IN PROGRESS**

**Recent Accomplishments:**
- ✅ **Complete Payment Flow Fixed**: All plans (Basic, Gold, Premium) now working correctly
- ✅ **Template Selection Loop Fixed**: Resolved infinite loop for Gold/Premium plan access
- ✅ **Enhanced Security**: Added `lib/auth.js`, `lib/cors.js`, `lib/validation.js` for improved API security
- ✅ **Error Handling**: Implemented `lib/error-responses.js` and `lib/timeout-utils.js` for robust error management
- ✅ **Request Limiting**: Added `lib/request-limits.js` for API rate limiting and abuse prevention

**Key Infrastructure Improvements:**
- **ESLint Integration**: TypeScript-aware linting with `next/core-web-vitals` standards
- **Error Boundary**: Added `components/ErrorBoundary.js` for better React error handling
- **Session Management**: Enhanced session persistence and retrieval reliability
- **API Security**: CORS policies, authentication middleware, request validation

**Files Modified in Current Branch:**
- `pages/success.js` - Post-payment flow optimizations
- All `/api/*` endpoints - Enhanced security and error handling
- `lib/` directory - New utility modules for security and reliability
- `package.json` - Dependency updates for security improvements

**Known Working Features:**
- ✅ CV Upload & Parsing (PDF/DOCX)
- ✅ Stripe Payment Flow (all plans)
- ✅ AI Optimization (Groq API integration)
- ✅ Template System (7 templates, plan-based access)
- ✅ Export Functions (PDF, DOCX, Email)
- ✅ Session Data Persistence

## 🔧 FAZA DEBUG SUCCESS.JS - SIERPIEŃ 2025

### ✅ UKOŃCZONE FAZY:
- **FAZA 1**: System 3 agentów debug (File Reader, Bug Fixer, Supervisor) - agents/debug/
- **FAZA 2**: Critical fixes (infinite loops, useEffect cleanup, memory leaks)
- **FAZA 3**: Real CV loading (Konrad Jakóbczak CV ładuje się poprawnie zamiast demo)

### 🎯 CHECKPOINT STATUS:
- ✅ **CHECKPOINT 1**: Agenci uruchamiają się (6/6 tests passed)
- ✅ **CHECKPOINT 2**: Brak infinite loops i crashy (wszystkie testy OK)
- ✅ **CHECKPOINT 3**: Prawdziwe CV się ładuje (3305 chars, wszystkie dane detected)

### 🔧 KLUCZOWE NAPRAWKI ZASTOSOWANE:
1. **Infinite Loop Fix**: `fetchUserDataFromSession` - dodano MAX_RETRIES, timeout protection
2. **Memory Leak Fix**: useEffect cleanup function - clear timers/intervals
3. **Hoisting Issue Fix**: zmiana `enhancedFetchUserDataFromSession` → `fetchUserDataFromSession`
4. **CV Data Flow Fix**: bezpośrednie ustawianie `initialCVData` przed AI optimization
5. **Name Extraction**: regex dla polskich znaków - wyodrębnia "Konrad Jakóbczak"

### 📁 WAŻNE PLIKI UTWORZONE/ZMODYFIKOWANE:
- `agents/debug/file_reader_agent.js` - Agent #1 (analiza plików)
- `agents/debug/bug_fixer_agent.js` - Agent #2 (naprawki)  
- `agents/debug/supervisor_agent.js` - Agent #3 (koordynacja)
- `start-debug-agents.js` - launcher systemu
- `test-debug-agents.js` - testy agentów
- `test-real-cv-loading.js` - weryfikacja CV
- `pages/success.js` - naprawiony (BACKUPY: success.js.backup-*)

### 🔍 ZDIAGNOZOWANE PROBLEMY:
- **Root cause**: useEffect wywoływał niewłaściwą funkcję (hoisting issue)
- **API działało**: `/api/get-session-data` poprawnie zwracał CV data
- **Problem w frontend**: dane nie trafiały do UI state
- **Solution**: bezpośrednie ustawianie CV data w fetchUserDataFromSession

### 📊 TEST RESULTS:
- **Real CV loading**: ✅ Konrad name, UPS, Zamość detected
- **No demo data**: ✅ Anna Kowalska absent  
- **Content length**: 3305 chars (vs 702 before)
- **Performance**: 199MB memory, no crashes

### 🎯 POZOSTAŁE ZADANIA (DO KONTYNUACJI):
- FAZA 3: sessionStorage fallback + cache management
- FAZA 4: UI/UX (modal state, notifications, export PDF/DOCX)
- FAZA 5: Final testing + dokumentacja

### 💡 WAŻNE NOTATKI:
- System 3 agentów działa bezbłędnie - można używać ponownie
- fetchUserDataFromSession ma teraz proper retry logic
- Prawdziwe CV (sess_1755865667776_22z3osqrw) testowane i działa
- Server na localhost:3001 (port 3000 zajęty)

### 🚨 CURRENT DEBUGGING STATUS (August 2025)
**Template Loading Issue Detected:**
- Debug logs show `hasFullContent: false` in CV Display component
- Template receives no data, shows loading state instead of CV content
- Issue appears to be in data flow from session to UI components
- Server running on localhost:3001 due to port 3000 being occupied

## 🎯 NEW: ADVANCED DEBUGGING MASTERS (August 2025)

### 🔍 ROOT CAUSE ANALYSIS MASTER
**File**: `agents/debug/root_cause_analysis_master.js`
**Metodologie**: Five Whys + Fishbone + FMEA + Comprehensive RCA

**Capabilities**:
- **Five Whys Analysis**: Iteracyjne pytania "dlaczego?" z CVPerfect-specific patterns
- **Fishbone (Ishikawa) Diagram**: Multi-category cause analysis (People, Process, Technology, Environment)
- **FMEA Analysis**: Proactive failure mode identification and risk assessment
- **Pattern Recognition**: CVPerfect-specific patterns (session loss, infinite retry, payment issues)
- **Root Cause Consolidation**: Multi-methodology analysis z confidence scoring

**Usage Example**:
```javascript
const rcaMaster = new RootCauseAnalysisMaster();
await rcaMaster.performComprehensiveRCA(problem, context);
```

### 🤖 AI DEBUGGING COPILOT MASTER
**File**: `agents/debug/ai_debugging_copilot_master.js`
**Inspirowany**: GitHub Copilot 2025 + AI-driven debugging trends

**Capabilities**:
- **AI Pattern Recognition**: 50+ debugging patterns w database (React, CVPerfect, Security)
- **Automated Fix Suggestions**: AI-generated solutions z confidence scoring
- **Code Analysis**: Static analysis z performance, security, React anti-patterns detection
- **Historical Learning**: Pattern learning z successful debugging sessions
- **Automated Fix Application**: Code fixes dla automatable patterns
- **Intelligent Context**: CVPerfect-aware debugging z domain knowledge

**Key Features**:
- Pattern confidence scoring (0.8-0.98 dla CVPerfect patterns)
- 7 categories: React, CVPerfect, Payment, Performance, Security, API, Memory
- Success rate tracking i learning z outcomes
- Effort estimation (low/medium/high) dla każdy fix

### ⚙️ SYSTEMATIC DEBUGGING MASTER  
**File**: `agents/debug/systematic_debugging_master.js`
**Metodologia**: 8-Phase Structured Debugging Process

**8-Phase Process**:
1. **Problem Definition & Scope**: Severity assessment, impact analysis, boundaries
2. **Information Gathering**: Environment, system state, logs, recent changes
3. **Hypothesis Generation**: Likelihood-based hypothesis ranking
4. **Test Case Design**: Reproduction, isolation, boundary, performance tests
5. **Systematic Testing**: Hypothesis validation through testing
6. **Root Cause Identification**: Evidence-based cause determination
7. **Solution Implementation**: Systematic fix implementation z rollback plan
8. **Validation & Prevention**: Regression prevention i monitoring

**Features**:
- **Checkpoint System**: Rollback capability na każdym etapie
- **CVPerfect Integration Tests**: Payment flow, session recovery, AI API tests
- **Risk Assessment**: Implementation risk analysis
- **Regression Prevention**: Comprehensive test suite dla prevention

## 🛡️ REGRESSION PREVENTION SYSTEM

### CRITICAL SYSTEM INVARIANTS (NIGDY nie mogą się zepsuć)

**Core User Journey:**
1. **CV Upload** - Users must be able to upload PDF/DOCX files via drag-drop or file picker
2. **Payment Processing** - Stripe checkout flow (create-checkout-session → webhook → success)
3. **AI Optimization** - Groq API integration and CV processing functionality
4. **Template Rendering** - All CV templates must render correctly with user data
5. **File Export** - PDF and DOCX export functions must work for all templates
6. **Session Management** - Session data persistence and retrieval through all stages

**Technical Invariants:**
- `pages/index.js` main SPA functionality (6000+ lines) - critical state management
- `pages/success.js` post-payment flow - template switching, AI optimization, exports
- API endpoints: `/api/analyze`, `/api/create-checkout-session`, `/api/get-session-data`
- Supabase connection for user management and usage tracking
- Environment variables access (Groq API, Stripe keys, Supabase credentials)

### KNOWN REGRESSION PATTERNS

**❌ High-Risk Patterns Identified:**
1. **UseEffect Infinite Loops** - Common in `pages/success.js` when modifying data fetch logic
2. **Session Data Loss** - Changes to API endpoints can break session persistence
3. **Template Switching Breaks** - UI state management issues when adding new templates
4. **Payment Flow Interruption** - Stripe webhook modifications can break payment confirmation
5. **AI Optimization Failures** - Groq API changes can break CV processing
6. **Mobile Responsiveness Loss** - CSS modifications can break responsive design
7. **Modal State Conflicts** - Overlay management issues when adding new modal functionality

**Specific CVPerfect Vulnerabilities:**
- **File Upload State**: Changes to drag-drop handlers often break file processing
- **Language Switching**: Modifications to `currentLanguage` state affect entire app
- **Statistics Generation**: Deterministic random number logic is fragile
- **Agent System Integration**: Hooks modifications can break 40-agent system startup

### TEST VALIDATION REQUIREMENTS

**MANDATORY Tests Before Any Change:**

**Level 1 - Critical Path Tests (MUST PASS):**
```bash
npm run build                           # Build must succeed
npm run lint                           # No lint errors
node test-complete-functionality.js    # End-to-end user journey
```

**Level 2 - Core Component Tests:**
```bash
# CV Upload Functionality
node test-cv-flow.js                  # Upload → Processing → Results

# Payment System
node test-stripe-payment-flow.js      # Checkout → Webhook → Success

# Template System  
node test-all-success-functions.js    # All 6 template functions working

# Agent Integration
node test-agents-integration.js       # CVPerfect agents system
```

**Level 3 - Regression Detection:**
```bash
# Visual Regression
node test-responsive.js               # All breakpoints working
node test-comprehensive-website.js    # Full UI/UX validation

# API Integration
node test-api-endpoints.js            # All backend endpoints
node test-sessionStorage.js           # Data persistence
```

### REGRESSION PREVENTION WORKFLOW

**BEFORE Making Any Changes:**
1. **Create git branch**: `git checkout -b fix/[issue-description]`
2. **Run baseline tests**: Execute all Level 1 tests and document results
3. **Create test snapshot**: Document current working state
4. **Identify impact area**: Which components/APIs will be affected?

**DURING Implementation:**
1. **Use ultrathink prompt**: "Ultrathink: Implement [change] WITHOUT breaking [critical-invariants-list]"
2. **Checkpoint commits**: `git commit -m "checkpoint: [step-description]"` after each working step
3. **Incremental testing**: Run relevant tests after each major change
4. **Use TodoWrite**: Track exactly what's working and what needs testing

**AFTER Implementation:**
1. **Full regression suite**: Run all Level 1, 2, and 3 tests
2. **Compare with baseline**: Identify any changed test results
3. **Visual verification**: Screenshot comparison for UI changes
4. **Document changes**: Update CLAUDE.md if new patterns discovered

**Emergency Rollback Procedure:**
```bash
git stash                           # Save current work
git checkout main                   # Return to known good state  
git branch -D fix/[branch-name]     # Delete failed branch
# Or: git reset --hard [last-good-commit-hash]
```

**Integration with Existing Systems:**
- **CVPerfect Agents**: Delegate testing to specialized `testing_qa` agent
- **MCP Puppeteer**: Use for automated browser testing during changes
- **Sub-Agents**: Use `general-purpose` agent for regression analysis

### AUTOMATED SAFEGUARDS

**Git Hooks Configuration** (in `.claude/hooks/`):
- `pre-edit.sh` - Run critical tests before any file modification
- `post-edit.sh` - Lint and basic validation after changes
- `pre-commit.sh` - Full regression suite before git commit

**Claude Code Commands** (in `.claude/commands/`):
- `/safe-fix` - Implement fix with full regression protection
- `/regression-check` - Compare current state with known good baseline
- `/rollback-to-safe` - Emergency revert to last known working state

**Auto-Testing Triggers:**
- Tests run automatically on file changes to critical paths
- Snapshot comparison after each working session  
- Daily regression reports for accumulated changes