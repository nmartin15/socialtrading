'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const TRADING_STYLES = [
  'Day Trading',
  'Swing Trading',
  'Scalping',
  'Position Trading',
  'DeFi',
  'NFTs',
  'Memecoins',
  'Blue Chips',
];

const SORT_OPTIONS = [
  { value: 'followers', label: 'Most Followers' },
  { value: 'performance', label: 'Best Performance' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'winRate', label: 'Highest Win Rate' },
  { value: 'trades', label: 'Most Trades' },
];

interface FilterState {
  search: string;
  sortBy: string;
  verified: boolean | null;
  styles: string[];
  minPrice: string;
  maxPrice: string;
  minTrades: string;
}

interface TraderDiscoveryFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export function TraderDiscoveryFilters({ onFilterChange }: TraderDiscoveryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'followers',
    verified: null,
    styles: [],
    minPrice: '',
    maxPrice: '',
    minTrades: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      search: '',
      sortBy: 'followers',
      verified: null,
      styles: [],
      minPrice: '',
      maxPrice: '',
      minTrades: '',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const toggleStyle = (style: string) => {
    const newStyles = filters.styles.includes(style)
      ? filters.styles.filter(s => s !== style)
      : [...filters.styles, style];
    updateFilters({ styles: newStyles });
  };

  const activeFiltersCount = 
    (filters.verified !== null ? 1 : 0) +
    filters.styles.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minTrades ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by username or wallet address..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
          className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Button */}
        <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Verified Filter */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Verification Status</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.verified === null ? 'default' : 'outline'}
                    onClick={() => updateFilters({ verified: null })}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={filters.verified === true ? 'default' : 'outline'}
                    onClick={() => updateFilters({ verified: true })}
                    size="sm"
                  >
                    Verified Only
                  </Button>
                  <Button
                    variant={filters.verified === false ? 'default' : 'outline'}
                    onClick={() => updateFilters({ verified: false })}
                    size="sm"
                  >
                    Unverified
                  </Button>
                </div>
              </div>

              {/* Trading Styles */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Trading Styles</Label>
                <div className="flex flex-wrap gap-2">
                  {TRADING_STYLES.map((style) => (
                    <Badge
                      key={style}
                      variant={filters.styles.includes(style) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleStyle(style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Monthly Price Range (USD)</Label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground mb-1 block">Min</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      min="0"
                      step="1"
                    />
                  </div>
                  <span className="text-muted-foreground mt-6">to</span>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground mb-1 block">Max</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Track Record */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Minimum Track Record</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.minTrades === '' ? 'default' : 'outline'}
                    onClick={() => updateFilters({ minTrades: '' })}
                    size="sm"
                  >
                    Any
                  </Button>
                  <Button
                    variant={filters.minTrades === '10' ? 'default' : 'outline'}
                    onClick={() => updateFilters({ minTrades: '10' })}
                    size="sm"
                  >
                    10+ trades
                  </Button>
                  <Button
                    variant={filters.minTrades === '50' ? 'default' : 'outline'}
                    onClick={() => updateFilters({ minTrades: '50' })}
                    size="sm"
                  >
                    50+ trades
                  </Button>
                  <Button
                    variant={filters.minTrades === '100' ? 'default' : 'outline'}
                    onClick={() => updateFilters({ minTrades: '100' })}
                    size="sm"
                  >
                    100+ trades
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setAdvancedOpen(false)}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.verified !== null && (
            <Badge variant="secondary" className="gap-1">
              {filters.verified ? 'Verified' : 'Unverified'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ verified: null })}
              />
            </Badge>
          )}
          
          {filters.styles.map((style) => (
            <Badge key={style} variant="secondary" className="gap-1">
              {style}
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground"
                onClick={() => toggleStyle(style)}
              />
            </Badge>
          ))}
          
          {filters.minPrice && (
            <Badge variant="secondary" className="gap-1">
              Min: ${filters.minPrice}
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ minPrice: '' })}
              />
            </Badge>
          )}
          
          {filters.maxPrice && (
            <Badge variant="secondary" className="gap-1">
              Max: ${filters.maxPrice}
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ maxPrice: '' })}
              />
            </Badge>
          )}
          
          {filters.minTrades && (
            <Badge variant="secondary" className="gap-1">
              {filters.minTrades}+ trades
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ minTrades: '' })}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

