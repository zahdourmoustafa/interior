# InteriorAI Pro

AI-powered interior and exterior design platform built with Next.js, Drizzle ORM, and modern web technologies.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Neon.tech PostgreSQL with Drizzle ORM
- **Authentication**: BetterAuth with Google OAuth
- **API**: tRPC for type-safe APIs
- **UI**: Shadcn UI components with Tailwind CSS
- **State Management**: Tanstack Query
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon.tech database account
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your actual values in `.env.local`

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon.tech PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for BetterAuth |
| `BETTER_AUTH_URL` | Your app URL (http://localhost:3000 for dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Database Commands

- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   └── ui/               # Shadcn UI components
├── lib/                  # Core libraries
│   ├── db/              # Database schema and config
│   ├── server/          # tRPC server setup
│   ├── auth.ts          # BetterAuth configuration
│   └── trpc.ts          # tRPC client setup
├── providers/           # Context providers
└── hooks/              # Custom React hooks
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the existing component patterns
- Use the provided ESLint configuration
- Run `npm run lint` before committing

### Component Structure
- Use functional components with TypeScript
- Follow Shadcn UI patterns for consistency
- Implement proper loading and error states
- Ensure responsive design

### Database Changes
- Always use Drizzle migrations
- Test database changes locally first
- Update the schema documentation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:*` - Database commands (see above)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Ensure CI checks pass

## Next Steps

Phase 1 is complete! You can now:
1. Set up your Neon.tech database and update DATABASE_URL
2. Configure Google OAuth credentials
3. Run `npm run db:push` to create the database schema
4. Start building Phase 2 features (Dashboard)
