// Clerk is optional — the app works fully without it (no login required).
// It only activates once real keys are added to .env.local.
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!key && key.startsWith('pk_') && !key.includes('your_clerk')
}
