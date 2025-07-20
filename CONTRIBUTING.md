# Contributing to InteriorAI Pro

## Development Setup

1. Ensure you have Node.js 18+ installed
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure your environment variables
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper types for all props and return values
- Avoid `any` type - use proper type definitions

### Component Structure
```typescript
interface ComponentProps {
  // Define props with proper types
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component implementation
}
```

### File Naming
- Use kebab-case for file names: `user-profile.tsx`
- Use PascalCase for component exports: `UserProfile`
- Use camelCase for utilities: `formatDate.ts`

### Styling
- Use Tailwind CSS utility classes
- Follow Shadcn UI patterns for component styling
- Ensure responsive design with mobile-first approach

### Database
- Always use Drizzle migrations for schema changes
- Write proper TypeScript types for database queries
- Test database changes locally before pushing

## Git Workflow

### Branch Naming
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/update-description`

### Commit Messages
Use conventional commits format:
- `feat: add new dashboard component`
- `fix: resolve image upload issue`
- `docs: update API documentation`

### Pull Request Process
1. Create feature branch from `main`
2. Make focused, atomic commits
3. Ensure all tests pass
4. Update documentation if needed
5. Create PR with clear description
6. Address review feedback
7. Squash merge when approved

## Testing

### Before Committing
- Run `npm run lint` to check code style
- Test the feature manually
- Check responsive design on different screen sizes
- Verify no console errors

### Testing Checklist
- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] No console warnings or errors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Database queries are optimized
- [ ] Error handling is implemented

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Local Development
1. Create a Neon.tech database
2. Set up Google OAuth credentials in Google Cloud Console
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations

# Testing
npm run test         # Run tests (when added)
```

## Getting Help

- Check existing issues before creating new ones
- Use GitHub Discussions for questions
- Tag maintainers for urgent issues
- Provide detailed reproduction steps for bugs