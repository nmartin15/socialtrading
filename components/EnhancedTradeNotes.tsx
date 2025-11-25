'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

  // Extract trade tags from notes
  const extractTags = () => {
    const tags: Array<{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = [];
    const lowerNotes = notes.toLowerCase();

    // Trade direction
    if (lowerNotes.includes('long') || lowerNotes.includes('buy')) {
      tags.push({ label: '📈 Long', variant: 'default' });
    }
    if (lowerNotes.includes('short') || lowerNotes.includes('sell')) {
      tags.push({ label: '📉 Short', variant: 'destructive' });
    }

    // Trade type
    if (lowerNotes.includes('entry') || lowerNotes.includes('entering') || lowerNotes.includes('opened')) {
      tags.push({ label: '🎯 Entry', variant: 'secondary' });
    }
    if (lowerNotes.includes('exit') || lowerNotes.includes('closing') || lowerNotes.includes('closed')) {
      tags.push({ label: '🚪 Exit', variant: 'outline' });
    }

    // Strategy types
    if (lowerNotes.includes('breakout')) {
      tags.push({ label: 'Breakout', variant: 'outline' });
    }
    if (lowerNotes.includes('swing')) {
      tags.push({ label: 'Swing Trade', variant: 'outline' });
    }
    if (lowerNotes.includes('scalp')) {
      tags.push({ label: 'Scalp', variant: 'outline' });
    }
    if (lowerNotes.includes('reversal')) {
      tags.push({ label: 'Reversal', variant: 'outline' });
    }

    return tags;
  };

  // Highlight technical terms
  const highlightText = (text: string) => {
    // Technical indicators and patterns
    const technicalTerms = [
      'RSI', 'MACD', 'EMA', 'SMA', 'MA', 'Fibonacci', 'fib', 
      'support', 'resistance', 'breakout', 'breakdown', 'volume',
      'bullish', 'bearish', 'oversold', 'overbought', 'divergence',
      'ATH', 'ATL', 'ATR', 'BB', 'Bollinger', 'ichimoku', 'stochastic',
      'golden cross', 'death cross', 'head and shoulders', 'double top',
      'double bottom', 'triangle', 'wedge', 'flag', 'pennant', 'channel'
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
    <div className="pt-3 border-t border-border">
      {/* Header with Tags */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            📝 Trade Analysis
          </div>
          {tags.map((tag, idx) => (
            <Badge key={idx} variant={tag.variant} className="text-xs">
              {tag.label}
            </Badge>
          ))}
        </div>
        
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Read More</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Notes Content */}
      <div className="text-sm leading-relaxed">
        {needsExpansion && !isExpanded ? (
          <div className="relative">
            <div className="line-clamp-3">
              {highlightText(notes.slice(0, previewLength) + '...')}
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {highlightText(notes)}
          </div>
        )}
      </div>
    </div>
  );
}

