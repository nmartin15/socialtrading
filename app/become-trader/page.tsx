import { ConnectButton } from '@/components/ConnectButton';
import { TraderRegistrationForm } from '@/components/TraderRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function BecomeTraderPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🔮 DexMirror
          </Link>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Become a Trader</h1>
        <p className="text-muted-foreground mb-8">
          Share your trading expertise and earn from your followers
        </p>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="font-semibold">Monthly Income</div>
                <div className="text-sm text-muted-foreground">Set your price</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="font-semibold">Performance Fees</div>
                <div className="text-sm text-muted-foreground">Up to 20%</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">✨</div>
                <div className="font-semibold">Verified Badge</div>
                <div className="text-sm text-muted-foreground">Build reputation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Trader Registration</CardTitle>
            <CardDescription>Fill out the form below to become a verified trader</CardDescription>
          </CardHeader>
          <CardContent>
            <TraderRegistrationForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

