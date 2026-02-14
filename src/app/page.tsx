import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stars, Calculator, Lock, Zap } from 'lucide-react'
import BirthDataFormWrapper from '@/components/forms/BirthDataFormWrapper'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Astrotattwa</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero + Form Section */}
        <section className="container py-12">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Hero Text */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Cosmic Blueprint,
                <span className="text-primary"> Accurately Calculated</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Free Vedic astrology birth charts with Swiss Ephemeris precision.
                Explore your planets, dashas, and yogas—no hidden costs.
              </p>
              
              {/* Features List */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="text-sm">100% Accurate Swiss Ephemeris calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm">All chart data is free forever</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm">No login required to calculate</span>
                </div>
              </div>
            </div>

            {/* Right: Chart Creation Form */}
            <div className="rounded-lg border bg-card p-6 shadow-sm lg:p-8">
              <h2 className="mb-6 text-2xl font-bold">Create Your Birth Chart</h2>
              <BirthDataFormWrapper />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-12 md:py-24">
          <div className="container">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Calculator className="mb-4 h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold">100% Accurate</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Swiss Ephemeris calculations match professional software
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Lock className="mb-4 h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold">Always Free</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All your chart data is free forever—no paywalls
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap className="mb-4 h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold">Modern & Fast</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Beautiful mobile-first design that just works
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col gap-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 Astrotattwa. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
