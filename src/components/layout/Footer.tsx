import Link from 'next/link';
import { Stars } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-border bg-background ${className || ''}`}>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Stars className="h-5 w-5 text-primary" />
              <span className="font-semibold">Astrotattwa</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Accurate Vedic astrology with Swiss Ephemeris precision.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link 
              href="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Astrotattwa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
