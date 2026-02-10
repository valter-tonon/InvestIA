export class AdminDashboardOutput {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    subscriptionsByPlan: Record<string, number>; // { "free": 10, "pro": 5, "premium": 2 }
    subscriptionsByStatus: {
        ACTIVE: number;
        CANCELED: number;
        EXPIRED: number;
        TRIAL: number;
    };
    recentActivity: {
        id: string;
        action: string;
        userId: string | null;
        details: unknown;
        createdAt: Date;
    }[];
}
