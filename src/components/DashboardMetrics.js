import React, { useState, useEffect } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './DashboardMetrics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardMetrics = () => {
  const { getMetricsForRange, getMetricsForCustomRange } = useMetrics();
  const [timeRange, setTimeRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadMetrics = () => {
    if (timeRange === 'custom' && customStart && customEnd) {
      setMetrics(getMetricsForCustomRange(customStart, customEnd));
    } else if (timeRange !== 'custom') {
      setMetrics(getMetricsForRange(timeRange));
    }
  };

  const handleCustomRangeApply = () => {
    if (customStart && customEnd) {
      loadMetrics();
    }
  };

  if (!metrics) {
    return <div className="dashboard-loading">Loading metrics...</div>;
  }

  // Activity type labels
  const activityTypeLabels = {
    reading_plan_completed: 'Reading Plans',
    chapter_read: 'Chapters Read',
    prayer_logged: 'Prayers Logged',
    verse_memorized: 'Verses Memorized',
    lesson_completed: 'Lessons Completed'
  };

  // Prepare activity breakdown chart data
  const activityBreakdownData = {
    labels: Object.keys(metrics.activities.breakdown).map(
      type => activityTypeLabels[type] || type
    ),
    datasets: [
      {
        label: 'Activities',
        data: Object.values(metrics.activities.breakdown),
        backgroundColor: [
          'rgba(74, 144, 226, 0.8)',
          'rgba(80, 200, 120, 0.8)',
          'rgba(255, 107, 107, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(156, 39, 176, 0.8)'
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(80, 200, 120, 1)',
          'rgba(255, 107, 107, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(156, 39, 176, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Prepare activity trend chart data
  const trendData = {
    labels: metrics.activities.trend.map(t => {
      const date = new Date(t.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Activities',
        data: metrics.activities.trend.map(t => t.count),
        fill: true,
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        borderColor: 'rgba(74, 144, 226, 1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Prepare badge completion chart data
  const badgeData = {
    labels: ['Earned', 'Not Earned'],
    datasets: [
      {
        data: [metrics.badges.earned, metrics.badges.total - metrics.badges.earned],
        backgroundColor: [
          'rgba(80, 200, 120, 0.8)',
          'rgba(200, 200, 200, 0.5)'
        ],
        borderColor: [
          'rgba(80, 200, 120, 1)',
          'rgba(200, 200, 200, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color')
            .trim()
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color')
            .trim()
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.1)'
        }
      },
      x: {
        ticks: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color')
            .trim()
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color')
            .trim()
        }
      }
    }
  };

  return (
    <div className="dashboard-metrics">
      <div className="metrics-header">
        <h2>📊 Dashboard Overview</h2>
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button
            className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button
            className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            Last 90 Days
          </button>
          <button
            className={`range-btn ${timeRange === 'custom' ? 'active' : ''}`}
            onClick={() => setTimeRange('custom')}
          >
            Custom
          </button>
        </div>
      </div>

      {timeRange === 'custom' && (
        <div className="custom-range-selector">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              className="form-input"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-input"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCustomRangeApply}
            disabled={!customStart || !customEnd}
          >
            Apply
          </button>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Total Activities</h3>
            <div className="metric-value">{metrics.overview.totalActivities}</div>
            <div className="metric-label">All time</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <h3>Current Streak</h3>
            <div className="metric-value">{metrics.overview.currentStreak}</div>
            <div className="metric-label">days</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <h3>Longest Streak</h3>
            <div className="metric-value">{metrics.overview.longestStreak}</div>
            <div className="metric-label">days</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Active Days</h3>
            <div className="metric-value">{metrics.users.activeDates}</div>
            <div className="metric-label">in selected range</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📖</div>
          <div className="metric-content">
            <h3>Lessons Completed</h3>
            <div className="metric-value">{metrics.lessons.completions}</div>
            <div className="metric-label">
              {metrics.lessons.totalLessons} total lessons
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎖️</div>
          <div className="metric-content">
            <h3>Badges Earned</h3>
            <div className="metric-value">
              {metrics.badges.earned}/{metrics.badges.total}
            </div>
            <div className="metric-label">
              {metrics.badges.percentage.toFixed(0)}% complete
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📚</div>
          <div className="metric-content">
            <h3>Chapters Read</h3>
            <div className="metric-value">
              {metrics.bibleBooks.totalChaptersRead}
            </div>
            <div className="metric-label">in selected range</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🙏</div>
          <div className="metric-content">
            <h3>Prayers Logged</h3>
            <div className="metric-value">
              {metrics.activities.breakdown.prayer_logged || 0}
            </div>
            <div className="metric-label">in selected range</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-container large">
          <h3>Activity Trend</h3>
          <div className="chart-wrapper">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Activity Breakdown</h3>
          <div className="chart-wrapper">
            <Bar data={activityBreakdownData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Badge Completion</h3>
          <div className="chart-wrapper">
            <Doughnut data={badgeData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Most Popular Activities */}
      {metrics.activities.mostPopular.length > 0 && (
        <div className="popular-activities">
          <h3>Most Popular Activities</h3>
          <div className="activity-list">
            {metrics.activities.mostPopular.map((activity, index) => (
              <div key={activity.type} className="activity-item">
                <span className="activity-rank">#{index + 1}</span>
                <span className="activity-name">
                  {activityTypeLabels[activity.type] || activity.type}
                </span>
                <span className="activity-count">{activity.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Progress */}
      <div className="badge-progress">
        <h3>Badge Progress</h3>
        <div className="badge-grid">
          {metrics.badges.allBadges.map(badge => (
            <div
              key={badge.id}
              className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                {badge.earned && badge.awardedAt && (
                  <div className="badge-date">
                    Earned: {new Date(badge.awardedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
