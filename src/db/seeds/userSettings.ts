import { db } from '@/db';
import { userSettings } from '@/db/schema';

async function main() {
    const sampleUserSettings = [
        {
            userId: 'user_123',
            emailEnabled: true,
            emailFrequency: 'daily',
            slackEnabled: true,
            slackWebhookUrl: 'https://hooks.slack.com/services/T01234567/B01234567/abc123def456ghi789jkl012',
            preferredDeliveryTime: '09:00',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_456',
            emailEnabled: false,
            emailFrequency: 'weekly',
            slackEnabled: false,
            slackWebhookUrl: null,
            preferredDeliveryTime: '14:00',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: 'user_789',
            emailEnabled: true,
            emailFrequency: 'weekly',
            slackEnabled: true,
            slackWebhookUrl: 'https://hooks.slack.com/services/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',
            preferredDeliveryTime: '18:00',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        }
    ];

    await db.insert(userSettings).values(sampleUserSettings);
    
    console.log('✅ User settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});