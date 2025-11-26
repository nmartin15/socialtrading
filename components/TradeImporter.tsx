'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { formatAddress } from '@/lib/utils';
import { Loader2, Search, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface DetectedTrade {
  txHash: string;
  timestamp: Date;
  blockNumber: string;
  from: string;
  to: string;
  status: 'success' | 'failed';
  type: string;
  gasUsed?: string;
  verified: boolean;
}

interface TradeImporterProps {
  onImportComplete?: () => void;
}

export function TradeImporter({ onImportComplete }: TradeImporterProps) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [detectedTrades, setDetectedTrades] = useState<DetectedTrade[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [scanMessage, setScanMessage] = useState('');

  const scanWallet = async () => {
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }
    
    setScanning(true);
    setScanMessage('');
    setDetectedTrades([]);
    setSelectedTrades(new Set());

    try {
      const response = await fetch(
        `/api/trades/scan?walletAddress=${address}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to scan wallet');
      }

      const data = await response.json();
      
      if (data.trades && data.trades.length > 0) {
        // Convert timestamp strings to Date objects
        const trades = data.trades.map((trade: any) => ({
          ...trade,
          timestamp: new Date(trade.timestamp),
        }));
        
        setDetectedTrades(trades);
        setScanMessage(data.message || `Found ${data.count} new trade(s)`);
        
        toast({
          title: 'Scan Complete',
          description: data.message,
        });
      } else {
        setScanMessage('No new trades found in recent blocks');
        toast({
          title: 'Scan Complete',
          description: 'No new trades found',
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : 'Failed to scan wallet',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const toggleTradeSelection = (txHash: string) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(txHash)) {
      newSelected.delete(txHash);
    } else {
      newSelected.add(txHash);
    }
    setSelectedTrades(newSelected);
  };

  const selectAll = () => {
    if (selectedTrades.size === detectedTrades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(detectedTrades.map(t => t.txHash)));
    }
  };

  const importSelected = async () => {
    if (selectedTrades.size === 0) {
      toast({
        title: 'No trades selected',
        description: 'Please select at least one trade to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    
    try {
      const tradesToImport = detectedTrades.filter(t => 
        selectedTrades.has(t.txHash)
      );
      
      let successCount = 0;
      let errorCount = 0;

      // Import each trade
      for (const trade of tradesToImport) {
        try {
          const response = await fetch('/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: address,
              txHash: trade.txHash,
              fromToken: 'UNKNOWN', // Will be updated when we decode the tx
              toToken: 'UNKNOWN',
              fromAmount: '0',
              toAmount: '0',
              type: 'BUY',
              notes: `Auto-imported trade. Block: ${trade.blockNumber}. Add your trading notes here.`,
              timestamp: trade.timestamp.toISOString(),
              blockNumber: trade.blockNumber,
              verified: true,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Failed to import trade:', trade.txHash, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${successCount} trade(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });

        // Clear selection and refresh
        setSelectedTrades(new Set());
        setDetectedTrades([]);
        
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        toast({
          title: 'Import Failed',
          description: `Failed to import ${errorCount} trade(s)`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: error instanceof Error ? error.message : 'Failed to import trades',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-400 mb-2">Wallet not connected</p>
          <p className="text-sm text-gray-500">Connect your wallet to scan for trades</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Auto-Import Trades from Blockchain
        </CardTitle>
        <CardDescription>
          Scan your wallet for recent trades and import them automatically. Trades are verified on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scan Button */}
        <Button 
          onClick={scanWallet} 
          disabled={scanning || !isConnected}
          className="w-full"
          size="lg"
        >
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning Blockchain...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Scan My Wallet
            </>
          )}
        </Button>

        {/* Info Message */}
        {scanMessage && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-300">
            {scanMessage}
          </div>
        )}

        {/* Detected Trades List */}
        {detectedTrades.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                Detected Trades ({detectedTrades.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
              >
                {selectedTrades.size === detectedTrades.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detectedTrades.map((trade) => (
                <div 
                  key={trade.txHash}
                  className={`flex items-start gap-3 p-3 border rounded transition-colors cursor-pointer ${
                    selectedTrades.has(trade.txHash)
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => toggleTradeSelection(trade.txHash)}
                >
                  <Checkbox
                    checked={selectedTrades.has(trade.txHash)}
                    onCheckedChange={() => toggleTradeSelection(trade.txHash)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {trade.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {trade.type.toUpperCase()}
                      </Badge>
                      {trade.verified && (
                        <Badge className="text-xs bg-green-500">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>TX:</span>
                        <code className="text-xs bg-gray-900 px-1 py-0.5 rounded">
                          {formatAddress(trade.txHash)}
                        </code>
                        <Link
                          href={`https://explorer.thecodex.net/tx/${trade.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {trade.timestamp.toLocaleString()} • Block {trade.blockNumber}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <Button
              onClick={importSelected}
              disabled={selectedTrades.size === 0 || importing}
              className="w-full"
              size="lg"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing {selectedTrades.size} trade(s)...
                </>
              ) : (
                <>
                  Import {selectedTrades.size} Selected Trade{selectedTrades.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Note: Imported trades will need additional details (tokens, amounts, notes) added manually
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="p-3 bg-gray-800/50 rounded text-sm text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">How it works:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Scans your wallet for recent transactions (last ~100 blocks)</li>
            <li>Detects trades and swaps from your wallet</li>
            <li>All data is verified on-chain</li>
            <li>You can edit imported trades to add details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

