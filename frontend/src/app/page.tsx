import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div 
          className="relative bg-cover bg-center h-[600px]" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=2080&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 flex items-center z-20 px-6 lg:px-8">
            <div className="max-w-2xl backdrop-blur-md bg-card/30 p-8 rounded-xl shadow-lg border border-white/10 animate-fadeIn">
              <h1 className="text-white text-5xl font-bold mb-4 font-heading">
                Table Tennis Tournament Manager
              </h1>
              <p className="text-white/90 text-xl mb-8">
                Organize and manage your table tennis tournaments with ease. Create tournaments, manage players, and track matches all in one place.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/tournaments"
                  className="inline-flex items-center rounded-md bg-primary/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-primary transition-colors shadow-lg"
                >
                  View Tournaments
                </Link>
                <Link
                  href="/tournaments/new"
                  className="inline-flex items-center rounded-md bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/30 transition-colors shadow-md"
                >
                  Create Tournament
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="space-y-8 py-6">
        <div className="text-center">
          <h2 className="text-foreground text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Everything you need to run professional table tennis tournaments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="wtt-card-interactive p-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Player Management</h3>
            <p className="text-muted-foreground">
              Easily create and manage player profiles with rankings and stats.
            </p>
          </div>

          <div className="wtt-card-interactive p-6">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Tournament Scheduler</h3>
            <p className="text-muted-foreground">
              Create tournaments with flexible start and end dates.
            </p>
          </div>

          <div className="wtt-card-interactive p-6">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Match Tracking</h3>
            <p className="text-muted-foreground">
              Track match results and statistics in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="wtt-card-accent p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="inline-block h-1 w-24 bg-gradient-to-r from-primary/70 to-secondary/70 mb-6 rounded-full"></div>
        <h2 className="text-foreground text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-foreground/80 text-lg mb-6 max-w-2xl mx-auto">
          Create your first tournament today and experience the easiest way to manage table tennis competitions.
        </p>
        <Link
          href="/tournaments/new"
          className="inline-flex items-center rounded-md bg-card border border-primary px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors"
        >
          Create Tournament Now
        </Link>
      </div>
    </div>
  )
} 