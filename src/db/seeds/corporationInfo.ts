import { db } from '@/db';
import { corporationInfo } from '@/db/schema';

async function main() {
    const sampleCorporationInfo = [
        {
            userId: 'user_123',
            companySize: 150,
            companyDescription: 'A fast-growing SaaS company specializing in customer relationship management solutions for small to medium businesses. We help companies streamline their sales processes and improve customer retention through innovative automation tools.',
            industry: 'SaaS',
            topEmployees: [
                {
                    name: 'Sarah Chen',
                    role: 'Head of Product',
                    currentWork: 'Leading the development of our new AI-powered analytics dashboard',
                    futurePlans: 'Expanding the product suite to include predictive customer behavior models'
                },
                {
                    name: 'Marcus Rodriguez',
                    role: 'VP of Engineering',
                    currentWork: 'Overseeing platform scalability and performance optimization',
                    futurePlans: 'Building a microservices architecture to support enterprise clients'
                },
                {
                    name: 'Emily Watson',
                    role: 'Director of Sales',
                    currentWork: 'Establishing partnerships with integration platforms',
                    futurePlans: 'Launching our enterprise sales division for Fortune 500 companies'
                }
            ],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
        },
        {
            userId: 'user_124',
            companySize: 25,
            companyDescription: 'An innovative FinTech startup revolutionizing digital payments for emerging markets. We provide secure, low-cost financial services to underbanked populations through mobile-first solutions.',
            industry: 'FinTech',
            topEmployees: [
                {
                    name: 'David Kim',
                    role: 'CTO',
                    currentWork: 'Developing blockchain-based payment infrastructure',
                    futurePlans: 'Implementing cross-border payment capabilities'
                },
                {
                    name: 'Priya Patel',
                    role: 'Head of Compliance',
                    currentWork: 'Ensuring regulatory compliance across multiple jurisdictions',
                    futurePlans: 'Obtaining banking licenses in key African markets'
                }
            ],
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-02-10'),
        },
        {
            userId: 'user_125',
            companySize: 500,
            companyDescription: 'A leading AI and machine learning company focused on computer vision and natural language processing. We develop enterprise AI solutions that help businesses automate complex decision-making processes.',
            industry: 'AI/ML',
            topEmployees: [
                {
                    name: 'Dr. James Liu',
                    role: 'Chief AI Officer',
                    currentWork: 'Research on large language model optimization for enterprise applications',
                    futurePlans: 'Launching industry-specific AI models for healthcare and finance'
                },
                {
                    name: 'Rachel Green',
                    role: 'VP of Business Development',
                    currentWork: 'Securing strategic partnerships with cloud providers',
                    futurePlans: 'Expanding into European and Asian markets'
                },
                {
                    name: 'Alex Thompson',
                    role: 'Lead ML Engineer',
                    currentWork: 'Building real-time inference pipelines for computer vision',
                    futurePlans: 'Developing edge computing solutions for autonomous systems'
                }
            ],
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date('2024-03-05'),
        },
        {
            userId: 'user_126',
            companySize: 10,
            companyDescription: 'A boutique e-commerce technology company specializing in personalized shopping experiences. We create custom recommendation engines and conversion optimization tools for online retailers.',
            industry: 'E-commerce',
            topEmployees: [
                {
                    name: 'Lisa Chang',
                    role: 'Founder & CEO',
                    currentWork: 'Developing our proprietary recommendation algorithm',
                    futurePlans: 'Raising Series A funding to expand the engineering team'
                },
                {
                    name: 'Mike Johnson',
                    role: 'Senior Developer',
                    currentWork: 'Building integrations with major e-commerce platforms',
                    futurePlans: 'Leading the mobile app development initiative'
                }
            ],
            createdAt: new Date('2024-04-12'),
            updatedAt: new Date('2024-04-12'),
        },
        {
            userId: 'user_127',
            companySize: 1200,
            companyDescription: 'An established cybersecurity firm providing comprehensive threat detection and response solutions for enterprise clients. We protect critical infrastructure and sensitive data across multiple industries.',
            industry: 'Cybersecurity',
            topEmployees: [
                {
                    name: 'Robert Taylor',
                    role: 'Chief Security Officer',
                    currentWork: 'Leading our zero-trust architecture implementation',
                    futurePlans: 'Expanding our threat intelligence capabilities with AI-driven analysis'
                },
                {
                    name: 'Jennifer Martinez',
                    role: 'VP of Enterprise Sales',
                    currentWork: 'Managing relationships with Fortune 100 clients',
                    futurePlans: 'Establishing government sector partnerships'
                },
                {
                    name: 'Kevin Brown',
                    role: 'Director of R&D',
                    currentWork: 'Researching quantum-resistant encryption methods',
                    futurePlans: 'Developing next-generation endpoint protection solutions'
                }
            ],
            createdAt: new Date('2024-05-20'),
            updatedAt: new Date('2024-05-20'),
        }
    ];

    await db.insert(corporationInfo).values(sampleCorporationInfo);
    
    console.log('✅ Corporation info seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});