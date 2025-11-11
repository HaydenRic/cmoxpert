# cmoxpert - B2B SaaS Marketing Intelligence Platform

**Manage all your SaaS clients in one dashboard. Track MRR, CAC, LTV, and churn without juggling 10+ logins.**

cmoxpert is a marketing intelligence platform built specifically for **agencies and consultants managing multiple B2B SaaS clients**. Stop wasting 10+ hours per week copying metrics from Stripe dashboards and spreadsheets. Get the full picture in seconds.

---

## 🎯 Built for B2B SaaS Agencies & Consultants

### The Problem We Solve

Managing multiple SaaS clients is painful:
- **10+ different logins** - Separate Stripe accounts, Google Analytics, CRMs for each client
- **Manual reporting hell** - Spending hours every week copying metrics into spreadsheets
- **No attribution visibility** - Can't prove which marketing channels drive MRR growth
- **Context switching** - Constantly jumping between tabs and tools

### The Solution

**One platform. All your SaaS clients. Real-time metrics.**

See MRR, ARR, churn rate, LTV, and CAC for every client without switching tabs. Generate beautiful client reports in seconds, not hours.

---

## ✨ Core Features

### 🎯 SaaS Metrics Dashboard
Track the metrics that actually matter for B2B SaaS:
- **MRR & ARR** - Monthly and annual recurring revenue across all clients
- **Churn Rate** - Customer and revenue churn with cohort analysis
- **LTV & CAC** - Lifetime value and acquisition cost by channel
- **Activation Rate** - Trial-to-paid conversion tracking
- **Retention Curves** - Cohort retention visualization
- **Industry Benchmarks** - Compare clients against SaaS averages

**Integrations:**
- Stripe (automatic MRR/churn tracking)
- Google Analytics (traffic & conversions)
- HubSpot/Salesforce (CRM pipeline data)

### 📊 Marketing Attribution
Prove which channels drive revenue:
- **Multi-touch attribution** - First-touch, last-touch, linear, time-decay models
- **Trial-to-paid tracking** - See which channels convert trials to paying customers
- **Channel CAC** - Calculate acquisition cost by source automatically
- **Revenue attribution** - Connect marketing spend to MRR growth
- **Funnel analysis** - Identify drop-off points in conversion paths

### 📈 MRR Forecasting
AI-powered revenue predictions:
- **3/6/12-month forecasts** - Predict future MRR based on historical data
- **Scenario planning** - "What if churn improves by 2%?" modeling
- **Confidence intervals** - Understand forecast accuracy
- **Growth tracking** - Compare actual vs. projected MRR
- **Expansion revenue** - Track upsells and plan growth

### 📄 Client Reporting
Beautiful reports in seconds:
- **One-click generation** - AI-powered summaries and insights
- **White-label branding** - Add your agency logo and colors
- **Automated delivery** - Schedule monthly/weekly reports
- **Shareable links** - Give clients read-only dashboard access
- **Export options** - PDF, PowerPoint, or live dashboard

### 👥 Multi-Client Management
Built for managing 3-25 SaaS clients:
- **Client portfolio view** - See all clients at a glance
- **Quick switching** - Jump between client dashboards instantly
- **Bulk operations** - Update multiple clients at once
- **Team collaboration** - Assign clients to team members
- **Client notes** - Track context and insights per client

---

## 💰 Pricing

Simple pricing based on how many SaaS clients you manage:

### Starter - $199/month
Perfect for solo consultants
- Up to 3 SaaS clients
- All core features
- Stripe integration
- Email support

### Professional - $399/month ⭐ Most Popular
For growing agencies
- Up to 10 SaaS clients
- Everything in Starter
- White-label reports
- Priority support
- Team collaboration

### Agency - $699/month
For established agencies
- Up to 25 SaaS clients
- Everything in Professional
- Custom integrations
- Dedicated account manager
- API access

**14-day free trial. No credit card required.**

---

## 🚀 Quick Start

### 1. Sign Up
Visit [cmoxpert.com](https://cmoxpert.com) and start your free trial.

### 2. Connect Stripe
Link your clients' Stripe accounts for automatic MRR/churn tracking.

### 3. Add Clients
Import your SaaS client portfolio and start tracking metrics.

### 4. Generate Reports
Create beautiful, branded reports for your clients in one click.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Vite** for fast development

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security** for data isolation
- **Edge Functions** for serverless compute

### Integrations
- **Stripe** - Automatic subscription & revenue tracking
- **Google Analytics** - Traffic and conversion data
- **HubSpot/Salesforce** - CRM pipeline integration
- **OpenAI** (optional) - AI-powered insights

---

## 📚 Documentation

- [Setup Guide](./docs/QUICK_START_DEPLOYMENT.md) - Get up and running in 10 minutes
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Understanding the data model
- [Integration Guide](./docs/INTEGRATION_ARCHITECTURE.md) - Connect your tools
- [API Documentation](./docs/api/README.md) - Build custom integrations

---

## 🎯 Who Is This For?

### Perfect for:
- **SaaS marketing agencies** managing 5-20 clients
- **Fractional CMOs** serving multiple SaaS companies
- **Growth consultants** focused on B2B SaaS
- **Agency teams** needing centralized client dashboards

### Not ideal for:
- Individual SaaS companies (use Baremetrics or ChartMogul instead)
- Agencies serving non-SaaS clients (too specialized)
- Enterprise marketing teams (different needs)

---

## 🔒 Security & Compliance

- **SOC 2 compliant** infrastructure (Supabase)
- **Row-level security** - Clients never see each other's data
- **Encrypted at rest** - All data encrypted in PostgreSQL
- **GDPR compliant** - Full data export and deletion
- **2FA available** - Two-factor authentication for accounts

---

## 🤝 Support

- **Email support** - support@cmoxpert.com (24-hour response)
- **Priority support** - Professional/Agency plans (4-hour response)
- **Documentation** - Comprehensive guides and tutorials
- **Community** - Slack channel for customers

---

## 🗺️ Roadmap

### Coming in Q1 2025
- ✅ Stripe integration (automatic MRR tracking)
- ✅ Multi-client dashboard
- ✅ White-label reports
- 🚧 HubSpot CRM integration
- 🚧 LinkedIn Ads integration

### Planned for Q2 2025
- Google Ads integration
- Cohort retention analysis
- Advanced forecasting models
- Mobile app (iOS/Android)
- API access

### Future
- Salesforce integration
- Custom dashboard builder
- Benchmark database (compare against 1000+ SaaS companies)
- Automated alerts (churn spike, MRR drop, etc.)

---

## 📊 Current Status: Beta

cmoxpert is in active beta with **real customers managing real SaaS portfolios**.

**What works great:**
- Multi-client dashboard
- Revenue attribution and tracking
- Report generation
- Client management
- Basic Stripe integration

**What's coming soon:**
- Full Stripe automation (currently requires some manual data entry)
- HubSpot/Salesforce deep integrations
- Advanced AI insights

---

## 🏗️ Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/cmoxpert.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📝 License

Proprietary software. Not open source.

---

## 🙏 Built For You

cmoxpert was built by a fractional CMO who got tired of managing client metrics in spreadsheets.

If you manage multiple B2B SaaS clients, this tool will save you 10+ hours per week and help you prove your value to clients.

**Questions?** Email hello@cmoxpert.com

---

**© 2025 cmoxpert. Built for B2B SaaS agencies and consultants.**
