'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface PnLDataPoint {
  date: string;
  pnl: number;
  tradeId: string;
}

interface FrequencyDataPoint {
  date: string;
  count: number;
}

interface TokenPairDataPoint {
  pair: string;
  count: number;
}

interface ChartsData {
  pnlOverTime: PnLDataPoint[];
  tradingFrequency: FrequencyDataPoint[];
  topTokenPairs: TokenPairDataPoint[];
}

interface AnalyticsChartsProps {
  charts: ChartsData;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export function AnalyticsCharts({ charts }: AnalyticsChartsProps) {
  // Format P&L data for the chart
  const pnlData = charts.pnlOverTime.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    pnl: Math.round(point.pnl * 100) / 100,
  }));

  // Format frequency data
  const frequencyData = charts.tradingFrequency.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    count: point.count,
  }));

  // Format token pairs for pie chart
  const tokenPairData = charts.topTokenPairs.map((pair, index) => ({
    name: pair.pair,
    value: pair.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-8">
      {/* P&L Over Time Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Cumulative P&L Over Time</h3>
        {pnlData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="P&L"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No P&L data available
          </div>
        )}
      </div>

      {/* Trading Frequency Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Trading Frequency</h3>
        {frequencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [value, 'Trades']}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Trades per Day"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No trading frequency data available
          </div>
        )}
      </div>

      {/* Top Token Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Top Trading Pairs</h3>
          {tokenPairData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenPairData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenPairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No token pair data available
            </div>
          )}
        </div>

        {/* Token Pairs List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Pair Breakdown</h3>
          {tokenPairData.length > 0 ? (
            <div className="space-y-4">
              {tokenPairData.map((pair, index) => (
                <div
                  key={pair.name}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pair.color }}
                    />
                    <span className="font-mono font-semibold">{pair.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-blue-500">
                      {pair.value}
                    </span>
                    <span className="text-sm text-gray-400">trades</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No token pair data available
            </div>
          )}
        </div>
      </div>

      {/* Win/Loss Distribution */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Performance Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {pnlData.filter((d) => d.pnl > 0).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Profitable Periods
            </div>
          </div>
          <div className="text-center p-6 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {pnlData.filter((d) => d.pnl < 0).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Loss Periods
            </div>
          </div>
          <div className="text-center p-6 bg-gray-500/10 rounded-lg border border-gray-500/30">
            <div className="text-4xl font-bold text-gray-400 mb-2">
              {pnlData.filter((d) => d.pnl === 0).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Break-even
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

