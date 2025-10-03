import { db } from '@/db';
import { insights } from '@/db/schema';

async function main() {
    const sampleInsights = [
        {
            userId: 'user_123',
            competitorId: 1,
            platform: 'company-blog',
            content: 'HubSpot announces revolutionary AI-powered customer service automation suite with advanced chatbot capabilities, predictive analytics, and seamless CRM integration. The new features promise to reduce customer response times by 70%.',
            summary: 'HubSpot launches comprehensive AI customer service suite targeting enterprise automation market',
            insightType: 'product_launch',
            sentiment: 'opportunity',
            priority: 'high',
            keyPoints: JSON.stringify([
                'Advanced AI chatbot with natural language processing',
                'Predictive analytics for customer behavior insights',
                'Seamless integration with existing CRM systems',
                '70% reduction in customer response times claimed'
            ]),
            recommendations: JSON.stringify([
                'Analyze HubSpot\'s AI capabilities to identify competitive gaps',
                'Consider partnering with AI vendors to accelerate development',
                'Evaluate customer feedback on automation vs human interaction preferences'
            ]),
            impact: 'This launch positions HubSpot as a leader in AI-driven customer service, potentially capturing significant market share from traditional solutions.',
            tags: JSON.stringify(['AI', 'customer-service', 'automation', 'CRM', 'enterprise']),
            publicOpinion: JSON.stringify({
                positive: 75,
                negative: 15,
                neutral: 10,
                totalMentions: 342
            }),
            sourceUrl: 'https://blog.hubspot.com/ai-customer-service-launch',
            detectedAt: new Date('2024-12-15T10:30:00Z').toISOString(),
            createdAt: new Date('2024-12-15T10:35:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 2,
            platform: 'linkedin',
            content: 'Salesforce implements significant pricing restructure across all product tiers, increasing Enterprise plan costs by 25% while adding new AI features. Small business plans remain unchanged to maintain market penetration.',
            summary: 'Salesforce raises Enterprise pricing by 25% while bundling AI features',
            insightType: 'pricing_change',
            sentiment: 'threat',
            priority: 'high',
            keyPoints: JSON.stringify([
                'Enterprise plan pricing increased by 25%',
                'AI features now bundled with higher-tier plans',
                'Small business pricing remains competitive',
                'Existing customers grandfathered for 6 months'
            ]),
            recommendations: JSON.stringify([
                'Target Salesforce enterprise customers with competitive pricing',
                'Highlight cost savings in marketing campaigns',
                'Prepare migration assistance programs for switching customers'
            ]),
            impact: 'Price increases may create opportunity to capture dissatisfied enterprise customers seeking more cost-effective alternatives.',
            tags: JSON.stringify(['pricing', 'enterprise', 'AI', 'CRM', 'competitive-advantage']),
            publicOpinion: JSON.stringify({
                positive: 25,
                negative: 60,
                neutral: 15,
                totalMentions: 189
            }),
            sourceUrl: 'https://linkedin.com/posts/salesforce-pricing-update',
            detectedAt: new Date('2024-12-12T14:20:00Z').toISOString(),
            createdAt: new Date('2024-12-12T14:25:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 3,
            platform: 'twitter',
            content: 'Notion announces strategic partnership with Microsoft to integrate Office 365 apps directly into Notion workspaces. Users can now embed Excel, PowerPoint, and Word documents seamlessly.',
            summary: 'Notion partners with Microsoft for native Office 365 integration',
            insightType: 'partnership',
            sentiment: 'neutral',
            priority: 'medium',
            keyPoints: JSON.stringify([
                'Native Office 365 integration in Notion workspaces',
                'Seamless embedding of Excel, PowerPoint, and Word',
                'Strategic partnership with Microsoft',
                'Enhanced productivity workflow capabilities'
            ]),
            recommendations: JSON.stringify([
                'Evaluate similar partnership opportunities with productivity suites',
                'Assess impact on our document collaboration features',
                'Monitor user adoption of integrated workflows'
            ]),
            impact: 'Partnership strengthens Notion\'s position in enterprise productivity market by addressing Microsoft Office dependency concerns.',
            tags: JSON.stringify(['partnership', 'Microsoft', 'productivity', 'integration', 'enterprise']),
            publicOpinion: JSON.stringify({
                positive: 68,
                negative: 12,
                neutral: 20,
                totalMentions: 156
            }),
            sourceUrl: 'https://twitter.com/notion/status/partnership-microsoft',
            detectedAt: new Date('2024-12-10T09:15:00Z').toISOString(),
            createdAt: new Date('2024-12-10T09:20:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 4,
            platform: 'linkedin',
            content: 'Figma hires former Adobe Creative Suite VP Sarah Chen as Chief Product Officer. Chen brings 15 years of design tool experience and will lead Figma\'s expansion into video editing and 3D design capabilities.',
            summary: 'Figma appoints former Adobe executive as CPO to expand design tool portfolio',
            insightType: 'executive_hire',
            sentiment: 'threat',
            priority: 'low',
            keyPoints: JSON.stringify([
                'Former Adobe Creative Suite VP joins as CPO',
                '15 years of design tool industry experience',
                'Plans to expand into video editing capabilities',
                'Focus on 3D design tool development'
            ]),
            recommendations: JSON.stringify([
                'Monitor Figma\'s product roadmap announcements',
                'Assess competitive landscape in video editing space'
            ]),
            impact: 'Executive hire signals Figma\'s ambition to become comprehensive creative suite, potentially competing with Adobe across multiple categories.',
            tags: JSON.stringify(['executive-hire', 'Adobe', 'design-tools', 'video-editing', 'product-strategy']),
            publicOpinion: JSON.stringify({
                positive: 45,
                negative: 20,
                neutral: 35,
                totalMentions: 78
            }),
            sourceUrl: 'https://linkedin.com/posts/figma-cpo-announcement',
            detectedAt: new Date('2024-12-08T16:45:00Z').toISOString(),
            createdAt: new Date('2024-12-08T16:50:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 5,
            platform: 'company-blog',
            content: 'Stripe launches enhanced fraud detection system using machine learning to analyze transaction patterns in real-time. New system promises 40% reduction in false positives while maintaining security standards.',
            summary: 'Stripe unveils ML-powered fraud detection with improved accuracy',
            insightType: 'feature_update',
            sentiment: 'threat',
            priority: 'medium',
            keyPoints: JSON.stringify([
                'Machine learning-based fraud detection system',
                'Real-time transaction pattern analysis',
                '40% reduction in false positives claimed',
                'Maintains existing security standards'
            ]),
            recommendations: JSON.stringify([
                'Benchmark our fraud detection accuracy against Stripe\'s claims',
                'Investigate ML implementation for payment security',
                'Analyze customer feedback on false positive experiences'
            ]),
            impact: 'Enhanced fraud detection may attract merchants seeking better balance between security and user experience.',
            tags: JSON.stringify(['fraud-detection', 'machine-learning', 'payments', 'security', 'fintech']),
            publicOpinion: JSON.stringify({
                positive: 72,
                negative: 8,
                neutral: 20,
                totalMentions: 203
            }),
            sourceUrl: 'https://stripe.com/blog/enhanced-fraud-detection',
            detectedAt: new Date('2024-12-07T11:30:00Z').toISOString(),
            createdAt: new Date('2024-12-07T11:35:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 6,
            platform: 'twitter',
            content: 'Shopify introduces AR try-on feature for fashion retailers, allowing customers to virtually try clothes using smartphone cameras. Beta testing shows 35% increase in conversion rates for participating stores.',
            summary: 'Shopify launches AR try-on technology for fashion e-commerce',
            insightType: 'product_launch',
            sentiment: 'opportunity',
            priority: 'medium',
            keyPoints: JSON.stringify([
                'AR try-on feature for fashion retailers',
                'Smartphone camera-based virtual fitting',
                '35% conversion rate increase in beta testing',
                'Targeted at fashion and apparel merchants'
            ]),
            recommendations: JSON.stringify([
                'Explore AR technology partnerships for our e-commerce platform',
                'Research fashion industry adoption of AR shopping experiences',
                'Evaluate technical requirements for AR implementation'
            ]),
            impact: 'AR feature could differentiate Shopify in competitive e-commerce platform market, especially for fashion verticals.',
            tags: JSON.stringify(['AR', 'e-commerce', 'fashion', 'conversion-rate', 'mobile-technology']),
            publicOpinion: JSON.stringify({
                positive: 63,
                negative: 18,
                neutral: 19,
                totalMentions: 124
            }),
            sourceUrl: 'https://twitter.com/shopify/status/ar-launch',
            detectedAt: new Date('2024-12-05T13:20:00Z').toISOString(),
            createdAt: new Date('2024-12-05T13:25:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 7,
            platform: 'company-blog',
            content: 'Zoom announces acquisition of calendar scheduling startup Calendly for $3.2B, integrating smart scheduling directly into Zoom meetings platform. Deal expected to close Q1 2025.',
            summary: 'Zoom acquires Calendly for $3.2B to integrate scheduling capabilities',
            insightType: 'partnership',
            sentiment: 'threat',
            priority: 'high',
            keyPoints: JSON.stringify([
                '$3.2 billion acquisition of Calendly',
                'Native scheduling integration with Zoom meetings',
                'Deal closing expected Q1 2025',
                'Expansion into productivity workflow tools'
            ]),
            recommendations: JSON.stringify([
                'Assess impact on our video conferencing strategy',
                'Evaluate acquisition opportunities in productivity space',
                'Analyze competitive positioning against integrated solutions'
            ]),
            impact: 'Major acquisition creates integrated meeting and scheduling solution that could pressure standalone tools in both categories.',
            tags: JSON.stringify(['acquisition', 'scheduling', 'video-conferencing', 'productivity', 'market-consolidation']),
            publicOpinion: JSON.stringify({
                positive: 52,
                negative: 28,
                neutral: 20,
                totalMentions: 287
            }),
            sourceUrl: 'https://zoom.us/blog/calendly-acquisition',
            detectedAt: new Date('2024-12-03T08:45:00Z').toISOString(),
            createdAt: new Date('2024-12-03T08:50:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 8,
            platform: 'linkedin',
            content: 'Slack launches comprehensive workflow automation platform competing directly with Zapier and Microsoft Power Automate. New features include visual workflow builder and 500+ app integrations.',
            summary: 'Slack enters workflow automation market with visual builder and extensive integrations',
            insightType: 'product_launch',
            sentiment: 'threat',
            priority: 'high',
            keyPoints: JSON.stringify([
                'Visual workflow automation builder',
                '500+ application integrations available',
                'Direct competition with Zapier and Power Automate',
                'Native integration with Slack messaging platform'
            ]),
            recommendations: JSON.stringify([
                'Analyze Slack\'s automation capabilities vs our offerings',
                'Strengthen unique value propositions in automation space',
                'Monitor customer migration patterns from automation platforms'
            ]),
            impact: 'Slack\'s entry into automation market leverages existing user base and could disrupt dedicated automation platforms.',
            tags: JSON.stringify(['workflow-automation', 'integrations', 'productivity', 'competition', 'platform-expansion']),
            publicOpinion: JSON.stringify({
                positive: 58,
                negative: 22,
                neutral: 20,
                totalMentions: 168
            }),
            sourceUrl: 'https://linkedin.com/posts/slack-automation-launch',
            detectedAt: new Date('2024-12-01T15:10:00Z').toISOString(),
            createdAt: new Date('2024-12-01T15:15:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 2,
            platform: 'twitter',
            content: 'Salesforce rolls out new Einstein GPT marketing campaign targeting small businesses with AI-powered lead scoring and automated email sequences. Campaign promises 50% improvement in lead conversion.',
            summary: 'Salesforce launches Einstein GPT marketing campaign for SMB market',
            insightType: 'marketing_campaign',
            sentiment: 'opportunity',
            priority: 'medium',
            keyPoints: JSON.stringify([
                'AI-powered lead scoring for small businesses',
                'Automated email marketing sequences',
                '50% lead conversion improvement claimed',
                'Targeting SMB market segment expansion'
            ]),
            recommendations: JSON.stringify([
                'Counter-market to SMBs highlighting our competitive advantages',
                'Develop AI-enhanced features for lead management',
                'Create case studies demonstrating superior ROI'
            ]),
            impact: 'Salesforce SMB push could pressure mid-market CRM providers but may create opportunities if execution falls short of promises.',
            tags: JSON.stringify(['marketing-campaign', 'AI', 'SMB', 'lead-scoring', 'email-marketing']),
            publicOpinion: JSON.stringify({
                positive: 41,
                negative: 34,
                neutral: 25,
                totalMentions: 95
            }),
            sourceUrl: 'https://twitter.com/salesforce/status/einstein-gpt-smb',
            detectedAt: new Date('2024-11-28T12:30:00Z').toISOString(),
            createdAt: new Date('2024-11-28T12:35:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 3,
            platform: 'company-blog',
            content: 'Notion reduces team plan pricing by 20% and introduces new free tier features including unlimited blocks and 5GB file storage. Move seen as aggressive play to capture market share from Confluence and OneNote.',
            summary: 'Notion cuts team pricing 20% and expands free tier to gain market share',
            insightType: 'pricing_change',
            sentiment: 'threat',
            priority: 'medium',
            keyPoints: JSON.stringify([
                '20% reduction in team plan pricing',
                'Expanded free tier with unlimited blocks',
                'Increased file storage to 5GB on free plans',
                'Aggressive market share capture strategy'
            ]),
            recommendations: JSON.stringify([
                'Review our pricing strategy against new Notion rates',
                'Evaluate free tier offerings and competitive positioning',
                'Monitor customer churn and acquisition trends'
            ]),
            impact: 'Aggressive pricing moves may force industry-wide price competition and pressure profitability across knowledge management platforms.',
            tags: JSON.stringify(['pricing', 'free-tier', 'market-share', 'knowledge-management', 'competition']),
            publicOpinion: JSON.stringify({
                positive: 79,
                negative: 6,
                neutral: 15,
                totalMentions: 234
            }),
            sourceUrl: 'https://notion.so/blog/pricing-update-2024',
            detectedAt: new Date('2024-11-25T14:15:00Z').toISOString(),
            createdAt: new Date('2024-11-25T14:20:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 1,
            platform: 'linkedin',
            content: 'HubSpot hires former Google Cloud VP of Sales Maria Rodriguez as Chief Revenue Officer. Rodriguez will focus on expanding international markets and enterprise segment growth strategies.',
            summary: 'HubSpot appoints Google Cloud executive as CRO for international expansion',
            insightType: 'executive_hire',
            sentiment: 'neutral',
            priority: 'low',
            keyPoints: JSON.stringify([
                'Former Google Cloud VP of Sales joins as CRO',
                'Focus on international market expansion',
                'Enterprise segment growth strategy leadership',
                'Extensive cloud sales experience'
            ]),
            recommendations: JSON.stringify([
                'Monitor HubSpot\'s international expansion plans',
                'Assess competitive threats in target markets'
            ]),
            impact: 'Senior executive hire indicates HubSpot\'s serious commitment to international growth and enterprise market penetration.',
            tags: JSON.stringify(['executive-hire', 'international-expansion', 'enterprise', 'Google-Cloud', 'CRO']),
            publicOpinion: JSON.stringify({
                positive: 62,
                negative: 8,
                neutral: 30,
                totalMentions: 87
            }),
            sourceUrl: 'https://linkedin.com/posts/hubspot-cro-hire',
            detectedAt: new Date('2024-11-22T10:45:00Z').toISOString(),
            createdAt: new Date('2024-11-22T10:50:00Z').toISOString(),
        },
        {
            userId: 'user_123',
            competitorId: 4,
            platform: 'company-blog',
            content: 'Figma introduces real-time voice collaboration feature allowing design teams to communicate directly within design files. Feature includes spatial audio and integrated screen sharing capabilities.',
            summary: 'Figma adds real-time voice collaboration with spatial audio to design platform',
            insightType: 'feature_update',
            sentiment: 'opportunity',
            priority: 'low',
            keyPoints: JSON.stringify([
                'Real-time voice communication in design files',
                'Spatial audio technology integration',
                'Built-in screen sharing capabilities',
                'Enhanced remote team collaboration'
            ]),
            recommendations: JSON.stringify([
                'Evaluate voice collaboration demand in our user base',
                'Consider audio communication features for our platform',
                'Research spatial audio technology applications'
            ]),
            impact: 'Voice collaboration feature addresses remote work challenges but may have limited impact outside design-specific workflows.',
            tags: JSON.stringify(['voice-collaboration', 'design-tools', 'remote-work', 'spatial-audio', 'team-features']),
            publicOpinion: JSON.stringify({
                positive: 71,
                negative: 11,
                neutral: 18,
                totalMentions: 142
            }),
            sourceUrl: 'https://figma.com/blog/voice-collaboration-launch',
            detectedAt: new Date('2024-11-20T16:20:00Z').toISOString(),
            createdAt: new Date('2024-11-20T16:25:00Z').toISOString(),
        }
    ];

    await db.insert(insights).values(sampleInsights);
    
    console.log('✅ Insights seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});