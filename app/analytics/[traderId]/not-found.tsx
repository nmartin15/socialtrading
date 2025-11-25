import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Analytics Not Found</h2>
        <p className="text-gray-400 mb-8">
          The analytics you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/traders"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Browse Traders
        </Link>
      </div>
    </div>
  );
}

