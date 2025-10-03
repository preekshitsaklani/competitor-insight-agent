import { db } from '@/db';
import { competitors } from '@/db/schema';

async function main() {
    const sampleCompetitors = [
        {
            userId: 'user_123',
            name: 'HubSpot',
            websiteUrl: 'https://www.hubspot.com',
            logoUrl: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
            industry: 'CRM/Marketing Automation',
            status: 'active',
            monitoringFrequency: 'daily',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Salesforce',
            websiteUrl: 'https://www.salesforce.com',
            logoUrl: 'https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg',
            industry: 'CRM/Cloud Computing',
            status: 'active',
            monitoringFrequency: 'realtime',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Notion',
            websiteUrl: 'https://www.notion.so',
            logoUrl: 'https://www.notion.so/images/favicon.ico',
            industry: 'Productivity/Collaboration',
            status: 'active',
            monitoringFrequency: 'weekly',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Figma',
            websiteUrl: 'https://www.figma.com',
            logoUrl: 'https://www.figma.com/favicon.ico',
            industry: 'Design Tools/DevTools',
            status: 'active',
            monitoringFrequency: 'daily',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Stripe',
            websiteUrl: 'https://stripe.com',
            logoUrl: 'https://stripe.com/favicon.ico',
            industry: 'Payments/FinTech',
            status: 'paused',
            monitoringFrequency: 'weekly',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Datadog',
            websiteUrl: 'https://www.datadoghq.com',
            logoUrl: 'https://www.datadoghq.com/favicon.ico',
            industry: 'Monitoring/Analytics',
            status: 'active',
            monitoringFrequency: 'realtime',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Slack',
            websiteUrl: 'https://slack.com',
            logoUrl: 'https://slack.com/favicon.ico',
            industry: 'Communication/Collaboration',
            status: 'active',
            monitoringFrequency: 'daily',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 'user_123',
            name: 'Zoom',
            websiteUrl: 'https://zoom.us',
            logoUrl: 'https://zoom.us/favicon.ico',
            industry: 'Video Conferencing/Communication',
            status: 'paused',
            monitoringFrequency: 'weekly',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        }
    ];

    await db.insert(competitors).values(sampleCompetitors);
    
    console.log('✅ Competitors seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});