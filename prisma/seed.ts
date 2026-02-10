import { PrismaClient, UserRole, PlanInterval, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeder...');

    // 1. Create default plans
    console.log('📦 Creating default plans...');

    const freePlan = await prisma.plan.upsert({
        where: { name: 'free' },
        update: {},
        create: {
            name: 'free',
            displayName: 'Plano Free',
            description: 'Plano gratuito com funcionalidades básicas',
            price: 0,
            interval: PlanInterval.MONTHLY,
            features: {
                maxAssets: 5,
                maxWallets: 1,
                maxAlerts: 3,
                aiAnalysis: false,
                prioritySupport: false,
            },
            maxAssets: 5,
            maxWallets: 1,
            maxAlerts: 3,
            aiAnalysis: false,
            prioritySupport: false,
            customizable: false,
            active: true,
            sortOrder: 1,
        },
    });

    const proPlan = await prisma.plan.upsert({
        where: { name: 'pro' },
        update: {},
        create: {
            name: 'pro',
            displayName: 'Plano Pro',
            description: 'Plano profissional com análise AI e recursos avançados',
            price: 49.90,
            interval: PlanInterval.MONTHLY,
            features: {
                maxAssets: 50,
                maxWallets: 5,
                maxAlerts: 20,
                aiAnalysis: true,
                prioritySupport: false,
                advancedCharts: true,
                exportReports: true,
            },
            maxAssets: 50,
            maxWallets: 5,
            maxAlerts: 20,
            aiAnalysis: true,
            prioritySupport: false,
            customizable: false,
            active: true,
            sortOrder: 2,
        },
    });

    const premiumPlan = await prisma.plan.upsert({
        where: { name: 'premium' },
        update: {},
        create: {
            name: 'premium',
            displayName: 'Plano Premium',
            description: 'Plano completo com recursos ilimitados e suporte prioritário',
            price: 99.90,
            interval: PlanInterval.MONTHLY,
            features: {
                maxAssets: null,
                maxWallets: null,
                maxAlerts: null,
                aiAnalysis: true,
                prioritySupport: true,
                advancedCharts: true,
                exportReports: true,
                customAlerts: true,
                apiAccess: true,
            },
            maxAssets: null, // ilimitado
            maxWallets: null, // ilimitado
            maxAlerts: null, // ilimitado
            aiAnalysis: true,
            prioritySupport: true,
            customizable: false,
            active: true,
            sortOrder: 3,
        },
    });

    console.log(`✅ Created plans: ${freePlan.displayName}, ${proPlan.displayName}, ${premiumPlan.displayName}`);

    // 2. Upsert super admin user
    console.log('👤 Creating/updating super admin user...');
    const superAdminEmail = 'tononvalter@gmail.com';

    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {
            role: UserRole.SUPER_ADMIN,
        },
        create: {
            email: superAdminEmail,
            name: 'Valter Tonon',
            password: '$2b$10$placeholder', // This will be replaced if user already exists
            role: UserRole.SUPER_ADMIN,
        },
    });

    console.log(`✅ Super Admin user: ${superAdmin.email} (role: ${superAdmin.role})`);

    // 3. Create subscription for super admin with Premium plan
    const subscription = await prisma.subscription.upsert({
        where: { userId: superAdmin.id },
        update: {
            planId: premiumPlan.id,
            status: SubscriptionStatus.ACTIVE,
        },
        create: {
            userId: superAdmin.id,
            planId: premiumPlan.id,
            status: SubscriptionStatus.ACTIVE,
        },
    });

    console.log(`✅ Subscription created for ${superAdmin.email}: ${premiumPlan.displayName} (${subscription.status})`);

    // 4. Log the seeding activity
    await prisma.activityLog.create({
        data: {
            userId: superAdmin.id,
            action: 'SEEDER_COMPLETED',
            details: {
                email: superAdmin.email,
                role: superAdmin.role,
                plan: premiumPlan.name,
                plansCreated: [freePlan.name, proPlan.name, premiumPlan.name],
            },
        },
    });

    console.log('✅ Seeder completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Plans created: 3 (Free, Pro, Premium)`);
    console.log(`   - Super Admin: ${superAdmin.email}`);
    console.log(`   - Subscription: ${premiumPlan.displayName}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeder failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
