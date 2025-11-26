import { Badge } from './ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface VerificationBadgeProps {
  verified: boolean;
  blockNumber?: string | null;
  txHash?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function VerificationBadge({ 
  verified, 
  blockNumber, 
  txHash,
  size = 'sm',
  showIcon = true 
}: VerificationBadgeProps) {
  if (verified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 ${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
              }`}
            >
              {showIcon && <CheckCircle2 className="w-3 h-3 mr-1" />}
              Verified On-Chain
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-semibold">✓ Blockchain Verified</p>
              <p className="text-gray-400">
                This trade was imported directly from the blockchain
              </p>
              {blockNumber && (
                <p className="text-gray-500">Block: {blockNumber}</p>
              )}
              {txHash && (
                <p className="text-gray-500">TX: {txHash.slice(0, 10)}...</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={`border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
            }`}
          >
            {showIcon && <AlertTriangle className="w-3 h-3 mr-1" />}
            Unverified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">⚠️ Manual Entry</p>
            <p className="text-gray-400">
              This trade was entered manually and not verified on-chain
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

