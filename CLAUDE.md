# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 WAŻNE: Przeczytaj najpierw CLAUDE_BEST_PRACTICES.md
Przed rozpoczęciem każdej ważnej sesji kodowania, zapoznaj się z plikiem `CLAUDE_BEST_PRACTICES.md` który zawiera:
- Najlepsze praktyki zapobiegania błędom
- Granice gdzie Claude może popełniać błędy
- System sub-agentów i delegacji zadań
- Zarządzanie kontekstem i automatyzacja workflow
- Konkretne techniki dla CVPerfect

## Development Commands

- `npm run dev` - Start Next.js development server on localhost:3000
- `npm run build` - Build production bundle (required before deployment)
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run mcp-puppeteer` - Start Puppeteer MCP server for browser automation

## Architecture Overview

**CvPerfect** is a Next.js 14 application that provides AI-powered CV optimization services. The app uses a freemium model with Stripe integration and operates primarily in Polish with English localization.

### Core Architecture

**Frontend Structure:**
- **Single-page application** - Main functionality concentrated in `pages/index.js` (~6000 lines)
- **Embedded CSS** - All styles are defined within JSX files using `<style jsx>` tags
- **Bilingual support** - Polish (default) and English with `currentLanguage` state management
- **Modal-driven UX** - Primary interactions happen through overlay modals rather than page navigation

**Key State Management:**
- Language switching (`currentLanguage: 'pl' | 'en'`)
- Live statistics generation using deterministic seeded random numbers
- Multi-step form wizard for CV upload and optimization
- File upload with drag-and-drop support

**Payment Integration:**
- Stripe Checkout for premium features
- Freemium model with usage limits stored in Supabase
- Session-based flow: collect CV → payment → optimization

### Backend API Structure

**Core Endpoints:**
- `/api/analyze` - Main CV analysis using Groq AI (Llama model)
- `/api/demo-optimize` - Demo AI optimization endpoint for testing (no user auth required)
- `/api/create-checkout-session` - Stripe payment initialization  
- `/api/stripe-webhook` - Payment completion handling
- `/api/contact` - Email notifications via Nodemailer

**External Services:**
- **Groq SDK** - AI processing using Llama 3.1-70B model
- **Supabase** - User management and usage tracking
- **Stripe** - Payment processing
- **Nodemailer** - Email delivery

### Data Flow

1. **CV Upload** - Users upload CV files (PDF/DOCX) via file picker or drag-drop
2. **Job Matching** - Optional job posting text for targeted optimization
3. **Payment Gateway** - Stripe Checkout for premium features
4. **AI Processing** - Groq API analyzes and optimizes CV content
5. **Results Delivery** - Optimized CV returned as downloadable file

### Technical Patterns

**Live Statistics:**
- Deterministic random number generation using hash functions
- Base stats with daily increments to simulate organic growth
- No backend required - all calculations client-side

**Responsive Design:**
- Mobile-first approach with CSS Grid and Flexbox
- Touch target optimization (44px minimum for mobile)
- Breakpoints: 480px, 768px, 1024px, 1440px

**Animation Libraries:**
- **Framer Motion** - Page transitions and modal animations
- **GSAP** - Timeline animations and scroll triggers
- **Canvas Confetti** - Success celebrations

### Environment Variables Required

```
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
GMAIL_USER=
GMAIL_PASS=
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
├── index.js          # Main SPA (6000+ lines)
├── success.js        # Post-payment success page
├── kontakt.js        # Contact page  
├── api/              # Backend endpoints
└── [legal pages]     # Privacy, terms, GDPR

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