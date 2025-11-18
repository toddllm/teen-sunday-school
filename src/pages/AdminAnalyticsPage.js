import React, { useState, useEffect } from 'react';
import { useEngagementAnalytics } from '../contexts/EngagementAnalyticsContext';
import BookHeatmap from '../components/BookHeatmap';
import ReadingPlanFunnel from '../components/ReadingPlanFunnel';
import EngagementStats from '../components/EngagementStats';
import './AdminAnalyticsPage.css';

function AdminAnalyticsPage() {
  const {
    getBookStats,
    getDailyEngagementStats,
    getEngagementByType,
    getReadingPlanFunnel,
    getMostReadPassages,
    getTranslationStats,
    getSummaryStats,
    engagements
  } = useEngagementAnalytics();

  // Filter states
  const [dateRange, setDateRange] = useState('all');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  // Data states
  const [bookStats, setBookStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [engagementByType, setEngagementByType] = useState([]);
  const [funnelData, setFunnelData] = useState(null);
  const [mostReadPassages, setMostReadPassages] = useState([]);
  const [translationStats, setTranslationStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);

  // Get date range for filtering
  const getDateRangeValues = () => {
    let fromDate = null;
    let toDate = null;
    const now = new Date();

    switch (dateRange) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        toDate = new Date().toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        fromDate = weekAgo.toISOString();
        toDate = new Date().toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        fromDate = monthAgo.toISOString();
        toDate = new Date().toISOString();
        break;
      case 'quarter':
        const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
        fromDate = quarterAgo.toISOString();
        toDate = new Date().toISOString();
        break;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        fromDate = yearAgo.toISOString();
        toDate = new Date().toISOString();
        break;
      case 'custom':
        fromDate = customFromDate ? new Date(customFromDate).toISOString() : null;
        toDate = customToDate ? new Date(customToDate).toISOString() : null;
        break;
      default:
        fromDate = null;
        toDate = null;
    }

    return { fromDate, toDate };
  };

  // Load analytics data
  const loadAnalytics = () => {
    const { fromDate, toDate } = getDateRangeValues();

    setBookStats(getBookStats(fromDate, toDate));
    setDailyStats(getDailyEngagementStats(fromDate, toDate));
    setEngagementByType(getEngagementByType(fromDate, toDate));
    setFunnelData(getReadingPlanFunnel(fromDate, toDate));
    setMostReadPassages(getMostReadPassages(10, fromDate, toDate));
    setTranslationStats(getTranslationStats(fromDate, toDate));
    setSummaryStats(getSummaryStats(fromDate, toDate));
  };

  // Reload data when filters change
  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customFromDate, customToDate, engagements]);

  // Export data as JSON
  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      filters: {
        dateRange,
        customFromDate,
        customToDate
      },
      summary: summaryStats,
      bookStats,
      dailyStats,
      engagementByType,
      funnelData,
      mostReadPassages,
      translationStats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scripture-engagement-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-analytics-page">
      <div className="container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1>📊 Scripture Engagement Analytics</h1>
            <p className="analytics-subtitle">
              Comprehensive insights into how users engage with Scripture
            </p>
          </div>
          <button onClick={exportData} className="btn btn-primary">
            📥 Export Data
          </button>
        </div>

        {/* Filters */}
        <div className="analytics-filters">
          <div className="filter-group">
            <label htmlFor="dateRange">Time Period:</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className="filter-group">
                <label htmlFor="fromDate">From:</label>
                <input
                  id="fromDate"
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="toDate">To:</label>
                <input
                  id="toDate"
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="filter-input"
                />
              </div>
            </>
          )}

          <button onClick={loadAnalytics} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>

        {/* No Data State */}
        {summaryStats && summaryStats.totalEngagements === 0 ? (
          <div className="no-data-state">
            <div className="no-data-icon">📊</div>
            <h2>No Analytics Data Yet</h2>
            <p>
              Start using the Bible reading features to collect engagement data.
              Analytics will automatically track scripture readings, cross-references,
              parallel translations, and reading plan progress.
            </p>
            <div className="no-data-actions">
              <a href="/bible" className="btn btn-primary">
                📖 Read Scripture
              </a>
              <a href="/bible/parallel" className="btn btn-secondary">
                🔄 Parallel Translations
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Overview */}
            {summaryStats && (
              <div className="analytics-overview">
                <div className="overview-card">
                  <div className="overview-icon">📊</div>
                  <div className="overview-content">
                    <div className="overview-value">{summaryStats.totalEngagements}</div>
                    <div className="overview-label">Total Engagements</div>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="overview-icon">📖</div>
                  <div className="overview-content">
                    <div className="overview-value">{summaryStats.uniqueBooks}</div>
                    <div className="overview-label">Books Explored</div>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="overview-icon">📝</div>
                  <div className="overview-content">
                    <div className="overview-value">{summaryStats.uniqueChapters}</div>
                    <div className="overview-label">Chapters Read</div>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="overview-icon">📚</div>
                  <div className="overview-content">
                    <div className="overview-value">{summaryStats.totalReadingPlans}</div>
                    <div className="overview-label">Reading Plans</div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Statistics */}
            {summaryStats && (
              <EngagementStats
                summaryStats={summaryStats}
                engagementByType={engagementByType}
                dailyStats={dailyStats}
                mostReadPassages={mostReadPassages}
                translationStats={translationStats}
              />
            )}

            {/* Book Heatmap */}
            <BookHeatmap data={bookStats} />

            {/* Reading Plan Funnel */}
            {funnelData && <ReadingPlanFunnel funnelData={funnelData} />}
          </>
        )}

        {/* Admin Info */}
        <div className="analytics-info">
          <h4>ℹ️ About Analytics</h4>
          <ul>
            <li>
              <strong>Privacy:</strong> All analytics data is stored locally in your browser.
              No personal information is collected or transmitted.
            </li>
            <li>
              <strong>Data Collection:</strong> Engagement is automatically tracked when users
              interact with Bible reading features, including verse lookups, cross-references,
              parallel translations, and reading plans.
            </li>
            <li>
              <strong>Export:</strong> Use the Export button to download analytics data as JSON
              for further analysis or backup.
            </li>
            <li>
              <strong>Filters:</strong> Use the time period filters to analyze trends over
              different time ranges.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
