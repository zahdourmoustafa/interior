# ArchiCassoAI - Interior Design Platform

Transform your space with AI-powered interior design tools.

## Features

- **AI-Powered Design**: Generate stunning interior designs using artificial intelligence
- **Multiple Tools**: Room redesign, furniture placement, style matching, and more
- **Video Generation**: Create dynamic videos of your designs
- **Professional Results**: High-quality outputs suitable for commercial use

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Neon, Drizzle ORM
- **Authentication**: NextAuth.js
- **Payments**: Creem.io
- **AI Services**: Vercel AI SDK, Gemini, Replicate
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommend Neon)
- Creem.io account for payments

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interior
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="your_neon_postgresql_url"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Creem Payment Gateway
CREEM_SECRET_KEY="your_creem_secret_key"
CREEM_PUBLISHABLE_KEY="your_creem_publishable_key"
CREEM_WEBHOOK_SECRET="your_creem_webhook_secret"

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
REPLICATE_API_TOKEN="your_replicate_token"
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Payment Integration

This project uses Creem.io for subscription billing and payment processing:

### Creem.io Setup

1. **Create Account**: Sign up at [creem.io](https://creem.io)
2. **Get API Keys**: Obtain your secret and publishable keys from the dashboard
3. **Configure Webhooks**: Set webhook endpoint to `https://yourdomain.com/api/webhooks/creem`
4. **Environment Variables**: Add your Creem keys to `.env.local`

### Payment Features

- **Subscription Plans**: Basic ($19/month), Pro ($39/month), Expert ($79/month)
- **Annual Billing**: Discounted yearly pricing options
- **Checkout Flow**: Secure payment processing with Creem
- **Webhook Handling**: Automatic subscription status updates
- **Customer Portal**: Self-service subscription management

### Testing Payments

Use Creem's test mode for development:
- Test card numbers and webhooks are available in Creem documentation
- Switch to production keys when ready to go live

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── checkout/      # Payment checkout endpoints
│   │   └── webhooks/      # Webhook handlers
│   ├── checkout/          # Payment success/cancel pages
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
│   ├── landing/          # Landing page components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── creem.ts         # Creem payment service
│   ├── db/              # Database schema and connection
│   └── ai/              # AI service integrations
└── providers/            # Context providers
```

## Deployment

1. **Vercel Deployment**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

2. **Database Migration**:
   ```bash
   npm run db:push
   ```

3. **Webhook Configuration**:
   - Update Creem webhook URL to your production domain
   - Test webhook delivery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Support

For support, email support@archicassoai.com or create an issue in this repository.
