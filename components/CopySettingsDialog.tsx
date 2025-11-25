'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CopySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  traderName: string;
  currentSettings?: CopySettings;
  onSettingsUpdated?: () => void;
}

interface CopySettings {
  copyEnabled: boolean;
  copyAmountType: 'PERCENTAGE' | 'FIXED' | 'PROPORTIONAL';
  copyAmount: number;
  maxTradeSize: number | null;
  minTradeSize: number | null;
  maxDailyLoss: number | null;
  stopLossPercent: number | null;
  allowedTokens: string[] | null;
  excludedTokens: string[] | null;
}

export function CopySettingsDialog({
  open,
  onOpenChange,
  subscriptionId,
  traderName,
  currentSettings,
  onSettingsUpdated,
}: CopySettingsDialogProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<CopySettings>({
    copyEnabled: true,
    copyAmountType: 'PERCENTAGE',
    copyAmount: 100,
    maxTradeSize: 10000,
    minTradeSize: 10,
    maxDailyLoss: null,
    stopLossPercent: null,
    allowedTokens: null,
    excludedTokens: null,
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to update settings',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/copy-settings/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }

      toast({
        title: 'Settings updated! ✓',
        description: 'Your copy trading settings have been saved',
      });

      onOpenChange(false);
      onSettingsUpdated?.();
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy Trading Settings</DialogTitle>
          <DialogDescription>
            Configure how you want to copy trades from {traderName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="copyEnabled" className="text-base">Copy Trading</Label>
              <p className="text-sm text-gray-400">Enable or pause automatic copy trading</p>
            </div>
            <Button
              variant={settings.copyEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSettings({ ...settings, copyEnabled: !settings.copyEnabled })}
            >
              {settings.copyEnabled ? 'Enabled' : 'Paused'}
            </Button>
          </div>

          {/* Copy Amount Type */}
          <div className="space-y-2">
            <Label>Copy Amount Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.copyAmountType === 'PERCENTAGE' ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, copyAmountType: 'PERCENTAGE' })}
                size="sm"
              >
                Percentage
              </Button>
              <Button
                variant={settings.copyAmountType === 'FIXED' ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, copyAmountType: 'FIXED' })}
                size="sm"
              >
                Fixed Amount
              </Button>
              <Button
                variant={settings.copyAmountType === 'PROPORTIONAL' ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, copyAmountType: 'PROPORTIONAL' })}
                size="sm"
              >
                Proportional
              </Button>
            </div>
          </div>

          {/* Copy Amount */}
          <div className="space-y-2">
            <Label htmlFor="copyAmount">
              {settings.copyAmountType === 'PERCENTAGE' 
                ? 'Copy Percentage (%)' 
                : settings.copyAmountType === 'FIXED'
                ? 'Fixed Amount (USD)'
                : 'Proportional Multiplier'}
            </Label>
            <Input
              id="copyAmount"
              type="number"
              value={settings.copyAmount}
              onChange={(e) => setSettings({ ...settings, copyAmount: parseFloat(e.target.value) || 0 })}
              placeholder={settings.copyAmountType === 'PERCENTAGE' ? '100' : '1000'}
              min="0"
              step={settings.copyAmountType === 'PERCENTAGE' ? '1' : '0.1'}
            />
            <p className="text-xs text-gray-400">
              {settings.copyAmountType === 'PERCENTAGE' && 'What percentage of the trader\'s position to copy'}
              {settings.copyAmountType === 'FIXED' && 'Fixed USD amount per trade regardless of trader position'}
              {settings.copyAmountType === 'PROPORTIONAL' && 'Multiplier relative to your account size'}
            </p>
          </div>

          {/* Trade Size Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTradeSize">Min Trade Size (USD)</Label>
              <Input
                id="minTradeSize"
                type="number"
                value={settings.minTradeSize ?? ''}
                onChange={(e) => setSettings({ ...settings, minTradeSize: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="10"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTradeSize">Max Trade Size (USD)</Label>
              <Input
                id="maxTradeSize"
                type="number"
                value={settings.maxTradeSize ?? ''}
                onChange={(e) => setSettings({ ...settings, maxTradeSize: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="10000"
                min="0"
              />
            </div>
          </div>

          {/* Risk Management */}
          <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h4 className="font-semibold text-sm text-red-300">Risk Management</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDailyLoss">Max Daily Loss (USD)</Label>
                <Input
                  id="maxDailyLoss"
                  type="number"
                  value={settings.maxDailyLoss ?? ''}
                  onChange={(e) => setSettings({ ...settings, maxDailyLoss: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional"
                  min="0"
                />
                <p className="text-xs text-gray-400">Stop copying if daily loss exceeds this</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLossPercent">Stop Loss (%)</Label>
                <Input
                  id="stopLossPercent"
                  type="number"
                  value={settings.stopLossPercent ?? ''}
                  onChange={(e) => setSettings({ ...settings, stopLossPercent: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-400">Auto-sell if position drops by this %</p>
              </div>
            </div>
          </div>

          {/* Token Filters */}
          <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-300">Token Filters (Optional)</h4>
            
            <div className="space-y-2">
              <Label htmlFor="allowedTokens">Allowed Tokens (comma-separated)</Label>
              <Input
                id="allowedTokens"
                type="text"
                value={settings.allowedTokens?.join(', ') ?? ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  allowedTokens: e.target.value ? e.target.value.split(',').map(t => t.trim()) : null 
                })}
                placeholder="e.g., WETH, USDC, BTC"
              />
              <p className="text-xs text-gray-400">Only copy trades with these tokens (leave empty for all)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excludedTokens">Excluded Tokens (comma-separated)</Label>
              <Input
                id="excludedTokens"
                type="text"
                value={settings.excludedTokens?.join(', ') ?? ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  excludedTokens: e.target.value ? e.target.value.split(',').map(t => t.trim()) : null 
                })}
                placeholder="e.g., DOGE, SHIB"
              />
              <p className="text-xs text-gray-400">Never copy trades with these tokens</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !address}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

