# cmoxpert

**Client Portfolio Intelligence Platform for FinTech Marketing Consultants**

> **⚠️ BETA STATUS:** cmoxpert is currently in early access beta. Core features are production-ready, while some advanced features are under active development. See [Current Capabilities](#current-capabilities) for detailed feature status.

## What is cmoxpert?

cmoxpert is a client portfolio management platform built specifically for marketing consultants, fractional CMOs, and agencies serving FinTech companies. Manage multiple clients in one centralized dashboard, track marketing performance across portfolios, and generate professional client reports.

## The Problem We Solve

Marketing consultants managing multiple FinTech clients face unique challenges:

- **Data scattered across platforms** - Spreadsheets, Google Analytics, ad platforms, CRMs
- **Time-consuming reporting** - 10-15 hours per week just gathering data
- **No unified view** - Hard to spot patterns across client portfolios
- **Compliance complexity** - FinTech regulations (FCA, SEC, FINRA) require careful review
- **Client retention** - Proving ROI and value is critical for renewals

cmoxpert centralizes client data, automates reporting, and provides compliance checking specific to FinTech marketing.

## Current Capabilities

### ✅ Production Ready (Fully Functional)

**Client Portfolio Management**
- Multi-client dashboard for consultants and agencies
- Advanced client search with full-text capabilities
- Client contracts, health scores, and meeting tracking
- Role-based access control
- Real-time data sync across all views

**Revenue Attribution System**
- 6 attribution models: First Touch, Last Touch, Linear, Time Decay, U-Shaped, W-Shaped
- Advanced ML attribution: Shapley Value and Markov Chain models
- Deal pipeline tracking with stage velocity analysis
- Multi-touch attribution across all marketing channels
- Automated ROI calculations per channel

**Fraud Impact Analysis**
- Channel-level fraud rate calculations
- Clean CAC vs. Dirty CAC analysis
- Fraud waste quantification by marketing source
- Automated recommendations for budget reallocation
- *Requires integration with your fraud detection data*

**Compliance Checker**
- Regex-based rule checking for FCA, SEC, FINRA regulations
- 20+ predefined compliance rules
- Severity categorization (Critical, High, Medium, Low)
- Real-time campaign content scanning
- Rule-based analysis (not AI)

**Report Generation**
- Client-ready marketing reports
- Market analysis documentation
- Performance dashboards
- Export functionality

**User Management**
- Secure authentication with Supabase Auth
- Profile management
- Multi-user support
- Session management

### 🔄 Beta (Functional with Limitations)

**AI-Assisted Playbook Generation**
- Generates marketing playbooks for clients
- **Without OpenAI API key:** Uses sophisticated template-based generation
- **With OpenAI API key:** Full AI-powered personalized playbooks
- Template quality is production-ready for MVP use
- See [AI Setup Guide](./AI_SETUP_GUIDE.md) for configuration

**Market Analysis Generation**
- Client market opportunity analysis
- Competitive landscape overview
- Strategic recommendations
- **Without OpenAI API key:** Template-based analysis
- **With OpenAI API key:** AI-powered custom analysis

**Data Integrations**
- OAuth flows for Google Ads, Meta Ads, Google Analytics
- Token management and refresh
- Basic data sync capabilities
- *Full sync depth under active development*

**Competitive Intelligence**
- Competitor tracking database
- Alert system architecture
- Manual data entry and display
- *Automated scraping coming in Q2 2025*

### 🚧 In Development (Not Yet Functional)

**Real-Time Fraud Detection**
- Live API integration with fraud providers
- Automated fraud event capture
- *Estimated completion: Q2 2025*

**Automated Budget Optimization**
- ML-based spend reallocation recommendations
- Predictive performance modeling
- *Estimated completion: Q3 2025*

**Advanced Workflow Automation**
- Multi-step workflow builder
- Conditional logic and branching
- *Estimated completion: Q2 2025*

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Authentication:** Supabase Auth with JWT
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **AI (Optional):** OpenAI GPT-4 for analysis and playbook generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Optional: OpenAI API key for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cmoxpert.git
cd cmoxpert

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Apply database migrations
# Run each migration file in supabase/migrations/ through Supabase Dashboard SQL Editor

# Start development server
npm run dev
```

### Environment Variables

Required variables in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional for AI features:
- Configure `OPENAI_API_KEY` in Supabase Edge Function environment (not in .env)
- See [AI Setup Guide](./AI_SETUP_GUIDE.md) for details

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Route pages (Dashboard, Analytics, etc.)
├── lib/              # Utilities, Supabase client, error handling
├── hooks/            # Custom React hooks
├── contexts/         # React context providers
└── styles/           # Global styles and Tailwind config

supabase/
├── migrations/       # Database schema migrations (50+ tables)
└── functions/        # Edge functions for AI analysis
```

## Key Features for Consultants

### Multi-Client Portfolio Management
- Centralized dashboard for all clients
- Quick client switching
- Portfolio-level analytics
- Health score tracking
- Contract and meeting management

### Client Reporting
- Professional, client-ready reports
- Market analysis with competitive intelligence
- AI-assisted strategic playbooks
- Performance dashboards
- Export and sharing capabilities

### FinTech-Specific Features
- Fraud impact analysis
- Compliance checking (FCA, SEC, FINRA)
- Activation funnel analysis
- Revenue attribution (not just lead attribution)
- CAC optimization across the full funnel

### Time Savings
- Automated data collection (when integrations are configured)
- Template-based or AI-powered report generation
- Centralized client data vs. scattered spreadsheets
- Estimated time savings: 10-15 hours per week per consultant

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Deployment

The platform is optimized for deployment on:

- **Netlify** (recommended) - Built-in CI/CD, edge functions support
- **Vercel** - Optimized for React applications
- **Any static host** - Just deploy the `dist/` folder

See [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

## Architecture

### Frontend
- React 18 with TypeScript for type safety
- Component-based architecture with clear separation of concerns
- Lazy loading for optimal bundle sizes
- Error boundaries for graceful error handling

### Backend
- Supabase PostgreSQL with 50+ tables
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Edge functions for AI-powered analysis

### Security
- JWT-based authentication
- Database-level security with RLS policies
- Environment variable protection
- Supabase SOC 2 compliance

## Target Market

### Primary Audience: Marketing Consultants & Agencies

**Ideal Users:**
- Fractional CMOs managing 3-10 FinTech clients
- Marketing consultants specializing in FinTech
- Growth agencies with FinTech portfolios
- Independent marketing consultants
- Small teams managing multiple clients

**Client Industries:**
- Neobanks and digital banks
- Payment processors and platforms
- Lending platforms (consumer & business)
- Wealth management and investment apps
- Crypto and blockchain financial services
- B2B financial software companies

### Secondary Audience: In-House Teams

**Suitable For:**
- Small FinTech marketing teams (1-5 people)
- Companies needing compliance checking
- Teams wanting better attribution
- Organizations seeking centralized reporting

**Less Suitable For:**
- Enterprise teams with custom BI tools
- Companies needing real-time fraud detection (not yet available)
- Organizations requiring automated budget optimization (in development)

## Beta Pricing

> **Note:** Pricing subject to change. Early adopters receive locked-in rates for 12 months.

- **Beta Access**: Free for first 50 users
- **Starter**: $199/month (up to 3 clients)
- **Professional**: $399/month (up to 10 clients)
- **Agency**: $699/month (up to 25 clients)

Pricing increases to standard rates after beta period.

## Documentation

- [Current Capabilities](./CURRENT_CAPABILITIES.md) - Feature status matrix
- [AI Setup Guide](./AI_SETUP_GUIDE.md) - Configure AI features
- [Backend Setup Guide](./BACKEND_SETUP_GUIDE.md) - Database and edge functions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Security Checklist](./SECURITY_CHECKLIST.md) - Security best practices

## Roadmap

### Q1 2025 (Current)
- ✅ Core portfolio management
- ✅ Revenue attribution system
- ✅ AI-assisted report generation
- ✅ Compliance checking
- 🔄 Beta launch and user feedback

### Q2 2025
- Real-time fraud detection API integration
- Advanced workflow automation
- Automated competitive intelligence scraping
- Mobile app (iOS/Android)
- Enhanced data integrations

### Q3 2025
- ML-based budget optimization
- Predictive analytics
- White-label options for agencies
- Advanced forecasting models
- API access for custom integrations

## Contributing

This is a commercial project currently in private beta. For bug reports or feature requests, please contact:
- Email: support@cmoxpert.com
- GitHub Issues: (for beta testers only)

## License

Proprietary - All rights reserved

## Support

**For Beta Users:**
- Email: support@cmoxpert.com
- Response time: 24-48 hours
- Dedicated Slack channel for beta testers

**Documentation:**
- Setup guides in repository
- Video tutorials (coming soon)
- Knowledge base (under construction)

---

**cmoxpert** - Client Portfolio Intelligence for FinTech Marketing Consultants

*Built by marketers, for marketers. Currently in beta.*
