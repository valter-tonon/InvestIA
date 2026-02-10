import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AdminDashboardOutput } from '../dtos/admin-dashboard.output';

@Injectable()
export class GetAdminDashboardUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(): Promise<AdminDashboardOutput> {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(todayStart);
        monthStart.setMonth(monthStart.getMonth() - 1);

        const [
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth,
            subscriptionsByPlan,
            subscriptionsByStatus,
            recentActivity,
        ] = await Promise.all([
            // Total users (excluding soft-deleted)
            this.prisma.user.count({
                where: { deleted_at: null },
            }),
            // Active users (logged in last 30 days - approximated by updatedAt)
            this.prisma.user.count({
                where: {
                    deleted_at: null,
                    updatedAt: { gte: monthStart },
                },
            }),
            // New users today
            this.prisma.user.count({
                where: {
                    deleted_at: null,
                    createdAt: { gte: todayStart },
                },
            }),
            // New users this week
            this.prisma.user.count({
                where: {
                    deleted_at: null,
                    createdAt: { gte: weekStart },
                },
            }),
            // New users this month
            this.prisma.user.count({
                where: {
                    deleted_at: null,
                    createdAt: { gte: monthStart },
                },
            }),
            // Subscriptions grouped by plan
            this.prisma.subscription.groupBy({
                by: ['planId'],
                _count: { id: true },
            }),
            // Subscriptions grouped by status
            this.prisma.subscription.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            // Recent activity logs
            this.prisma.activityLog.findMany({
                take: 20,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        // Transform groupBy results into structured objects
        const planCounts: Record<string, number> = {};
        for (const item of subscriptionsByPlan) {
            planCounts[item.planId] = item._count.id;
        }

        // Get plan names for the counts
        const plans = await this.prisma.plan.findMany({
            where: { id: { in: Object.keys(planCounts) } },
            select: { id: true, name: true },
        });

        const planCountsByName: Record<string, number> = {};
        for (const plan of plans) {
            planCountsByName[plan.name] = planCounts[plan.id] || 0;
        }

        const statusCounts = { ACTIVE: 0, CANCELED: 0, EXPIRED: 0, TRIAL: 0 };
        for (const item of subscriptionsByStatus) {
            statusCounts[item.status] = item._count.id;
        }

        return {
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth,
            subscriptionsByPlan: planCountsByName,
            subscriptionsByStatus: statusCounts,
            recentActivity,
        };
    }
}
