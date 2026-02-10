# Deployment Guide - Super Admin Panel

## Prerequisites
- Docker and Docker Compose installed
- Access to production server
- Database backup (recommended)

## Deployment Steps

### 1. Database Migration

SSH into your production server and navigate to the project directory:

```bash
cd /path/to/InvestIA
```

Run the migration:

```bash
# Using Docker Compose
docker-compose exec backend npx prisma migrate deploy

# Or if running locally
npx prisma migrate deploy
```

This will apply the migration that adds:
- `subscriptions` table
- `activity_logs` table
- New enums: `SubscriptionPlan`, `SubscriptionStatus`
- `subscription` relation to `users` table

### 2. Run Seeder

After the migration, run the seeder to set your user as SUPER_ADMIN:

```bash
# Using Docker Compose
docker-compose exec backend npx prisma db seed

# Or if running locally
npx prisma db seed
```

This will:
- Find or create user `tononvalter@gmail.com`
- Set role to `SUPER_ADMIN`
- Create a `PREMIUM` subscription with `ACTIVE` status
- Log the action in `activity_logs`

**Note:** If the user already exists, only the role will be updated.

### 3. Verify Super Admin Access

1. Login with `tononvalter@gmail.com`
2. Navigate to `/super-admin`
3. You should see the admin dashboard

If you get redirected to `/dashboard`, check:
- User role in database: `SELECT email, role FROM users WHERE email = 'tononvalter@gmail.com';`
- Browser console for errors
- Backend logs for authentication issues

### 4. Update Environment Variables

Add to your `.env` file:

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Enable GA in development (optional)
NEXT_PUBLIC_GA_ENABLED=true
```

### 5. Rebuild and Restart

```bash
# Rebuild containers
docker-compose build

# Restart services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Manual Database Update (Alternative)

If you prefer to update the role manually without running the seeder:

```sql
-- Update existing user to SUPER_ADMIN
UPDATE users 
SET role = 'SUPER_ADMIN' 
WHERE email = 'tononvalter@gmail.com';

-- Create subscription if doesn't exist
INSERT INTO subscriptions (id, user_id, plan, status, start_date, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    'PREMIUM',
    'ACTIVE',
    NOW(),
    NOW(),
    NOW()
FROM users 
WHERE email = 'tononvalter@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
```

## Troubleshooting

### Migration Fails
- Check database connection
- Verify DATABASE_URL in .env
- Check for conflicting table names
- Review migration file in `prisma/migrations/`

### Seeder Fails
- Ensure migration ran successfully
- Check if user exists: `SELECT * FROM users WHERE email = 'tononvalter@gmail.com';`
- Verify Prisma client is generated: `npx prisma generate`

### Can't Access Admin Panel
- Clear browser cache and cookies
- Check user role: `SELECT email, role FROM users WHERE email = 'tononvalter@gmail.com';`
- Verify JWT token includes role field
- Check browser console for errors

## Rollback (if needed)

If you need to rollback the migration:

```bash
# This will revert the last migration
docker-compose exec backend npx prisma migrate resolve --rolled-back <migration-name>
```

**Warning:** This will delete the `subscriptions` and `activity_logs` tables!

## Next Steps

After successful deployment:
1. Test all admin features (users, subscriptions, dashboard)
2. Create additional admin users if needed
3. Configure Google Analytics with real measurement ID
4. Set up monitoring for admin actions via activity logs
