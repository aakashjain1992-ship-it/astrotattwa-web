'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  variant?: 'default' | 'minimal';
  showNav?: boolean;
  className?: string;
}

export function Header({ variant = 'default', showNav = true, className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'sticky top-0 z-50',
      className
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {showNav && (
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {showNav && mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Login</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
