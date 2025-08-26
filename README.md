# CVPerfect - AI-Powered CV Optimization Platform
Updated: 2025-08-26 - Chained Agent Orchestration System Active
Latest: Added export endpoint with payment gating validation
Hook Test: Verified PreToolUse and PostToolUse hook integration

## 🚀 Overview

CVPerfect is a Next.js 14-based AI-powered CV optimization platform that helps users create professional, ATS-optimized resumes. The platform features a freemium model with Stripe payments, Polish/English language support, and advanced AI analysis powered by Groq's Llama 3.1-70B model.

## 📋 API Endpoints

### Health Check Endpoints

**GET /api/health**

Returns the current health status of the CVPerfect API with comprehensive system information.

**GET /api/ping**

Simple ping endpoint for basic availability checks. Returns a lightweight response to verify API connectivity.

#### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2025-08-26T10:30:45.123Z",
  "service": "CVPerfect API",
  "version": "1.0.0",
  "orchestration": "chained_agent_system_active",
  "uptime": 1234.56,
  "memory": {
    "used": 45,
    "total": 128
  },
  "environment": "development",
  "checks": {
    "database": "connected",
    "stripe": "configured",
    "groq": "ready"
  }
}
```

#### Ping Endpoint Response Format

**GET /api/ping**

```json
{
  "pong": true
}
```

#### Ping Response Fields

- `pong`: Always returns `true` indicating successful connectivity

#### Ping Error Responses

**405 Method Not Allowed**
```json
{
  "error": "Method not allowed"
}
```

#### Response Fields

- `status`: Health status ("healthy" or "unhealthy")
- `timestamp`: ISO 8601 timestamp of the response
- `service`: Service name identifier
- `version`: API version
- `orchestration`: Agent system status
- `uptime`: Process uptime in seconds
- `memory`: Memory usage in MB (used/total)
- `environment`: Current environment (development/production)
- `checks`: Status of key service integrations

#### Error Responses

**405 Method Not Allowed**
```json
{
  "error": "Method POST Not Allowed",
  "allowed": ["GET"]
}
```

**503 Service Unavailable** (Internal Error)
```json
{
  "status": "unhealthy",
  "timestamp": "2025-08-26T10:30:45.123Z",
  "service": "CVPerfect API",
  "error": "Internal health check failed"
}
```

## 🧪 Testing

### Endpoint Tests

Run the comprehensive health endpoint test suite:

```bash
node test-health-endpoint.js
```

Run the ping endpoint test suite:

```bash
node test-ping-endpoint.js
```

#### Test Coverage

The test suite validates:

1. **Status Code Validation** - Ensures 200 response
2. **Response Structure** - Validates all required fields
3. **Data Types** - Confirms correct field types
4. **Service Information** - Verifies service name and version
5. **System Metrics** - Tests memory and uptime reporting
6. **Health Checks** - Validates service integration status
7. **Method Handling** - Tests 405 responses for invalid methods
8. **Error Messages** - Validates error response format

#### Sample Test Output

```
🚀 CVPerfect Health Endpoint - Comprehensive Test Suite
============================================================

🧪 Testing GET /api/health...
✅ Status Code 200: Got 200
✅ Required Fields Present: Fields: status, timestamp, service, version, orchestration, uptime, memory, environment, checks
✅ Status is Healthy: Status: healthy
✅ Service Name Correct: Service: CVPerfect API
✅ Memory Info Present: Memory: {"used":45,"total":128}
✅ Uptime Present: Uptime: 1234.56s
✅ Health Checks Present: Checks: {"database":"connected","stripe":"configured","groq":"ready"}

🧪 Testing invalid method (POST)...
✅ Method Not Allowed Status: Got 405
✅ Error Message Present: Error: Method POST Not Allowed
✅ Allowed Methods Specified: Allowed: ["GET"]

📊 TEST SUMMARY
==============================
Total Tests: 10
Passed: 10
Failed: 0
Pass Rate: 100%

🎉 All tests passed! Health endpoint is working perfectly.
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: Groq SDK with Llama 3.1-70B
- **File Processing**: PDF-Parse, Mammoth (DOCX)

### Key Features
- 🤖 AI-powered CV optimization
- 💳 Stripe payment integration (3 tiers)
- 📄 PDF/DOCX parsing and export
- 🌍 Polish/English language support
- 📱 Responsive glassmorphism design
- 🔒 Enterprise-grade security
- 📊 40+ specialized agent system

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Environment variables (see .env.example)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cvperfect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

### Available Scripts

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint validation
npm run test             # Run test suite
```

### Testing Commands

```bash
# Health endpoint test
node test-health-endpoint.js

# Full functionality test
node test-complete-functionality.js

# Success page functions test
node test-all-success-functions.js

# Comprehensive website test
node test-comprehensive-website.js
```

## 🌐 Environment Variables

```bash
# AI Processing
GROQ_API_KEY=your_groq_api_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📚 API Documentation

### Core Endpoints

- `GET /api/health` - System health check
- `GET /api/ping` - Simple connectivity check
- `POST /api/parse-cv` - Parse uploaded CV files
- `POST /api/analyze` - AI-powered CV analysis
- `POST /api/save-session` - Save user session data
- `GET /api/get-session-data` - Retrieve session data
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe-webhook` - Handle payment webhooks

## 🛡️ Security

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure payment processing via Stripe
- Environment variable protection
- XSS and CSRF protection

## 🎯 Agent System

CVPerfect utilizes a sophisticated 40+ agent orchestration system:

- **AI Optimization Agents**: CV analysis and enhancement
- **Debug Agents**: Error detection and resolution
- **Security Agents**: Vulnerability scanning and protection
- **Performance Agents**: Optimization and monitoring
- **Business Agents**: Analytics and compliance

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, email support@cvperfect.com or create an issue in the project repository.

---

**CVPerfect** - Transforming CVs with AI-powered optimization.