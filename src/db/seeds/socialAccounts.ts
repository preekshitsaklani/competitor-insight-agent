import { db } from '@/db';
import { socialAccounts } from '@/db/schema';

async function main() {
    const sampleSocialAccounts = [
        {
            competitorId: 1,
            platform: 'linkedin',
            handle: 'company/hubspot',
            url: 'https://www.linkedin.com/company/hubspot',
            isActive: true,
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            competitorId: 1,
            platform: 'twitter',
            handle: '@HubSpot',
            url: 'https://twitter.com/HubSpot',
            isActive: true,
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            competitorId: 2,
            platform: 'linkedin',
            handle: 'company/salesforce',
            url: 'https://www.linkedin.com/company/salesforce',
            isActive: true,
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            competitorId: 2,
            platform: 'twitter',
            handle: '@salesforce',
            url: 'https://twitter.com/salesforce',
            isActive: true,
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            competitorId: 3,
            platform: 'twitter',
            handle: '@notion',
            url: 'https://twitter.com/notion',
            isActive: true,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            competitorId: 3,
            platform: 'instagram',
            handle: '@notionhq',
            url: 'https://www.instagram.com/notionhq',
            isActive: true,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            competitorId: 4,
            platform: 'twitter',
            handle: '@figma',
            url: 'https://twitter.com/figma',
            isActive: true,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            competitorId: 4,
            platform: 'instagram',
            handle: '@figmadesign',
            url: 'https://www.instagram.com/figmadesign',
            isActive: true,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            competitorId: 5,
            platform: 'twitter',
            handle: '@stripe',
            url: 'https://twitter.com/stripe',
            isActive: true,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            competitorId: 5,
            platform: 'reddit',
            handle: 'u/stripe',
            url: 'https://www.reddit.com/user/stripe',
            isActive: false,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            competitorId: 6,
            platform: 'facebook',
            handle: 'HubSpot',
            url: 'https://www.facebook.com/HubSpot',
            isActive: true,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            competitorId: 6,
            platform: 'bluesky',
            handle: 'hubspot.bsky.social',
            url: 'https://bsky.app/profile/hubspot.bsky.social',
            isActive: true,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            competitorId: 7,
            platform: 'linkedin',
            handle: 'company/atlassian',
            url: 'https://www.linkedin.com/company/atlassian',
            isActive: true,
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            competitorId: 8,
            platform: 'twitter',
            handle: '@airtable',
            url: 'https://twitter.com/airtable',
            isActive: false,
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            competitorId: 3,
            platform: 'bluesky',
            handle: 'notion.bsky.social',
            url: 'https://bsky.app/profile/notion.bsky.social',
            isActive: true,
            createdAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(socialAccounts).values(sampleSocialAccounts);
    
    console.log('✅ Social accounts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});