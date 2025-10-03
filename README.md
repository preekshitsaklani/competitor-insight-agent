# CompeteIQ - AI-Powered Competitive Intelligence Tracker

A comprehensive competitive intelligence platform that helps startups monitor competitors' product launches, feature updates, and marketing campaigns across multiple platforms using **Google Gemini Pro AI**.

## 🚀 Features

### Core Functionality
- **Real-time Monitoring**: Track competitor changes across websites and 8+ social media platforms
- **AI-Powered Insights**: **Google Gemini Pro** generates actionable intelligence and sentiment analysis
- **Multi-Channel Alerts**: Receive notifications via Email (SendGrid/Mailgun) or Slack
- **Semantic Change Detection**: Vector database (Pinecone/Weaviate) for intelligent content comparison
- **Comprehensive Coverage**: Monitor Instagram, Facebook, LinkedIn, Twitter/X, Truth Social, BlueSky, and Reddit

### 🤖 AI Capabilities (Google Gemini Pro)
1. **Insight Generation** - Automatically analyze competitor content and generate actionable intelligence
2. **Change Detection** - Compare content versions and identify significant changes
3. **Sentiment Analysis** - Understand tone, competitive stance, and business intent
4. **Feature Extraction** - Extract and analyze features from product announcements
5. **Weekly Digests** - Generate executive summaries of competitive landscape
6. **Battle Cards** - Create competitive battle cards from intelligence data

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **State Management**: React hooks

### Backend API (To Be Implemented)
- **Framework**: Python FastAPI
- **Task Queue**: Celery with Redis/RabbitMQ
- **AI Engine**: Google Gemini API with LangChain orchestration

### Data Layer (To Be Implemented)
- **Primary Database**: PostgreSQL (Cloud SQL)
- **Vector Database**: Pinecone or Weaviate
- **Caching**: Redis

### Data Ingestion (To Be Implemented)
- **Web Scraping**: Scrapy for large-scale crawling
- **Dynamic Content**: Playwright for JavaScript-heavy sites
- **Scheduling**: Celery for periodic tasks

### Deployment (To Be Implemented)
- **Containerization**: Docker
- **Platform**: Google Cloud Run, Cloud Functions
- **Email Service**: SendGrid or Mailgun

## 📋 Prerequisites

- Node.js 18+ or Bun
- npm, pnpm, yarn, or bun package manager

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd compete-iq
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
# Google Gemini API (REQUIRED for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Dashboard homepage
│   ├── competitors/             # Competitor management
│   ├── insights/                # AI insights display
│   ├── settings/                # Settings & preferences
│   ├── login/                   # Authentication
│   └── signup/                  # User registration
├── components/
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardHeader.tsx
│   │   ├── Navigation.tsx
│   │   ├── StatsCards.tsx
│   │   ├── RecentInsights.tsx
│   │   └── QuickSettings.tsx
│   ├── competitors/             # Competitor components
│   │   ├── CompetitorList.tsx
│   │   └── AddCompetitorDialog.tsx
│   ├── insights/                # Insights components
│   │   ├── InsightsFilter.tsx
│   │   └── InsightsList.tsx
│   ├── settings/                # Settings components
│   │   ├── NotificationSettings.tsx
│   │   ├── IntegrationSettings.tsx
│   │   └── AccountSettings.tsx
│   └── ui/                      # Shadcn/UI components
└── lib/                         # Utility functions
```

## 🎯 Usage

### Testing AI Features

Visit the **AI Demo** page at `/ai-demo` to test:
- Generate insights from competitor content
- Detect changes between content versions
- Analyze sentiment and competitive stance

### Adding Competitors
1. Navigate to the **Competitors** page
2. Click "Add Competitor"
3. Enter company details and select platforms to monitor
4. Add social media account URLs
5. Set monitoring frequency (Real-time, Daily, Weekly)

### Viewing Insights
1. Go to the **Insights** page
2. Use filters to narrow down by:
   - Competitor
   - Platform
   - Type (Product Launch, Feature Update, etc.)
   - Priority (High, Medium, Low)
   - Date Range
3. Review AI-generated summaries and key points
4. Click "Create Action Item" for important insights

### Configuring Notifications
1. Visit **Settings** → **Notifications**
2. Toggle Email and/or Slack notifications
3. Set digest frequency (Real-time, Daily, Weekly)
4. Choose preferred delivery time
5. Select which alert types to receive

### Setting Up Integrations
1. Go to **Settings** → **Integrations**
2. Connect Slack workspace
3. Configure email service (SendGrid/Mailgun)
4. Set up webhooks for custom integrations
5. Generate API keys for programmatic access

## 🔐 Authentication

The application includes:
- Email/Password authentication
- OAuth support (Google, GitHub)
- Password reset functionality
- Remember me option
- Protected routes (to be implemented with backend)

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Automatic theme switching
- **Accessible**: WCAG compliant components
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

## 🔄 Next Steps (Backend Integration)

To complete the full-stack application:

1. **Backend API Development**
   - Set up FastAPI server
   - Implement authentication with JWT
   - Create RESTful endpoints for CRUD operations
   - Add rate limiting and security middleware

2. **Data Ingestion Pipeline**
   - Configure Scrapy spiders for website monitoring
   - Set up Playwright for dynamic content
   - Implement social media API integrations
   - Create Celery tasks for scheduled scraping

3. **AI Integration**
   - Connect Google Gemini API
   - Set up LangChain for data processing
   - Implement vector embeddings
   - Configure Pinecone/Weaviate

4. **Database Setup**
   - Design PostgreSQL schema
   - Set up migrations
   - Configure connection pooling
   - Implement data seeding

5. **Notification Services**
   - Integrate SendGrid/Mailgun
   - Set up Slack webhooks
   - Create email templates
   - Implement delivery scheduling

6. **Deployment**
   - Dockerize applications
   - Set up Google Cloud Run
   - Configure Cloud Functions
   - Set up CI/CD pipelines

## 🧪 Testing

```bash
# Run unit tests (to be implemented)
npm test

# Run e2e tests (to be implemented)
npm run test:e2e
```

## 📝 Environment Variables

Create a `.env.local` file with:

```env
# Google Gemini API (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key

# Backend API (to be implemented)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
# or
MAILGUN_API_KEY=your_mailgun_key

# Slack Integration
SLACK_WEBHOOK_URL=your_slack_webhook

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/competeiq

# Vector Database
PINECONE_API_KEY=your_pinecone_key
# or
WEAVIATE_URL=your_weaviate_url

# Redis
REDIS_URL=redis://localhost:6379
```

## 🤖 AI API Endpoints

The following AI endpoints are available:

### POST /api/ai/generate-insight
Generate competitive insights from content
```typescript
// Request
{
  "competitorName": "Acme Corp",
  "platform": "Website",
  "content": "Product announcement text...",
  "url": "https://competitor.com/blog"
}

// Response
{
  "success": true,
  "insight": {
    "summary": "Brief summary...",
    "type": "Product Launch",
    "sentiment": "Threat",
    "priority": "High",
    "keyPoints": ["point1", "point2"],
    "recommendations": ["action1", "action2"],
    "impact": "Detailed impact analysis..."
  }
}
```

### POST /api/ai/detect-changes
Detect changes between content versions
```typescript
// Request
{
  "oldContent": "Previous version...",
  "newContent": "New version...",
  "competitorName": "Acme Corp"
}
```

### POST /api/ai/analyze-sentiment
Analyze sentiment and tone
```typescript
// Request
{
  "content": "Competitor content...",
  "context": "Product launch"
}
```

### POST /api/ai/extract-features
Extract features from announcements
```typescript
// Request
{
  "content": "Product announcement...",
  "competitorName": "Acme Corp"
}
```

### POST /api/ai/generate-digest
Generate weekly digest
```typescript
// Request
{
  "insights": [
    {
      "competitorName": "Acme Corp",
      "type": "Product Launch",
      "summary": "...",
      "priority": "High",
      "createdAt": "2025-01-15"
    }
  ]
}
```

### POST /api/ai/generate-battle-card
Generate competitive battle card
```typescript
// Request
{
  "name": "Acme Corp",
  "recentInsights": [...],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"]
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and Tailwind CSS
- UI components from Shadcn/UI
- Icons from Lucide React
- **AI powered by Google Gemini Pro**

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for startups to stay competitive**