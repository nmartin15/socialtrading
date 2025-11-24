import { ConnectButton } from '@/components/ConnectButton';
import { TraderRegistrationForm } from '@/components/TraderRegistrationForm';
import Link from 'next/link';

export default function BecomeTraderPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Social Trading
          </Link>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Become a Trader</h1>
        <p className="text-gray-400 mb-8">
          Share your trading expertise and earn from your followers
        </p>

        {/* Benefits Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold text-sm">Monthly Income</div>
              <div className="text-xs text-gray-400">Set your price</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="font-semibold text-sm">Performance Fees</div>
              <div className="text-xs text-gray-400">Up to 20%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✨</div>
              <div className="font-semibold text-sm">Verified Badge</div>
              <div className="text-xs text-gray-400">Build reputation</div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Trader Registration</h2>
          <TraderRegistrationForm />
        </div>
      </div>
    </main>
  );
}

