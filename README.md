# AI Business Dashboard

A multi-business management dashboard with an AI advisor powered by Groq (free, Llama 3). Manage customers, employees, sales, expenses, tasks, meetings, and documents — and let the AI add data for you, answer questions, and give real business advice.

## Features

- **Multiple businesses** — manage several businesses from one login
- **AI Business Advisor** — powered by Groq (free Llama 3.3 70B)
  - Answers questions about your data
  - Gives real business advice and recommendations
  - Adds data for you via chat (confirms with you before saving)
- **Full data management** — add, edit, delete: customers, employees, sales, expenses, tasks, meetings, documents
- **Business Summary** — AI writes a shareable report you can copy or download
- **Notes & Reminders** — AI reads these and factors them into advice
- **Security** — rate limiting, input validation, action whitelisting, CSP headers

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **AI**: [Groq](https://console.groq.com) — free, fast Llama 3.3 70B
- **State**: Zustand with localStorage persistence
- **Icons**: Lucide React

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/chanllawala/ai-business-dashboard.git
cd ai-business-dashboard
npm install
```

### 2. Add your Groq API key

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your key:

```
GROQ_API_KEY=gsk_your_key_here
```

Get a free key in 30 seconds at [console.groq.com](https://console.groq.com) — no credit card needed.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to Settings, add a business, and start using the AI assistant.

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variable: `GROQ_API_KEY` → your key
4. Click Deploy

Your dashboard will be live on a `*.vercel.app` URL in about 60 seconds.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Free at [console.groq.com](https://console.groq.com) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk auth (optional) |
| `CLERK_SECRET_KEY` | No | Clerk auth (optional) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Cloud database (optional) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Cloud database (optional) |

## How the AI confirmation flow works

1. You type: *"Add Kirtan as a customer"*
2. AI replies: *"Shall I add Kirtan as a customer?"* and shows a confirmation card
3. You press **Yes, add it** → saved instantly to the dashboard
4. Or press **No, cancel** → nothing happens

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── [businessId]/       # per-business pages
│   │   │   ├── overview/
│   │   │   ├── customers/
│   │   │   ├── employees/
│   │   │   ├── sales/
│   │   │   ├── expenses/
│   │   │   ├── documents/
│   │   │   ├── meetings/
│   │   │   ├── tasks/
│   │   │   └── ai-assistant/
│   │   ├── notifications/      # Notes & Reminders
│   │   └── settings/
│   └── api/ai/                 # Groq endpoints
├── components/                 # UI components
├── lib/
│   ├── ai.ts                   # Groq + action parsing
│   └── security.ts             # Rate limiting + validation
└── stores/                     # Zustand stores
```

## License

MIT
