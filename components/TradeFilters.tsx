'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradeFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  totalTrades: number;
  filteredCount: number;
}

export function TradeFilters({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  totalTrades,
  filteredCount,
}: TradeFiltersProps) {
  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search trades by token, notes, or transaction hash..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tags */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">Filter by:</span>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalTrades} trades
        </div>
      )}
    </div>
  );
}

