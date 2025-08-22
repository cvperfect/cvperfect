# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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