import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ReadingPlanFunnel.css';

const ReadingPlanFunnel = ({ funnelData }) => {
  const {
    totalPlans,
    completedPlans,
    activePlans,
    completionRate,
    dayCompletionStats,
    averageProgress
  } = funnelData;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="funnel-tooltip">
          <p className="tooltip-label">Day {payload[0].payload.day}</p>
          <p className="tooltip-value">Completed: {payload[0].value} users</p>
          <p className="tooltip-percentage">({payload[0].payload.percentage.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reading-plan-funnel">
      <h3>Reading Plan Funnel Analysis</h3>

      {totalPlans === 0 ? (
        <div className="empty-state">
          <p>No reading plan data available for this period.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="funnel-summary">
            <div className="summary-card">
              <div className="summary-icon">📚</div>
              <div className="summary-content">
                <div className="summary-label">Total Plans Started</div>
                <div className="summary-value">{totalPlans}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-content">
                <div className="summary-label">Plans Completed</div>
                <div className="summary-value">{completedPlans}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🔄</div>
              <div className="summary-content">
                <div className="summary-label">Active Plans</div>
                <div className="summary-value">{activePlans}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <div className="summary-label">Completion Rate</div>
                <div className="summary-value">{completionRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <div className="summary-label">Avg. Progress</div>
                <div className="summary-value">{averageProgress.toFixed(1)} days</div>
              </div>
            </div>
          </div>

          {/* Funnel Chart */}
          {dayCompletionStats.length > 0 && (
            <div className="funnel-chart-container">
              <h4>Day-by-Day Completion Funnel</h4>
              <p className="chart-description">
                This chart shows how many users completed each day of their reading plans.
                Drop-offs indicate where users typically stop.
              </p>

              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={dayCompletionStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Users', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Percentage Chart */}
              <h4 style={{ marginTop: '30px' }}>Completion Percentage by Day</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={dayCompletionStats}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights */}
          <div className="funnel-insights">
            <h4>Key Insights</h4>
            <ul>
              {completionRate > 70 && (
                <li className="insight-positive">
                  ✅ Excellent completion rate of {completionRate.toFixed(1)}%!
                  Users are highly engaged with reading plans.
                </li>
              )}
              {completionRate < 30 && (
                <li className="insight-warning">
                  ⚠️ Low completion rate of {completionRate.toFixed(1)}%.
                  Consider shorter plans or more engagement features.
                </li>
              )}
              {activePlans > 0 && (
                <li className="insight-info">
                  📖 {activePlans} users are currently working through their reading plans.
                </li>
              )}
              {dayCompletionStats.length > 0 && (
                <li className="insight-info">
                  📊 Average user completes {averageProgress.toFixed(1)} days of their reading plan.
                </li>
              )}
              {dayCompletionStats.length > 5 && dayCompletionStats[4].percentage < 50 && (
                <li className="insight-warning">
                  🔍 Significant drop-off after day 5. Consider adding encouragement notifications.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ReadingPlanFunnel;
