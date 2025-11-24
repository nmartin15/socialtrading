import { ConnectButton } from '@/components/ConnectButton';
import { TradeSubmissionForm } from '@/components/TradeSubmissionForm';
import Link from 'next/link';

export default function SubmitTradePage() {
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
        {/* Back Button */}
        <Link
          href="/my-trades"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          ← Back to My Trades
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Submit Trade</h1>
          <p className="text-gray-400">
            Record your trading activity to build your track record and attract copiers.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <div className="text-blue-400 text-xl">ℹ️</div>
            <div>
              <h3 className="text-blue-300 font-semibold mb-1">Important Information</h3>
              <ul className="text-sm text-blue-200/80 space-y-1">
                <li>• All trades are publicly visible on your profile</li>
                <li>• Transaction hashes must be unique and valid</li>
                <li>• Token symbols should be uppercase (e.g., ETH, USDC)</li>
                <li>• Accurate data builds trust with potential copiers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <TradeSubmissionForm />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need help? Check out the{' '}
            <Link href="/traders" className="text-blue-500 hover:text-blue-400">
              top traders
            </Link>{' '}
            to see how they track their trades.
          </p>
        </div>
      </div>
    </main>
  );
}

