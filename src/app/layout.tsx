import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ApkaNeta — Transparent. Accountable.',
  description: 'Track your elected representatives, their promises, public works tenders, and fund utilization — all in one place.',
  keywords: ['ApkaNeta', 'civic transparency', 'India elections', 'public works', 'government tenders', 'Bhiwadi', 'Rajasthan'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* ── Top Nav ── */}
        <header
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(244,161,24,0.18)',
          }}
          className="sticky top-0 z-50 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow"
                style={{ background: 'linear-gradient(135deg, #F4A118 0%, #C4790A 100%)' }}
              >
                AN
              </div>
              <div>
                <div className="font-bold text-base leading-none" style={{ color: '#1A1208' }}>
                  ApkaNeta
                </div>
                <div className="text-[10px] font-medium" style={{ color: '#C4790A' }}>
                  अपना नेता
                </div>
              </div>
            </a>

            {/* Tagline (hidden on mobile) */}
            <p className="hidden md:block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Your Elected Representative · Transparent · Accountable
            </p>

            {/* Language toggle slot — i18n ready */}
            <div className="flex items-center gap-2">
              <button
                className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--saffron-dark)', background: 'var(--saffron-light)' }}
              >
                EN
              </button>
              {/* HI button — add onClick when Hindi translations ready */}
              <button
                className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-all opacity-40 cursor-not-allowed"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                title="Hindi coming soon"
              >
                हिं
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="border-t mt-12 py-6 px-4 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ApkaNeta · Data sourced from official government portals ·&nbsp;
            <span className="font-medium" style={{ color: 'var(--saffron-dark)' }}>Not affiliated with any political party</span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Pilot Phase: Bhiwadi, Rajasthan · Sprint 1 — Prototype
          </p>
        </footer>
      </body>
    </html>
  )
}
