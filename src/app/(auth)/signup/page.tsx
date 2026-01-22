import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stars } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Stars className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start exploring your cosmic blueprint
          </p>
        </div>

        {/* Signup Form - Will be implemented next */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            Signup form will be implemented in the next phase
          </p>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
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
