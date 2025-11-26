'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target, DoorOpen, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedTradeNotesProps {
  notes: string;
  tokenIn: string;
  tokenOut: string;
  defaultExpanded?: boolean;
}

export function EnhancedTradeNotes({ 
  notes, 
  tokenIn, 
  tokenOut,
  defaultExpanded = false 
}: EnhancedTradeNotesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Extract trade tags from notes with enhanced recognition
  const extractTags = () => {
    const tags: Array<{ 
      label: string; 
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon?: React.ReactNode;
    }> = [];
    const lowerNotes = notes.toLowerCase();

    // Trade direction - more comprehensive
    if (lowerNotes.match(/\b(long|buy|bought|accumulate|accumulating|bullish)\b/)) {
      tags.push({ label: '📈 Long', variant: 'default', icon: <TrendingUp className="w-3 h-3" /> });
    }
    if (lowerNotes.match(/\b(short|sell|sold|selling|bearish|dump)\b/)) {
      tags.push({ label: '📉 Short', variant: 'destructive', icon: <TrendingDown className="w-3 h-3" /> });
    }

    // Trade type - more comprehensive
    if (lowerNotes.match(/\b(entry|entering|entered|opened|opening|position opened)\b/)) {
      tags.push({ label: '🎯 Entry', variant: 'secondary', icon: <Target className="w-3 h-3" /> });
    }
    if (lowerNotes.match(/\b(exit|exiting|exited|closing|closed|position closed|take profit|tp|stop loss|sl)\b/)) {
      tags.push({ label: '🚪 Exit', variant: 'outline', icon: <DoorOpen className="w-3 h-3" /> });
    }

    // Position size
    if (lowerNotes.match(/\b(full position|max position|all in|heavy|large position)\b/)) {
      tags.push({ label: '💰 Large Position', variant: 'default' });
    }
    if (lowerNotes.match(/\b(small position|light|minimal|starter)\b/)) {
      tags.push({ label: '💵 Small Position', variant: 'outline' });
    }

    // Strategy types - expanded
    if (lowerNotes.match(/\b(breakout|break out|breaking out)\b/)) {
      tags.push({ label: '🚀 Breakout', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(swing|swing trade|swing trading)\b/)) {
      tags.push({ label: '🔄 Swing Trade', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(scalp|scalping)\b/)) {
      tags.push({ label: '⚡ Scalp', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(reversal|reverse|bottom|top)\b/)) {
      tags.push({ label: '🔃 Reversal', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(momentum|trending|trend)\b/)) {
      tags.push({ label: '📊 Momentum', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(dca|averaging|average down|average up)\b/)) {
      tags.push({ label: '📉 DCA', variant: 'outline' });
    }
    if (lowerNotes.match(/\b(hedge|hedging)\b/)) {
      tags.push({ label: '🛡️ Hedge', variant: 'outline' });
    }

    // Risk level indicators
    if (lowerNotes.match(/\b(high risk|risky|degen|yolo|gambling)\b/)) {
      tags.push({ label: '⚠️ High Risk', variant: 'destructive' });
    }
    if (lowerNotes.match(/\b(low risk|safe|conservative|blue chip)\b/)) {
      tags.push({ label: '✅ Low Risk', variant: 'secondary' });
    }

    return tags;
  };

  // Highlight technical terms with expanded list
  const highlightText = (text: string) => {
    // Technical indicators and patterns - comprehensive list
    const technicalTerms = [
      // Indicators
      'RSI', 'MACD', 'EMA', 'SMA', 'MA', 'WMA', 'VWAP', 'ATR', 'ADX',
      'Bollinger', 'BB', 'Ichimoku', 'Stochastic', 'CCI', 'ROC', 'OBV',
      'Fibonacci', 'fib', 'retracement', 'extension',
      // Patterns
      'support', 'resistance', 'breakout', 'breakdown', 'consolidation',
      'bullish', 'bearish', 'oversold', 'overbought', 'divergence',
      'ATH', 'ATL', 'golden cross', 'death cross', 
      'head and shoulders', 'inverse head and shoulders',
      'double top', 'double bottom', 'triple top', 'triple bottom',
      'triangle', 'wedge', 'flag', 'pennant', 'channel', 'cup and handle',
      'ascending triangle', 'descending triangle', 'symmetrical triangle',
      // Market conditions
      'volume', 'liquidity', 'volatility', 'momentum', 'trend', 'ranging',
      'sideways', 'correction', 'pullback', 'retest', 'rejection',
      'accumulation', 'distribution', 'markup', 'markdown',
      // Trade actions
      'entry', 'exit', 'stop loss', 'take profit', 'TP', 'SL',
      'limit order', 'market order', 'trailing stop', 'scale in', 'scale out',
      'DCA', 'FOMO', 'FUD', 'hodl', 'bag', 'moon', 'dump', 'pump',
      // Levels
      'support level', 'resistance level', 'pivot', 'zone'
    ];

    // Price patterns
    const pricePattern = /\$[\d,]+(?:\.\d{1,2})?/g;
    const percentPattern = /\d+(?:\.\d+)?%/g;

    let processedText = text;
    const parts: Array<{ text: string; type: 'normal' | 'token' | 'price' | 'percent' | 'technical' }> = [];
    
    // Split by lines first to preserve formatting
    const lines = processedText.split('\n');
    
    return (
      <div className="space-y-2">
        {lines.map((line, lineIdx) => {
          const elements: React.ReactNode[] = [];
          let lastIndex = 0;

          // Find all matches in this line
          const matches: Array<{ index: number; length: number; type: string; text: string }> = [];

          // Token symbols (current trade tokens)
          [tokenIn, tokenOut].forEach(token => {
            const regex = new RegExp(`\\b${token}\\b`, 'gi');
            let match;
            while ((match = regex.exec(line)) !== null) {
              matches.push({ 
                index: match.index, 
                length: match[0].length, 
                type: 'token',
                text: match[0]
              });
            }
          });

          // Price matches
          let priceMatch;
          const priceRegex = new RegExp(pricePattern);
          while ((priceMatch = priceRegex.exec(line)) !== null) {
            matches.push({ 
              index: priceMatch.index, 
              length: priceMatch[0].length, 
              type: 'price',
              text: priceMatch[0]
            });
          }

          // Percent matches
          let percentMatch;
          const percentRegex = new RegExp(percentPattern);
          while ((percentMatch = percentRegex.exec(line)) !== null) {
            matches.push({ 
              index: percentMatch.index, 
              length: percentMatch[0].length, 
              type: 'percent',
              text: percentMatch[0]
            });
          }

          // Technical terms
          technicalTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            let match;
            while ((match = regex.exec(line)) !== null) {
              matches.push({ 
                index: match.index, 
                length: match[0].length, 
                type: 'technical',
                text: match[0]
              });
            }
          });

          // Sort matches by index and remove overlaps
          matches.sort((a, b) => a.index - b.index);
          const filteredMatches = matches.filter((match, idx) => {
            if (idx === 0) return true;
            const prevMatch = matches[idx - 1];
            return match.index >= prevMatch.index + prevMatch.length;
          });

          // Build the highlighted line
          filteredMatches.forEach((match, idx) => {
            // Add text before this match
            if (match.index > lastIndex) {
              elements.push(
                <span key={`text-${lineIdx}-${idx}`}>
                  {line.slice(lastIndex, match.index)}
                </span>
              );
            }

            // Add highlighted match
            const className = 
              match.type === 'token' ? 'text-blue-400 font-semibold' :
              match.type === 'price' ? 'text-green-400 font-semibold' :
              match.type === 'percent' ? 'text-purple-400 font-semibold' :
              'text-yellow-400 font-medium';

            elements.push(
              <span key={`match-${lineIdx}-${idx}`} className={className}>
                {match.text}
              </span>
            );

            lastIndex = match.index + match.length;
          });

          // Add remaining text
          if (lastIndex < line.length) {
            elements.push(
              <span key={`text-${lineIdx}-end`}>
                {line.slice(lastIndex)}
              </span>
            );
          }

          return (
            <div key={lineIdx}>
              {elements.length > 0 ? elements : line}
            </div>
          );
        })}
      </div>
    );
  };

  const tags = extractTags();
  const previewLength = 150;
  const needsExpansion = notes.length > previewLength;

  return (
    <div className="mt-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-sm">
      {/* Header with Tags */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span>Trade Analysis</span>
          </div>
          {tags.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant={tag.variant} 
              className="text-xs px-2 py-1 font-medium shadow-sm transition-all hover:scale-105"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
        
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 font-semibold transition-all hover:gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Read More</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Notes Content with improved styling */}
      <div className="text-sm leading-relaxed bg-card/50 rounded-md p-3 border border-border/50">
        {needsExpansion && !isExpanded ? (
          <div className="relative">
            <div className="line-clamp-3 text-muted-foreground">
              {highlightText(notes.slice(0, previewLength) + '...')}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-foreground/90">
            {highlightText(notes)}
          </div>
        )}
      </div>
    </div>
  );
}

