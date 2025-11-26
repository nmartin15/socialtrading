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

interface SubscriberGrowthPoint {
  date: string;
  count: number;
  newSubscribers: number;
}

interface ViewsDataPoint {
  date: string;
  count: number;
}

interface MonthlyStatDataPoint {
  month: string;
  trades: number;
  pnl: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface ChartsData {
  pnlOverTime: PnLDataPoint[];
  tradingFrequency: FrequencyDataPoint[];
  topTokenPairs: TokenPairDataPoint[];
  monthlyStats: MonthlyStatDataPoint[];
}

interface SubscribersData {
  growth: SubscriberGrowthPoint[];
}

interface ProfileMetrics {
  viewsOverTime: ViewsDataPoint[];
}

interface AnalyticsChartsProps {
  charts: ChartsData;
  subscribers?: SubscribersData;
  profileMetrics?: ProfileMetrics;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export function AnalyticsCharts({ charts, subscribers, profileMetrics }: AnalyticsChartsProps) {
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

  // Format subscriber growth data
  const subscriberGrowthData = subscribers?.growth?.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    subscribers: point.count,
    newSubscribers: point.newSubscribers,
  })) || [];

  // Format profile views data
  const profileViewsData = profileMetrics?.viewsOverTime?.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    views: point.count,
  })) || [];

  // Format monthly stats
  const monthlyData = charts.monthlyStats?.map((stat) => ({
    month: stat.month,
    trades: stat.trades,
    pnl: Math.round(stat.pnl * 100) / 100,
    winRate: Math.round(stat.winRate * 10) / 10,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Subscriber Growth Chart */}
      {subscribers && subscriberGrowthData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Subscriber Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subscriberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="subscribers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Subscribers"
              />
              <Line
                type="monotone"
                dataKey="newSubscribers"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
                name="New Subscribers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Profile Views Chart */}
      {profileMetrics && profileViewsData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Profile Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profileViewsData}>
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
                formatter={(value: number) => [value, 'Views']}
              />
              <Legend />
              <Bar
                dataKey="views"
                fill="#ec4899"
                radius={[8, 8, 0, 0]}
                name="Profile Views"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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

      {/* Monthly Performance Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
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
                formatter={(value: number, name: string) => {
                  if (name === 'pnl') return [`$${value.toFixed(2)}`, 'P&L'];
                  if (name === 'trades') return [value, 'Trades'];
                  if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey="pnl"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Monthly P&L"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Win Rate Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Monthly Win Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Win Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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

