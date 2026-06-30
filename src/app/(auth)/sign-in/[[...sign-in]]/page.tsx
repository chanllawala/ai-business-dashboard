import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Business Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your businesses</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
