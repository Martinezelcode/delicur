# Vercel Deployment Instructions

## Prerequisites
1. Vercel account
2. PostgreSQL database (Neon, Supabase, or other)
3. Replit account for authentication

## Steps to Deploy

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Build the Application
```bash
npm run build
```

### 3. Set Environment Variables in Vercel
In your Vercel dashboard, add these environment variables:

- `DATABASE_URL` - Your PostgreSQL connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name
- `REPL_ID` - Your Replit app ID
- `ISSUER_URL` - https://replit.com/oidc
- `REPLIT_DOMAINS` - Your Vercel domain (e.g., your-app.vercel.app)
- `SESSION_SECRET` - Random string for session encryption
- `NODE_ENV` - production

### 4. Deploy to Vercel
```bash
vercel --prod
```

### 5. Set Up Database
After deployment, run the database migration:
```bash
vercel env pull .env.local
npm run db:push
```

### 6. Update Replit Auth
In your Replit app settings, add your Vercel domain as an allowed callback URL.

## Admin Access
- Admin login: `https://your-app.vercel.app/admin-login`
- Uses Replit authentication system

## Testing
Test the tracking system with these sample order numbers:
- LBC-2024-001
- LBC-2024-002  
- LBC-2024-003