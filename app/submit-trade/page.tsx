'use client';

import { useState } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import { TradeSubmissionForm } from '@/components/TradeSubmissionForm';
import { TradeImporter } from '@/components/TradeImporter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Upload, Edit } from 'lucide-react';

export default function SubmitTradePage() {
  const [activeTab, setActiveTab] = useState('auto-import');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = () => {
    // Refresh the page or redirect to my-trades
    setRefreshKey(prev => prev + 1);
  };

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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/my-trades">
            ← Back to My Trades
          </Link>
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Submit Trade</h1>
          <p className="text-muted-foreground">
            Record your trading activity to build your track record and attract copiers.
          </p>
        </div>

        {/* Info Box */}
        <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="text-blue-400 text-2xl">✨</div>
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">New: Auto-Import from Blockchain</h3>
                <p className="text-sm text-blue-200/80 mb-2">
                  Scan your wallet to automatically import trades directly from the blockchain. 
                  All imported trades are verified on-chain.
                </p>
                <ul className="text-xs text-blue-200/60 space-y-1 ml-4 list-disc">
                  <li>No manual data entry required</li>
                  <li>100% verified transactions</li>
                  <li>Instant trust and credibility</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Auto-Import vs Manual */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="auto-import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Auto-Import (Recommended)
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto-import" className="space-y-6">
            <TradeImporter onImportComplete={handleImportComplete} />
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            {/* Info Box for Manual Entry */}
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="text-yellow-400 text-xl">⚠️</div>
                  <div>
                    <h3 className="text-yellow-300 font-semibold mb-2">Manual Entry</h3>
                    <ul className="text-sm text-yellow-200/80 space-y-1">
                      <li>• All trades are publicly visible on your profile</li>
                      <li>• Transaction hashes must be unique and valid</li>
                      <li>• Token symbols should be uppercase (e.g., ETH, USDC)</li>
                      <li>• Consider using auto-import for verified trades</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Details</CardTitle>
                <CardDescription>
                  Manually enter your trade information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradeSubmissionForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out the{' '}
            <Link href="/traders" className="text-primary hover:underline">
              top traders
            </Link>{' '}
            to see how they track their trades.
          </p>
        </div>
      </div>
    </main>
  );
}

