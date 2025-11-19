import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EngagementStats.css';

const EngagementStats = ({
  summaryStats,
  engagementByType,
  dailyStats,
  mostReadPassages,
  translationStats
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="engagement-tooltip">
          <p className="tooltip-label">{payload[0].name || payload[0].payload.type}</p>
          <p className="tooltip-value">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Format engagement type for display
  const formatEngagementType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="engagement-stats">
      <h3>Engagement Statistics</h3>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Engagements</div>
            <div className="stat-value">{summaryStats.totalEngagements}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-label">Books Explored</div>
            <div className="stat-value">{summaryStats.uniqueBooks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-label">Chapters Read</div>
            <div className="stat-value">{summaryStats.uniqueChapters}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Avg Daily Engagement</div>
            <div className="stat-value">{summaryStats.averageEngagementsPerDay.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Engagement by Type */}
      <div className="chart-section">
        <h4>Engagement by Type</h4>
        <div className="chart-grid">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementByType.filter(e => e.count > 0)}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => formatEngagementType(entry.type)}
                >
                  {engagementByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementByType.filter(e => e.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tickFormatter={formatEngagementType}
                />
                <YAxis />
                <Tooltip
                  content={<CustomTooltip />}
                  labelFormatter={formatEngagementType}
                />
                <Bar dataKey="count" name="Count">
                  {engagementByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Engagement Trend */}
      {dailyStats.length > 0 && (
        <div className="chart-section">
          <h4>Daily Engagement Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Engagements"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Most Read Passages */}
      {mostReadPassages.length > 0 && (
        <div className="chart-section">
          <h4>Most Read Passages</h4>
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Passage</th>
                  <th>Reads</th>
                </tr>
              </thead>
              <tbody>
                {mostReadPassages.map((passage, index) => (
                  <tr key={index}>
                    <td className="rank-cell">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="passage-cell">{passage.passage}</td>
                    <td className="count-cell">{passage.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Translation Usage */}
      {translationStats.length > 0 && (
        <div className="chart-section">
          <h4>Bible Translation Usage</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={translationStats} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="translation" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Usage Count">
                {translationStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EngagementStats;
