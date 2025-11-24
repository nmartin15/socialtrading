import { ConnectButton } from '@/components/ConnectButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-black/50">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Social Trading
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 mb-8 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Powered by Codex Blockchain</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Copy the Best Traders
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              on Codex Blockchain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Follow and automatically copy trades from verified traders
            <br className="hidden sm:block" />
            on the Codex blockchain
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/traders">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg font-bold shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-105 transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary glow">
                Browse Traders
              </Button>
            </Link>
            <Link href="/become-trader">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg font-bold border-2 hover:bg-primary/10 hover:scale-105 transition-all">
                Become a Trader
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure & Trustless</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Non-Custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Transparent Tracking</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all glow">
            <div className="text-5xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-3">
              1776
            </div>
            <div className="text-muted-foreground font-semibold">Chain ID</div>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-accent/30 shadow-2xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all glow">
            <div className="text-5xl font-black bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent mb-3">
              DEX
            </div>
            <div className="text-muted-foreground font-semibold">Native Token</div>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all glow">
            <div className="text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3 animate-gradient">
              EVM
            </div>
            <div className="text-muted-foreground font-semibold">Compatible</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Start copy trading in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/20 hover:-translate-y-1 glow-hover">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Discover Traders</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse verified traders, view their performance history, trading strategies, and track records
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-border hover:border-accent/50 transition-all shadow-xl hover:shadow-accent/20 hover:-translate-y-1 glow-hover">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
                <span className="text-4xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Connect & Subscribe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your wallet and subscribe to traders you want to copy. Set your own limits and preferences
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/20 hover:-translate-y-1 glow-hover">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <span className="text-4xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Earn Automatically</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your trades are automatically executed when the trader makes a move. Track your profits in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2024 Social Trading Platform. Built on Codex Blockchain.</p>
        </div>
      </footer>
    </main>
  );
}

