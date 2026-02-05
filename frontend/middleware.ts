import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Admin routes are protected by backend RolesGuard
    // Frontend just allows navigation - API calls will return 403 if not authorized
    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
