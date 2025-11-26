'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Calendar, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradeFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  totalTrades: number;
  filteredCount: number;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  sortBy?: 'date' | 'value' | 'token';
  onSortChange?: (sort: 'date' | 'value' | 'token') => void;
}

export function TradeFilters({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  totalTrades,
  filteredCount,
  dateRange,
  onDateRangeChange,
  sortBy = 'date',
  onSortChange,
}: TradeFiltersProps) {
  const hasActiveFilters = searchQuery || selectedTags.length > 0 || dateRange;

  return (
    <div className="space-y-4 mb-6 p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
        <Filter className="w-4 h-4 text-primary" />
        <span>Filter & Search Trades</span>
      </div>

      {/* Search and Date Range Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by token, notes, or tx hash..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-10 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        {onDateRangeChange && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => onDateRangeChange({ 
                start: e.target.value, 
                end: dateRange?.end || '' 
              })}
              className="flex-1 h-10 shadow-sm"
              placeholder="Start date"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => onDateRangeChange({ 
                start: dateRange?.start || '', 
                end: e.target.value 
              })}
              className="flex-1 h-10 shadow-sm"
              placeholder="End date"
            />
            {dateRange && (
              <button
                onClick={() => onDateRangeChange({ start: '', end: '' })}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort Options */}
      {onSortChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('date')}
            className="h-7 text-xs"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Date
          </Button>
          <Button
            variant={sortBy === 'value' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('value')}
            className="h-7 text-xs"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Value
          </Button>
          <Button
            variant={sortBy === 'token' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('token')}
            className="h-7 text-xs"
          >
            Token
          </Button>
        </div>
      )}

      {/* Filter Tags */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-card/50 rounded-md border border-border/50">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Quick Filters:</span>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            // Add icons for specific tags
            const getTagIcon = (tagName: string) => {
              if (tagName.toLowerCase().includes('long')) return <TrendingUp className="w-3 h-3 mr-1" />;
              if (tagName.toLowerCase().includes('short')) return <TrendingDown className="w-3 h-3 mr-1" />;
              return null;
            };
            
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-md flex items-center gap-1 px-2.5 py-1"
                onClick={() => onTagToggle(tag)}
              >
                {getTagIcon(tag)}
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
              className="h-6 text-xs ml-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Results Count and Statistics */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="text-sm font-medium">
          {hasActiveFilters ? (
            <span className="text-primary">
              Showing {filteredCount} of {totalTrades} trades
            </span>
          ) : (
            <span className="text-muted-foreground">
              {totalTrades} total trades
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange('');
              selectedTags.forEach(tag => onTagToggle(tag));
              if (onDateRangeChange) {
                onDateRangeChange({ start: '', end: '' });
              }
            }}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}

