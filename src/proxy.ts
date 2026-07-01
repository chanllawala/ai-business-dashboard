import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isClerkConfigured } from '@/lib/clerk'

const isPublic = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/health'])

export const proxy = isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublic(req)) await auth.protect()
    })
  : function proxy() {
      return NextResponse.next()
    }

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
