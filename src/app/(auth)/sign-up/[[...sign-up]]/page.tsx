import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { isClerkConfigured } from '@/lib/clerk'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Start managing your businesses with AI</p>
        </div>
        {isClerkConfigured() ? (
          <SignUp />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            <p className="mb-3 font-medium text-gray-700">Sign-up isn&apos;t set up yet.</p>
            <p className="mb-4">Add real Clerk keys to <code className="rounded bg-gray-100 px-1">.env.local</code> to enable authentication.</p>
            <Link href="/" className="font-medium text-indigo-600 hover:underline">
              Continue without an account
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
