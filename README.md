# AETHER - AI-Powered Competitive Intelligence Platform

## 📖 OVERVIEW

Aether is a comprehensive competitive intelligence platform that helps startups and businesses monitor competitors across websites and social media platforms, using AI to generate actionable insights and sentiment analysis. The platform automatically tracks competitor activities, analyzes changes, and delivers intelligent reports via email or Slack.

Built with modern web technologies and powered by Google Gemini Pro AI, Aether provides real-time competitive intelligence to help businesses stay ahead in their market.

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Shadcn/UI (built on Radix UI primitives)
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks (useState, useEffect, useSession)
- **Notifications**: Sonner for toast notifications
- **Charts**: Recharts for data visualization
- **TypeScript**: Full type safety across the application

### Backend & Database
- **Database**: Turso (libSQL/SQLite) - serverless SQL database
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: Better-Auth - modern authentication library
  - Email/password authentication
  - OAuth support (Google)
  - Session management with secure tokens
  - Password reset functionality
  - 2FA/TOTP support
  - Account deactivation/deletion
- **API Routes**: Next.js API routes (serverless functions)
- **Payments**: Stripe integration with Autumn-js

### AI & Intelligence Layer
- **AI Model**: Google Gemini Pro 1.5
- **Capabilities**:
  1. Insight Generation - Analyzes competitor content and generates actionable intelligence
  2. Change Detection - Compares content versions to identify significant changes
  3. Sentiment Analysis - Understands tone, competitive stance, and business intent
  4. Feature Extraction - Identifies and analyzes features from announcements
  5. Weekly Digest Generation - Creates executive summaries of competitive landscape
  6. Battle Card Generation - Produces competitive battle cards from intelligence data

### Data Collection & Scraping
- **Web Scraping**: Apify Client for scalable web scraping
- **Social Media APIs**:
  - YouTube Data API v3
  - Reddit API
  - Twitter/X API v2
- **Web Search**: Exa AI for semantic web search
- **Platforms Monitored**:
  - Company websites
  - LinkedIn
  - Twitter/X
  - Reddit
  - YouTube
  - Instagram
  - Facebook
  - Truth Social
  - BlueSky

### Email & Notifications
- **Slack Integration**: Webhook-based notifications
- **Email Service**: Coming Soon (Couldn't login with indian number for creating an account in top 10 transaction email providers for creating an account with phone number with otp)

---

## 🗄️ DATABASE SCHEMA

### Authentication Tables (Better-Auth)

**users** - User accounts
- id (primary key, text)
- name, email (unique), emailVerified
- image, phone, companyWebsite
- profilePhotoUrl
- totpSecret, totpEnabled (2FA support)
- deactivatedAt, deactivationRequestedAt
- deletionRequestedAt, deletionScheduledAt
- createdAt, updatedAt

**sessions** - User sessions
- id (primary key, text)
- token (unique), expiresAt
- userId (foreign key to users)
- ipAddress, userAgent
- createdAt, updatedAt

**accounts** - OAuth and password accounts
- id (primary key, text)
- userId (foreign key to users)
- providerId, accountId
- accessToken, refreshToken, idToken
- accessTokenExpiresAt, refreshTokenExpiresAt
- scope, password
- createdAt, updatedAt

**verifications** - Email and password reset verifications
- id (primary key, text)
- identifier, value
- expiresAt, createdAt, updatedAt

### Application Tables

**competitors** - Competitor tracking
- id (auto-increment primary key)
- userId (foreign key to users)
- name, websiteUrl, logoUrl
- industry, status (active/inactive)
- monitoringFrequency (real-time/daily/weekly)
- createdAt, updatedAt

**social_accounts** - Social media accounts per competitor
- id (auto-increment primary key)
- competitorId (foreign key to competitors)
- platform (LinkedIn, Twitter, Reddit, etc.)
- handle, url
- isActive
- createdAt

**insights** - AI-generated competitive insights
- id (auto-increment primary key)
- userId, competitorId (foreign keys)
- platform, content, summary
- insightType (Product Launch, Feature Update, Marketing Campaign, etc.)
- sentiment (Threat, Opportunity, Neutral)
- priority (High, Medium, Low)
- keyPoints (JSON array)
- recommendations (JSON array)
- impact, tags, labels
- publicOpinion (JSON object)
- publicOpinionPositive, publicOpinionNegative (counts)
- sourceUrl, detectedAt
- createdAt

**user_settings** - Notification preferences
- id (auto-increment primary key)
- userId (unique foreign key)
- emailEnabled, emailFrequency
- slackEnabled, slackWebhookUrl
- preferredDeliveryTime
- createdAt, updatedAt

**corporation_info** - User's company information
- id (auto-increment primary key)
- userId (unique foreign key)
- companySize, companyDescription, industry
- topEmployees (JSON array)
- companyWebsite, companyLinkedin, companyTwitter
- companyFacebook, companyInstagram
- companyYoutube, companyReddit
- createdAt, updatedAt

**financial_metrics** - Financial performance tracking
- id (auto-increment primary key)
- userId (foreign key)
- month, expenses, marketing
- totalRevenue, profit
- createdAt, updatedAt

**user_sentiment_data** - Public sentiment about user's company
- id (auto-increment primary key)
- userId (foreign key)
- scrapedAt
- positivePercentage, neutralPercentage, negativePercentage
- positiveSummary, neutralSummary, negativeSummary (JSON)
- rawComments (JSON array)
- createdAt

**competitor_sentiment_data** - Public sentiment about competitors
- id (auto-increment primary key)
- competitorId, userId (foreign keys)
- scrapedAt
- positivePercentage, neutralPercentage, negativePercentage
- positiveSummary, neutralSummary, negativeSummary (JSON)
- rawComments (JSON array)
- createdAt

---

## 🔄 HOW IT WORKS

### 1. User Onboarding
- User registers with email/password
- Can enable 2FA/TOTP for enhanced security
- Completes profile with company information
- Sets up notification preferences (email/Slack)
- Configures digest frequency (real-time, daily, weekly)

### 2. Competitor Setup
- User adds competitors manually
  - Company name, website, logo
  - Industry classification
  - Monitoring frequency preference
- Links social media accounts
  - Platform-specific handles and URLs
  - Supports 8+ platforms
- System validates and activates monitoring

### 3. Data Collection Pipeline
**Web Scraping**
- Apify Client scrapes competitor websites
- Extracts content from blogs, product pages, press releases
- Monitors for updates and changes
- Stores raw content for AI analysis

**Social Media Monitoring**
- YouTube API: Fetches channel videos, descriptions, comments
- Reddit API: Monitors subreddit posts and discussions
- Twitter/X API: Tracks tweets, replies, engagement
- Handles rate limiting and pagination automatically

**Search Intelligence**
- Exa AI performs semantic web searches
- Discovers competitor mentions across the internet
- Identifies new content sources automatically

### 4. AI Processing (Google Gemini Pro)
**Insight Generation Workflow**
1. Raw content is fed to Gemini Pro 1.5
2. AI analyzes context, intent, and competitive implications
3. Generates structured insights:
   - Summary: Brief overview of the content
   - Type: Classification (Product Launch, Feature Update, etc.)
   - Sentiment: Threat, Opportunity, or Neutral
   - Priority: High, Medium, or Low urgency
   - Key Points: Bulleted list of important details
   - Recommendations: Actionable responses
   - Impact: Analysis of potential business impact

**Change Detection**
1. Stores previous versions of content
2. Compares new content with historical data
3. AI identifies semantic changes (not just text differences)
4. Flags significant updates for review
5. Generates change-specific insights

**Sentiment Analysis**
1. Analyzes public opinion from comments and discussions
2. Categorizes sentiment: Positive, Neutral, Negative
3. Calculates percentages for each category
4. Generates summaries for each sentiment type
5. Tracks sentiment trends over time

**Batch Processing**
- Weekly digest: AI summarizes all insights from the week
- Battle cards: Compiles comprehensive competitor profiles
- Trend analysis: Identifies patterns and emerging threats

### 5. Storage & Retrieval
**Database Management**
- Drizzle ORM provides type-safe queries
- Relational data structure ensures data integrity
- Foreign keys maintain referential integrity
- Automatic cascade deletions (delete user → delete all related data)
- JSON fields store complex data (arrays, objects)
- Timestamps track all creation and updates

**Query Optimization**
- Indexed foreign keys for fast lookups
- Pagination for large result sets
- Filtering and sorting at database level
- Efficient joins across related tables

### 6. Notification Delivery
**Email Notifications (Resend)**
- Sends real-time alerts for high-priority insights
- Daily/weekly digest emails with HTML formatting
- Includes insight summaries, key points, links
- Respects user's preferred delivery time
- Tracks email opens and clicks

**Slack Notifications**
- Webhook-based integration
- Formatted messages with rich cards
- Includes quick links to full insights
- Real-time delivery for urgent updates
- Customizable channel routing

### 7. User Interface
**Dashboard**
- Overview of active competitors
- Recent insights feed
- Quick stats (threats, opportunities, high priority)
- Missing profile information alerts
- One-click navigation to key pages

**Competitors Page**
- List view with search and filters
- Add/edit competitor dialogs
- Social media account management
- Status toggle (active/inactive)
- Bulk actions support

**Insights Page**
- Comprehensive insight list
- Advanced filtering:
  - By competitor
  - By platform
  - By type, sentiment, priority
  - Date range selection
- Detailed insight view with full analysis
- Export capabilities

**Performance Page**
- Financial metrics visualization
- Sentiment analysis charts (user vs. competitors)
- Trend analysis over time
- Comparative metrics
- Real-time data updates

**Settings**
- Profile tab: Name, email, profile photo, phone
- Account tab: Password, 2FA/TOTP setup, account deletion
- Corporation tab: Company details, social media links, industry
- Notifications: Email/Slack preferences, frequency, delivery time

### 8. Security & Authentication
**Session Management**
- Secure JWT-based sessions
- Token stored in localStorage and cookies
- Automatic session refresh
- IP address and user agent tracking
- Configurable expiration times

**Password Security**
- Bcrypt hashing with salt
- Minimum complexity requirements
- Password reset via email verification
- Account lockout after failed attempts

**Two-Factor Authentication (2FA)**
- TOTP-based (Time-based One-Time Password)
- QR code generation for authenticator apps
- Backup codes provided
- Recovery options available

**API Security**
- Bearer token authentication on all protected routes
- Middleware validates tokens and sessions
- Rate limiting to prevent abuse
- CORS configuration for allowed origins
- Input validation with Zod schemas

### 9. Payment Integration (Stripe + Autumn)
- Subscription management
- Usage-based billing support
- Checkout flow with payment dialog
- Billing portal access
- Plan upgrades/downgrades
- Failed payment handling

---

## 🚀 KEY FEATURES

### Competitor Intelligence
✅ Multi-platform monitoring (8+ platforms)
✅ Automated content scraping
✅ Real-time change detection
✅ Historical data tracking
✅ Competitor comparison views

### AI-Powered Insights
✅ Automatic insight generation with Google Gemini Pro
✅ Sentiment analysis (Threat/Opportunity/Neutral)
✅ Priority scoring (High/Medium/Low)
✅ Actionable recommendations
✅ Business impact analysis

### Notifications & Digests
✅ Email notifications via Resend
✅ Slack webhook integration
✅ Customizable frequency (real-time/daily/weekly)
✅ Preferred delivery time setting
✅ Rich formatted content

### User Management
✅ Secure authentication with Better-Auth
✅ OAuth support (Google)
✅ Profile management with photo upload
✅ Two-factor authentication (2FA/TOTP)
✅ Account deactivation and deletion

### Analytics & Performance
✅ Financial metrics tracking
✅ Sentiment analysis visualization
✅ Comparative performance charts
✅ Trend analysis over time
✅ Export capabilities

### Settings & Customization
✅ Notification preferences
✅ Company profile setup
✅ Social media linking
✅ Team member management
✅ Industry classification

---

## 📦 DEPENDENCIES

### Core Framework
- next@15.3.5 - React framework with App Router
- react@19.0.0 - UI library
- react-dom@19.0.0 - DOM renderer

### UI & Styling
- tailwindcss@4 - Utility-first CSS framework
- @radix-ui/* - Headless UI components (30+ packages)
- lucide-react - Icon library
- framer-motion - Animation library
- sonner - Toast notifications
- recharts - Charting library

### Database & ORM
- drizzle-orm@0.44.5 - Type-safe ORM
- drizzle-kit@0.31.4 - Migration toolkit
- @libsql/client@0.15.15 - Turso database client

### Authentication
- better-auth@1.3.10 - Authentication library
- bcrypt@6.0.0 - Password hashing
- speakeasy@2.0.0 - TOTP/2FA support

### AI & Data Processing
- @google/generative-ai@0.24.1 - Gemini Pro API
- apify-client@2.17.0 - Web scraping client
- twitter-api-v2@1.27.0 - Twitter/X API

### Forms & Validation
- react-hook-form@7.60.0 - Form library
- zod@4.1.8 - Schema validation
- @hookform/resolvers@5.1.1 - Form resolvers

### Email & Payments
- resend@6.1.2 - Email delivery
- stripe@18.5.0 - Payment processing
- autumn-js@0.1.34 - Payment UI

### Utilities
- clsx - Conditional class names
- tailwind-merge - Merge Tailwind classes
- date-fns - Date formatting
- qrcode.react - QR code generation

---

## 🛠️ HOW TO RUN LOCALLY

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, yarn, or bun package manager

### Step 1: Clone Repository
git clone <repository-url> cd aether


### Step 2: Install Dependencies
npm install

or
bun install


### Step 3: Set Up Environment Variables

Create `.env` file in root directory:

===== REQUIRED - Database =====
DATABASE_URL=libsql://your-db-name.turso.io DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

===== REQUIRED - Authentication =====
BETTER_AUTH_SECRET=your_randomly_generated_secret_here BETTER_AUTH_URL=http://localhost:3000

===== REQUIRED - AI =====
GOOGLE_API_KEY=AIzaSyC...your_gemini_api_key

===== REQUIRED - Web Scraping =====
APIFY_API_TOKEN=apify_api_...your_token

===== REQUIRED - APIs =====
YOUTUBE_API_KEY=AIzaSyD...your_youtube_key EXA_API_KEY=exa_...your_key

===== OPTIONAL - Social Media =====
TWITTER_BEARER_TOKEN=AAAAAAAAAA...your_token REDDIT_CLIENT_ID=your_client_id REDDIT_CLIENT_SECRET=your_client_secret


### Step 4: Initialize Database
npm run db:push

or
bun run db:push


### Step 5: Start Development Server
npm run dev

or
bun run dev


Open http://localhost:3000 in your browser.

---

## 🔑 OBTAINING API KEYS

### Turso Database (FREE)
1. Visit https://turso.tech
2. Sign up with GitHub
3. Create new database
4. Copy Database URL and Auth Token

### Google Gemini API (FREE - 15 req/min)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create API key in new project
4. Copy API key (starts with AIza...)

### Apify (FREE $5/month credit)
1. Visit https://apify.com
2. Sign up for free account
3. Go to Settings → Integrations
4. Create Personal API token
5. Copy token (starts with apify_api_...)

### YouTube API (FREE - 10k quota/day)
1. Visit https://console.cloud.google.com
2. Create/select project
3. Enable "YouTube Data API v3"
4. Create API key in Credentials
5. Copy API key

### Exa AI (FREE - 1000 searches/month)
1. Visit https://exa.ai
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Create and copy API key

### Better-Auth Secret (FREE - self-generated)
Run in terminal:
Mac/Linux
openssl rand -base64 32

Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))


### Twitter API (OPTIONAL - requires approval)
1. Visit https://developer.twitter.com
2. Apply for developer access
3. Create app and get Bearer Token

### Reddit API (OPTIONAL)
1. Visit https://www.reddit.com/prefs/apps
2. Create new app (type: script)
3. Copy Client ID and Secret

---

## 📊 DATA FLOW DIAGRAM

User → Dashboard → Add Competitor → System Activates Monitoring
                                    ↓
                            Scraping Pipeline
                        (Apify + Social APIs)
                                    ↓
                        Raw Content Collection
                    (Websites + Social Platforms)
                                    ↓
                        AI Processing Layer
                        (Google Gemini Pro)
                                    ↓
                        Insight Generation
                (Analysis + Recommendations)
                                    ↓
                        Database Storage
                        (Turso + Drizzle)
                                    ↓
                        Notification System
                        (Email + Slack)
                                    ↓
                        User Interface
                    (Dashboard + Insights Page)

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features
- Browser extension for quick competitor tracking
- Mobile app (React Native)
- Advanced analytics dashboard with ML predictions
- Collaborative team features
- API access for third-party integrations
- Webhook support for custom workflows
- Advanced filtering and saved searches
- Custom insight templates
- Bulk import/export capabilities
- Integration with CRM systems
- Multi-language support
- Voice notifications
- Automated competitive reports (PDF)

### Infrastructure Improvements
- Redis caching layer for faster queries
- GraphQL API for flexible data fetching
- WebSocket support for real-time updates
- CDN integration for global performance
- Advanced monitoring and logging
- A/B testing framework
- Feature flags system

---

## 📝 PROJECT STRUCTURE

aether/ ├── src/ │ ├── app/ # Next.js App Router │ │ ├── page.tsx # Dashboard homepage │ │ ├── competitors/ # Competitor management │ │ ├── insights/ # AI insights display │ │ ├── performance/ # Analytics & charts │ │ ├── settings/ # User preferences │ │ │ ├── profile/ # Profile management │ │ │ ├── account/ # Security settings │ │ │ └── corporation/ # Company info │ │ ├── login/ # Authentication │ │ ├── register/ # Sign up │ │ └── api/ # API routes │ │ ├── auth/ # Better-Auth routes │ │ ├── competitors/ # Competitor CRUD │ │ ├── insights/ # Insight CRUD │ │ ├── ai/ # AI processing │ │ ├── scrape/ # Scraping endpoints │ │ └── send-digest/ # Notification delivery │ ├── components/ │ │ ├── ui/ # Shadcn/UI components │ │ ├── layout/ # Header, footer, nav │ │ ├── dashboard/ # Dashboard widgets │ │ ├── competitors/ # Competitor components │ │ ├── insights/ # Insight components │ │ ├── performance/ # Chart components │ │ └── settings/ # Settings forms │ ├── lib/ │ │ ├── auth.ts # Better-Auth config │ │ ├── auth-client.ts # Auth client │ │ ├── db.ts # Database connection │ │ └── scrapers/ # Scraping utilities │ └── db/ │ ├── schema.ts # Drizzle schema │ └── seeds/ # Database seeders ├── public/ # Static assets ├── drizzle/ # Database migrations ├── .env # Environment variables ├── package.json # Dependencies ├── tsconfig.json # TypeScript config ├── tailwind.config.ts # Tailwind config └── next.config.ts # Next.js config


---

## 🤝 CONTRIBUTING

Contributions are welcome! This project is built to help startups stay competitive.

### Development Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include loading states
- Write meaningful commit messages
- Test thoroughly before submitting PR

---

## 📄 LICENSE

This project is licensed under the MIT License.

---

## 🙏 ACKNOWLEDGMENTS

Built with:
- Next.js 15 & React 19
- Tailwind CSS v4
- Shadcn/UI components
- Better-Auth for authentication
- Turso (libSQL) database
- Drizzle ORM
- Google Gemini Pro AI
- Apify for web scraping
- Resend for email delivery
- Stripe for payments

---

## 📞 SUPPORT

For questions or issues:
- Open an issue on GitHub
- Check documentation
- Review API endpoints
- Test with AI Demo page

---

**Built with ❤️ to help startups win in competitive markets**# AETHER - AI-Powered Competitive Intelligence Platform

## 📖 OVERVIEW

Aether is a comprehensive competitive intelligence platform that helps startups and businesses monitor competitors across websites and social media platforms, using AI to generate actionable insights and sentiment analysis. The platform automatically tracks competitor activities, analyzes changes, and delivers intelligent reports via email or Slack.

Built with modern web technologies and powered by Google Gemini Pro AI, Aether provides real-time competitive intelligence to help businesses stay ahead in their market.

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Shadcn/UI (built on Radix UI primitives)
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks (useState, useEffect, useSession)
- **Notifications**: Sonner for toast notifications
- **Charts**: Recharts for data visualization
- **TypeScript**: Full type safety across the application

### Backend & Database
- **Database**: Turso (libSQL/SQLite) - serverless SQL database
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: Better-Auth - modern authentication library
  - Email/password authentication
  - OAuth support (Google)
  - Session management with secure tokens
  - Password reset functionality
  - 2FA/TOTP support
  - Account deactivation/deletion
- **API Routes**: Next.js API routes (serverless functions)
- **Payments**: Stripe integration with Autumn-js

### AI & Intelligence Layer
- **AI Model**: Google Gemini Pro 1.5
- **Capabilities**:
  1. Insight Generation - Analyzes competitor content and generates actionable intelligence
  2. Change Detection - Compares content versions to identify significant changes
  3. Sentiment Analysis - Understands tone, competitive stance, and business intent
  4. Feature Extraction - Identifies and analyzes features from announcements
  5. Weekly Digest Generation - Creates executive summaries of competitive landscape
  6. Battle Card Generation - Produces competitive battle cards from intelligence data

### Data Collection & Scraping
- **Web Scraping**: Apify Client for scalable web scraping
- **Social Media APIs**:
  - YouTube Data API v3
  - Reddit API
  - Twitter/X API v2
- **Web Search**: Exa AI for semantic web search
- **Platforms Monitored**:
  - Company websites
  - LinkedIn
  - Twitter/X
  - Reddit
  - YouTube
  - Instagram
  - Facebook
  - Truth Social
  - BlueSky

### Email & Notifications
- **Email Service**: Resend API
- **Slack Integration**: Webhook-based notifications
- **Notification Types**:
  - Real-time alerts
  - Daily digests
  - Weekly summaries
- **Delivery Options**: Email, Slack, or both
- **Customizable**: Users can set preferred delivery times and frequencies

---

## 🗄️ DATABASE SCHEMA

### Authentication Tables (Better-Auth)

**users** - User accounts
- id (primary key, text)
- name, email (unique), emailVerified
- image, phone, companyWebsite
- profilePhotoUrl
- totpSecret, totpEnabled (2FA support)
- deactivatedAt, deactivationRequestedAt
- deletionRequestedAt, deletionScheduledAt
- createdAt, updatedAt

**sessions** - User sessions
- id (primary key, text)
- token (unique), expiresAt
- userId (foreign key to users)
- ipAddress, userAgent
- createdAt, updatedAt

**accounts** - OAuth and password accounts
- id (primary key, text)
- userId (foreign key to users)
- providerId, accountId
- accessToken, refreshToken, idToken
- accessTokenExpiresAt, refreshTokenExpiresAt
- scope, password
- createdAt, updatedAt

**verifications** - Email and password reset verifications
- id (primary key, text)
- identifier, value
- expiresAt, createdAt, updatedAt

### Application Tables

**competitors** - Competitor tracking
- id (auto-increment primary key)
- userId (foreign key to users)
- name, websiteUrl, logoUrl
- industry, status (active/inactive)
- monitoringFrequency (real-time/daily/weekly)
- createdAt, updatedAt

**social_accounts** - Social media accounts per competitor
- id (auto-increment primary key)
- competitorId (foreign key to competitors)
- platform (LinkedIn, Twitter, Reddit, etc.)
- handle, url
- isActive
- createdAt

**insights** - AI-generated competitive insights
- id (auto-increment primary key)
- userId, competitorId (foreign keys)
- platform, content, summary
- insightType (Product Launch, Feature Update, Marketing Campaign, etc.)
- sentiment (Threat, Opportunity, Neutral)
- priority (High, Medium, Low)
- keyPoints (JSON array)
- recommendations (JSON array)
- impact, tags, labels
- publicOpinion (JSON object)
- publicOpinionPositive, publicOpinionNegative (counts)
- sourceUrl, detectedAt
- createdAt

**user_settings** - Notification preferences
- id (auto-increment primary key)
- userId (unique foreign key)
- emailEnabled, emailFrequency
- slackEnabled, slackWebhookUrl
- preferredDeliveryTime
- createdAt, updatedAt

**corporation_info** - User's company information
- id (auto-increment primary key)
- userId (unique foreign key)
- companySize, companyDescription, industry
- topEmployees (JSON array)
- companyWebsite, companyLinkedin, companyTwitter
- companyFacebook, companyInstagram
- companyYoutube, companyReddit
- createdAt, updatedAt

**financial_metrics** - Financial performance tracking
- id (auto-increment primary key)
- userId (foreign key)
- month, expenses, marketing
- totalRevenue, profit
- createdAt, updatedAt

**user_sentiment_data** - Public sentiment about user's company
- id (auto-increment primary key)
- userId (foreign key)
- scrapedAt
- positivePercentage, neutralPercentage, negativePercentage
- positiveSummary, neutralSummary, negativeSummary (JSON)
- rawComments (JSON array)
- createdAt

**competitor_sentiment_data** - Public sentiment about competitors
- id (auto-increment primary key)
- competitorId, userId (foreign keys)
- scrapedAt
- positivePercentage, neutralPercentage, negativePercentage
- positiveSummary, neutralSummary, negativeSummary (JSON)
- rawComments (JSON array)
- createdAt

---

## 🔄 HOW IT WORKS

### 1. User Onboarding
- User registers with email/password
- Can enable 2FA/TOTP for enhanced security
- Completes profile with company information
- Sets up notification preferences (email/Slack)
- Configures digest frequency (real-time, daily, weekly)

### 2. Competitor Setup
- User adds competitors manually
  - Company name, website, logo
  - Industry classification
  - Monitoring frequency preference
- Links social media accounts
  - Platform-specific handles and URLs
  - Supports 8+ platforms
- System validates and activates monitoring

### 3. Data Collection Pipeline
**Web Scraping**
- Apify Client scrapes competitor websites
- Extracts content from blogs, product pages, press releases
- Monitors for updates and changes
- Stores raw content for AI analysis

**Social Media Monitoring**
- YouTube API: Fetches channel videos, descriptions, comments
- Reddit API: Monitors subreddit posts and discussions
- Twitter/X API: Tracks tweets, replies, engagement
- Handles rate limiting and pagination automatically

**Search Intelligence**
- Exa AI performs semantic web searches
- Discovers competitor mentions across the internet
- Identifies new content sources automatically

### 4. AI Processing (Google Gemini Pro)
**Insight Generation Workflow**
1. Raw content is fed to Gemini Pro 1.5
2. AI analyzes context, intent, and competitive implications
3. Generates structured insights:
   - Summary: Brief overview of the content
   - Type: Classification (Product Launch, Feature Update, etc.)
   - Sentiment: Threat, Opportunity, or Neutral
   - Priority: High, Medium, or Low urgency
   - Key Points: Bulleted list of important details
   - Recommendations: Actionable responses
   - Impact: Analysis of potential business impact

**Change Detection**
1. Stores previous versions of content
2. Compares new content with historical data
3. AI identifies semantic changes (not just text differences)
4. Flags significant updates for review
5. Generates change-specific insights

**Sentiment Analysis**
1. Analyzes public opinion from comments and discussions
2. Categorizes sentiment: Positive, Neutral, Negative
3. Calculates percentages for each category
4. Generates summaries for each sentiment type
5. Tracks sentiment trends over time

**Batch Processing**
- Weekly digest: AI summarizes all insights from the week
- Battle cards: Compiles comprehensive competitor profiles
- Trend analysis: Identifies patterns and emerging threats

### 5. Storage & Retrieval
**Database Management**
- Drizzle ORM provides type-safe queries
- Relational data structure ensures data integrity
- Foreign keys maintain referential integrity
- Automatic cascade deletions (delete user → delete all related data)
- JSON fields store complex data (arrays, objects)
- Timestamps track all creation and updates

**Query Optimization**
- Indexed foreign keys for fast lookups
- Pagination for large result sets
- Filtering and sorting at database level
- Efficient joins across related tables

### 6. Notification Delivery
**Email Notifications (Resend)**
- Sends real-time alerts for high-priority insights
- Daily/weekly digest emails with HTML formatting
- Includes insight summaries, key points, links
- Respects user's preferred delivery time
- Tracks email opens and clicks

**Slack Notifications**
- Webhook-based integration
- Formatted messages with rich cards
- Includes quick links to full insights
- Real-time delivery for urgent updates
- Customizable channel routing

### 7. User Interface
**Dashboard**
- Overview of active competitors
- Recent insights feed
- Quick stats (threats, opportunities, high priority)
- Missing profile information alerts
- One-click navigation to key pages

**Competitors Page**
- List view with search and filters
- Add/edit competitor dialogs
- Social media account management
- Status toggle (active/inactive)
- Bulk actions support

**Insights Page**
- Comprehensive insight list
- Advanced filtering:
  - By competitor
  - By platform
  - By type, sentiment, priority
  - Date range selection
- Detailed insight view with full analysis
- Export capabilities

**Performance Page**
- Financial metrics visualization
- Sentiment analysis charts (user vs. competitors)
- Trend analysis over time
- Comparative metrics
- Real-time data updates

**Settings**
- Profile tab: Name, email, profile photo, phone
- Account tab: Password, 2FA/TOTP setup, account deletion
- Corporation tab: Company details, social media links, industry
- Notifications: Email/Slack preferences, frequency, delivery time

### 8. Security & Authentication
**Session Management**
- Secure JWT-based sessions
- Token stored in localStorage and cookies
- Automatic session refresh
- IP address and user agent tracking
- Configurable expiration times

**Password Security**
- Bcrypt hashing with salt
- Minimum complexity requirements
- Password reset via email verification
- Account lockout after failed attempts

**Two-Factor Authentication (2FA)**
- TOTP-based (Time-based One-Time Password)
- QR code generation for authenticator apps
- Backup codes provided
- Recovery options available

**API Security**
- Bearer token authentication on all protected routes
- Middleware validates tokens and sessions
- Rate limiting to prevent abuse
- CORS configuration for allowed origins
- Input validation with Zod schemas

### 9. Payment Integration (Stripe + Autumn)
- Subscription management
- Usage-based billing support
- Checkout flow with payment dialog
- Billing portal access
- Plan upgrades/downgrades
- Failed payment handling

---

## 🚀 KEY FEATURES

### Competitor Intelligence
✅ Multi-platform monitoring (8+ platforms)
✅ Automated content scraping
✅ Real-time change detection
✅ Historical data tracking
✅ Competitor comparison views

### AI-Powered Insights
✅ Automatic insight generation with Google Gemini Pro
✅ Sentiment analysis (Threat/Opportunity/Neutral)
✅ Priority scoring (High/Medium/Low)
✅ Actionable recommendations
✅ Business impact analysis

### Notifications & Digests
✅ Email notifications via Resend
✅ Slack webhook integration
✅ Customizable frequency (real-time/daily/weekly)
✅ Preferred delivery time setting
✅ Rich formatted content

### User Management
✅ Secure authentication with Better-Auth
✅ OAuth support (Google)
✅ Profile management with photo upload
✅ Two-factor authentication (2FA/TOTP)
✅ Account deactivation and deletion

### Analytics & Performance
✅ Financial metrics tracking
✅ Sentiment analysis visualization
✅ Comparative performance charts
✅ Trend analysis over time
✅ Export capabilities

### Settings & Customization
✅ Notification preferences
✅ Company profile setup
✅ Social media linking
✅ Team member management
✅ Industry classification

---

## 📦 DEPENDENCIES

### Core Framework
- next@15.3.5 - React framework with App Router
- react@19.0.0 - UI library
- react-dom@19.0.0 - DOM renderer

### UI & Styling
- tailwindcss@4 - Utility-first CSS framework
- @radix-ui/* - Headless UI components (30+ packages)
- lucide-react - Icon library
- framer-motion - Animation library
- sonner - Toast notifications
- recharts - Charting library

### Database & ORM
- drizzle-orm@0.44.5 - Type-safe ORM
- drizzle-kit@0.31.4 - Migration toolkit
- @libsql/client@0.15.15 - Turso database client

### Authentication
- better-auth@1.3.10 - Authentication library
- bcrypt@6.0.0 - Password hashing
- speakeasy@2.0.0 - TOTP/2FA support

### AI & Data Processing
- @google/generative-ai@0.24.1 - Gemini Pro API
- apify-client@2.17.0 - Web scraping client
- twitter-api-v2@1.27.0 - Twitter/X API

### Forms & Validation
- react-hook-form@7.60.0 - Form library
- zod@4.1.8 - Schema validation
- @hookform/resolvers@5.1.1 - Form resolvers

### Email & Payments
- resend@6.1.2 - Email delivery
- stripe@18.5.0 - Payment processing
- autumn-js@0.1.34 - Payment UI

### Utilities
- clsx - Conditional class names
- tailwind-merge - Merge Tailwind classes
- date-fns - Date formatting
- qrcode.react - QR code generation

---

## 🛠️ HOW TO RUN LOCALLY

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, yarn, or bun package manager

### Step 1: Clone Repository
git clone <repository-url> cd aether


### Step 2: Install Dependencies
npm install

or
bun install


### Step 3: Set Up Environment Variables

Create `.env` file in root directory:

#### ===== REQUIRED - Database =====
DATABASE_URL=libsql://your-db-name.turso.io DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

#### ===== REQUIRED - Authentication =====
BETTER_AUTH_SECRET=your_randomly_generated_secret_here BETTER_AUTH_URL=http://localhost:3000

#### ===== REQUIRED - AI =====
GOOGLE_API_KEY=AIzaSyC...your_gemini_api_key

#### ===== REQUIRED - Web Scraping =====
APIFY_API_TOKEN=apify_api_...your_token

#### ===== REQUIRED - APIs =====
YOUTUBE_API_KEY=AIzaSyD...your_youtube_key EXA_API_KEY=exa_...your_key

#### ===== OPTIONAL - Social Media =====
TWITTER_BEARER_TOKEN=AAAAAAAAAA...your_token REDDIT_CLIENT_ID=your_client_id REDDIT_CLIENT_SECRET=your_client_secret


### Step 4: Initialize Database
npx drizzle-kit push

then,
npm run db:push
or
bun run db:push
(ignore the warning)

### Step 5: Start Development Server
npm run dev

or
bun run dev


Open http://localhost:3000 in your browser.

---

## 🔑 OBTAINING API KEYS

### Turso Database (FREE)
1. Visit https://turso.tech
2. Sign up with GitHub
3. Create new database
4. Copy Database URL and Auth Token

### Google Gemini API (FREE - 15 req/min)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create API key in new project
4. Copy API key (starts with AIza...)

### Apify (FREE $5/month credit)
1. Visit https://apify.com
2. Sign up for free account
3. Go to Settings → Integrations
4. Create Personal API token
5. Copy token (starts with apify_api_...)

### YouTube API (FREE - 10k quota/day)
1. Visit https://console.cloud.google.com
2. Create/select project
3. Enable "YouTube Data API v3"
4. Create API key in Credentials
5. Copy API key

### Exa AI (FREE - 1000 searches/month)
1. Visit https://exa.ai
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Create and copy API key

### Better-Auth Secret (FREE - self-generated)
Run in terminal:
Mac/Linux
openssl rand -base64 32

Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))


### Twitter API (requires approval)
1. Visit https://developer.twitter.com
2. Apply for developer access
3. Create app and get Bearer Token

### Reddit API
1. Visit https://www.apify.com/
2. Create and account and login
3. Open the following link:-
   https://console.apify.com/settings/integrations
4. Copy your personal API token and sae in the .env file

---

## 📊 DATA FLOW DIAGRAM

User → Dashboard → Add Competitor → System Activates Monitoring
                                    ↓
                            Scraping Pipeline
                        (Apify + Social APIs)
                                    ↓
                        Raw Content Collection
                    (Websites + Social Platforms)
                                    ↓
                        AI Processing Layer
                        (Google Gemini Pro)
                                    ↓
                        Insight Generation
                (Analysis + Recommendations)
                                    ↓
                        Database Storage
                        (Turso + Drizzle)
                                    ↓
                        Notification System
                        (Email + Slack)
                                    ↓
                        User Interface
                    (Dashboard + Insights Page)

---

## 🤝 CONTRIBUTING

Contributions are welcome! This project is built to help startups stay competitive.

### Development Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include loading states
- Write meaningful commit messages
- Test thoroughly before submitting PR

---

## 📄 LICENSE

This project is licensed under the MIT License.

---

## 🙏 ACKNOWLEDGMENTS

Built with:
- Next.js 15 & React 19
- Tailwind CSS v4
- Shadcn/UI components
- Better-Auth for authentication
- Turso (libSQL) database
- Drizzle ORM
- Google Gemini Pro AI
- Apify for web scraping
- Resend for email delivery
- Stripe for payments

---

## 📞 SUPPORT

For questions or issues:
- Open an issue on GitHub
- Check documentation
- Review API endpoints
- Test with AI Demo page

---

**Built with ❤️ to help startups win in competitive markets**
