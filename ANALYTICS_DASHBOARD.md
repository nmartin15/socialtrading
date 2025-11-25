# Analytics Dashboard Feature 📊

## Overview

The Analytics Dashboard provides comprehensive performance insights for traders on the Social Trading platform. It includes P&L calculations, win/loss ratios, performance charts, and trading patterns analysis.

## Features Implemented

### 1. API Endpoint (`/api/analytics`)

**Endpoint:** `GET /api/analytics?traderId={traderId}`

**Response includes:**
- Trader information
- Summary statistics (total trades, P&L, win rate, etc.)
- Performance metrics (7-day, 30-day, all-time)
- Chart data (P&L over time, trading frequency, token pairs)
- Highlights (best/worst trades)

**Key Metrics Calculated:**
- **Total P&L:** Sum of all trade USD values
- **Win Rate:** Percentage of profitable trades
- **Average Trade Value:** Mean USD value per trade
- **Cumulative P&L:** Running total over time
- **Trading Frequency:** Trades per day
- **Token Pair Distribution:** Most traded pairs

### 2. Analytics Dashboard Page (`/analytics/[traderId]`)

**Features:**
- Performance summary cards
- Period-based performance (7-day, 30-day, all-time)
- Interactive charts (using Recharts)
- Best/worst trade highlights
- Back navigation to trader profile

**Visual Components:**
- 📊 Cumulative P&L Line Chart
- 📈 Trading Frequency Bar Chart
- 🥧 Token Pair Distribution Pie Chart
- 📋 Token Pair Breakdown List
- 🏆 Best/Worst Trade Cards

### 3. Chart Components (`AnalyticsCharts.tsx`)

**Charts Included:**
1. **P&L Over Time:** Line chart showing cumulative profit/loss
2. **Trading Frequency:** Bar chart of trades per day
3. **Top Trading Pairs:** Pie chart and list view
4. **Performance Distribution:** Win/loss/break-even stats

**Styling:**
- Dark theme matching platform design
- Color-coded for profit (green) and loss (red)
- Responsive layouts for mobile/desktop
- Interactive tooltips with detailed information

### 4. Navigation Integration

**Added to Navigation Component:**
- Analytics link for traders in main navigation
- Mobile navigation support
- Active state highlighting
- Direct access from trader profile pages

**Trader Profile Integration:**
- "View Analytics" button on all trader profiles
- Easy navigation between profile and analytics
- Consistent UI/UX across pages

## Usage

### For Traders
1. Connect your wallet and register as a trader
2. Submit trades with USD values
3. Access analytics via:
   - Navigation bar → "Analytics"
   - Your profile → "View Analytics" button

### For Users
1. Browse traders
2. Click on any trader profile
3. Click "View Analytics" button to see their performance

## Data Flow

```
User → Analytics Page → API Endpoint → Database (Prisma)
                                      ↓
                            Calculate Metrics → Format Data
                                      ↓
                            Return JSON → Render Charts
```

## File Structure

```
app/
├── api/
│   └── analytics/
│       └── route.ts          # Analytics API endpoint
├── analytics/
│   └── [traderId]/
│       ├── page.tsx           # Main analytics page
│       └── not-found.tsx      # 404 page
components/
└── AnalyticsCharts.tsx        # Chart components
```

## Key Dependencies

- **recharts**: Chart library for data visualization
- **@prisma/client**: Database ORM
- **date-fns**: Date formatting (already in project)

## Performance Considerations

1. **Data Fetching:** Server-side rendering with `cache: 'no-store'` for fresh data
2. **Chart Rendering:** Client-side with React for interactivity
3. **Calculations:** Efficient aggregations in API route
4. **Pagination:** Not implemented yet (consider for large datasets)

## Future Enhancements

### Potential Improvements:
1. **Real-time Updates:** WebSocket integration for live P&L
2. **Comparative Analysis:** Compare multiple traders side-by-side
3. **Export Data:** Download analytics as CSV/PDF
4. **Advanced Filters:** Date range selection, token filtering
5. **Performance Predictions:** ML-based forecasting
6. **Social Features:** Share analytics on social media
7. **Custom Dashboards:** User-configurable metrics
8. **Notifications:** Alerts for performance milestones

### Technical Improvements:
1. **Caching:** Redis for frequently accessed analytics
2. **Materialized Views:** Pre-computed metrics
3. **Background Jobs:** Periodic analytics updates
4. **Pagination:** For traders with many trades
5. **A/B Testing:** Track feature usage and effectiveness

## Testing

### Manual Testing Checklist:
- [ ] API endpoint returns correct data
- [ ] Charts render without errors
- [ ] Mobile responsive design works
- [ ] Navigation links function properly
- [ ] Error handling for missing data
- [ ] Performance with large datasets
- [ ] Dark theme consistency
- [ ] Tooltips display correctly

### Test Scenarios:
1. **Trader with no trades:** Should show "No data available"
2. **Trader with 1 trade:** Basic metrics displayed
3. **Trader with many trades:** Charts populated with data
4. **Non-existent trader:** 404 page shown

### API Testing:
```bash
# Test analytics endpoint
curl http://localhost:3000/api/analytics?traderId=TRADER_ID

# Expected response structure:
{
  "trader": { "id", "username", "walletAddress" },
  "summary": { "totalTrades", "totalPnL", "avgTradeValue", "winRate", ... },
  "performance": { "last7Days", "last30Days", "allTime" },
  "charts": { "pnlOverTime", "tradingFrequency", "topTokenPairs" },
  "highlights": { "bestTrade", "worstTrade" }
}
```

## UI/UX Highlights

### Color Scheme:
- **Positive P&L:** Green (#10b981)
- **Negative P&L:** Red (#ef4444)
- **Primary:** Blue (#3b82f6)
- **Secondary:** Purple (#8b5cf6)
- **Accent:** Pink (#ec4899)

### Design Patterns:
- Gradient cards for visual interest
- Border accents for emphasis
- Consistent spacing and typography
- Icon usage for quick recognition
- Responsive grid layouts

## Security Considerations

1. **Authentication:** Uses middleware for wallet verification
2. **Authorization:** Traders can view their own analytics
3. **Data Privacy:** No sensitive wallet information exposed
4. **Input Validation:** TraderId validated before queries
5. **Error Handling:** Graceful failures with user-friendly messages

## Performance Metrics

### Expected Load Times:
- API response: < 500ms for ~100 trades
- Page render: < 2s initial load
- Chart interactions: < 100ms

### Optimization Tips:
1. Use server components where possible
2. Lazy load charts for better initial load
3. Implement data caching for frequently accessed traders
4. Consider pagination for traders with 1000+ trades

## Troubleshooting

### Common Issues:

**Charts not rendering:**
- Check if recharts is installed: `npm install recharts`
- Verify data format matches chart expectations
- Check browser console for errors

**API returns 404:**
- Verify traderId exists in database
- Check database connection
- Review Prisma schema

**Empty data displays:**
- Ensure trades have `usdValue` populated
- Check date filtering logic
- Verify calculations in API route

## Contributing

When adding new analytics features:
1. Update API route with new calculations
2. Add corresponding chart components
3. Update this documentation
4. Add tests for new features
5. Ensure mobile responsiveness

## License

Part of the Social Trading Platform project.

