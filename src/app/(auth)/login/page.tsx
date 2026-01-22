import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stars } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Stars className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your charts
          </p>
        </div>

        {/* Login Form - Will be implemented next */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            Login form will be implemented in the next phase
          </p>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
