import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // SEC-007: CSRF Protection using Double Submit Cookie pattern

        // 1. Generate or retrieve CSRF token
        let csrfToken = req.cookies['XSRF-TOKEN'];

        if (!csrfToken) {
            csrfToken = randomBytes(32).toString('hex');
            res.cookie('XSRF-TOKEN', csrfToken, {
                httpOnly: false, // Frontend needs to read this
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
        }

        // 2. Validate token on state-changing requests
        const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

        if (statefulMethods.includes(req.method)) {
            const headerToken = req.headers['x-xsrf-token'] as string;

            if (!headerToken || headerToken !== csrfToken) {
                throw new ForbiddenException('Invalid CSRF token');
            }
        }

        next();
    }
}
