import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupAnalyticsPage.css';

const SignupAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('funnel'); // 'funnel', 'cohorts', 'referrals', 'timing'
  const [dateRange, setDateRange] = useState(30); // days

  // Analytics data state
  const [funnelStats, setFunnelStats] = useState(null);
  const [cohortAnalysis, setCohortAnalysis] = useState(null);
  const [referralAnalysis, setReferralAnalysis] = useState(null);
  const [timeToComplete, setTimeToComplete] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const [funnelRes, cohortRes, referralRes, timeRes, eventsRes] = await Promise.all([
        fetch(`/api/analytics/signup/funnel?days=${dateRange}`, { headers }),
        fetch(`/api/analytics/signup/cohorts?days=${dateRange}`, { headers }),
        fetch(`/api/analytics/signup/referrals?days=${dateRange}`, { headers }),
        fetch(`/api/analytics/signup/time-to-complete?days=${dateRange}`, { headers }),
        fetch(`/api/analytics/signup/events?limit=50`, { headers }),
      ]);

      if (funnelRes.ok) {
        const data = await funnelRes.json();
        setFunnelStats(data);
      }

      if (cohortRes.ok) {
        const data = await cohortRes.json();
        setCohortAnalysis(data);
      }

      if (referralRes.ok) {
        const data = await referralRes.json();
        setReferralAnalysis(data);
      }

      if (timeRes.ok) {
        const data = await timeRes.json();
        setTimeToComplete(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatEventType = (eventType) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="signup-analytics-page">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="signup-analytics-page">
      <div className="page-header">
        <h1>Teen Signup Funnel Analytics</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Admin
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <label>Date Range:</label>
        <select value={dateRange} onChange={(e) => setDateRange(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab ${selectedTab === 'funnel' ? 'active' : ''}`}
          onClick={() => setSelectedTab('funnel')}
        >
          Conversion Funnel
        </button>
        <button
          className={`tab ${selectedTab === 'cohorts' ? 'active' : ''}`}
          onClick={() => setSelectedTab('cohorts')}
        >
          Cohort Analysis
        </button>
        <button
          className={`tab ${selectedTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setSelectedTab('referrals')}
        >
          Referral Sources
        </button>
        <button
          className={`tab ${selectedTab === 'timing' ? 'active' : ''}`}
          onClick={() => setSelectedTab('timing')}
        >
          Time to Complete
        </button>
        <button
          className={`tab ${selectedTab === 'events' ? 'active' : ''}`}
          onClick={() => setSelectedTab('events')}
        >
          Recent Events
        </button>
      </div>

      {/* Content */}
      <div className="analytics-content">
        {/* Funnel Stats */}
        {selectedTab === 'funnel' && funnelStats && (
          <div className="funnel-stats">
            <h2>Signup Conversion Funnel</h2>

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Signups Started</h3>
                <p className="stat-value">{funnelStats.summary.totalSignupStarted}</p>
              </div>
              <div className="summary-card">
                <h3>Completed Onboarding</h3>
                <p className="stat-value">{funnelStats.summary.totalCompleted}</p>
              </div>
              <div className="summary-card">
                <h3>Overall Conversion Rate</h3>
                <p className="stat-value">{funnelStats.summary.overallConversionRate}%</p>
              </div>
            </div>

            <div className="funnel-visualization">
              <h3>Funnel Stages</h3>
              <div className="funnel-stages">
                {funnelStats.funnel.map((stage, index) => (
                  <div key={stage.stage} className="funnel-stage">
                    <div className="stage-header">
                      <span className="stage-number">{index + 1}</span>
                      <span className="stage-name">{formatEventType(stage.stage)}</span>
                    </div>
                    <div className="stage-metrics">
                      <div className="metric">
                        <span className="metric-label">Count:</span>
                        <span className="metric-value">{stage.count}</span>
                      </div>
                      {index > 0 && (
                        <>
                          <div className="metric">
                            <span className="metric-label">Conversion:</span>
                            <span className="metric-value conversion">{stage.conversionRate}%</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Drop-off:</span>
                            <span className="metric-value dropoff">{stage.dropoffRate}%</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div
                      className="stage-bar"
                      style={{
                        width: `${funnelStats.summary.totalSignupStarted > 0 ? (stage.count / funnelStats.summary.totalSignupStarted) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cohort Analysis */}
        {selectedTab === 'cohorts' && cohortAnalysis && (
          <div className="cohort-analysis">
            <h2>Cohort Analysis</h2>

            <div className="chart-section">
              <h3>Daily Signups</h3>
              <div className="daily-signups-chart">
                {cohortAnalysis.dailySignups.map((day) => (
                  <div key={day.date} className="chart-bar-item">
                    <div className="chart-label">{formatDate(day.date)}</div>
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          width: `${Math.max((day.count / Math.max(...cohortAnalysis.dailySignups.map(d => d.count))) * 100, 5)}%`
                        }}
                      >
                        <span className="bar-value">{day.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-section">
              <h3>Completion Rates by Cohort</h3>
              <div className="cohort-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Started</th>
                      <th>Completed</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortAnalysis.cohortCompletion.map((cohort) => (
                      <tr key={cohort.date}>
                        <td>{formatDate(cohort.date)}</td>
                        <td>{cohort.started}</td>
                        <td>{cohort.completed}</td>
                        <td>
                          <span className={`completion-rate ${cohort.completionRate > 50 ? 'high' : cohort.completionRate > 25 ? 'medium' : 'low'}`}>
                            {cohort.completionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Referral Analysis */}
        {selectedTab === 'referrals' && referralAnalysis && (
          <div className="referral-analysis">
            <h2>Referral Source Analysis</h2>

            <div className="referral-table">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Signups Started</th>
                    <th>Signups Completed</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {referralAnalysis.referralSources.map((source) => (
                    <tr key={source.source}>
                      <td className="source-name">{source.source || 'Direct'}</td>
                      <td>{source.signupsStarted}</td>
                      <td>{source.signupsCompleted}</td>
                      <td>
                        <span className={`conversion-rate ${source.conversionRate > 50 ? 'high' : source.conversionRate > 25 ? 'medium' : 'low'}`}>
                          {source.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Time to Complete */}
        {selectedTab === 'timing' && timeToComplete && (
          <div className="time-analysis">
            <h2>Time to Complete Analysis</h2>

            <div className="timing-cards">
              <div className="timing-card">
                <h3>Average Time: Signup to Account Creation</h3>
                <p className="stat-value">{timeToComplete.averageTimes.signupToAccountCreation.minutes.toFixed(1)} min</p>
                <p className="stat-detail">Sample size: {timeToComplete.averageTimes.signupToAccountCreation.sampleSize} users</p>
              </div>
              <div className="timing-card">
                <h3>Average Time: Signup to Completion</h3>
                <p className="stat-value">{timeToComplete.averageTimes.signupToCompletion.minutes.toFixed(1)} min</p>
                <p className="stat-detail">Sample size: {timeToComplete.averageTimes.signupToCompletion.sampleSize} users</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Events */}
        {selectedTab === 'events' && (
          <div className="recent-events">
            <h2>Recent Signup Events</h2>

            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Session ID</th>
                    <th>User ID</th>
                    <th>Referral Source</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <span className="event-type-badge">{formatEventType(event.eventType)}</span>
                      </td>
                      <td className="session-id">{event.sessionId.substring(0, 8)}...</td>
                      <td className="user-id">{event.userId ? event.userId.substring(0, 8) + '...' : 'N/A'}</td>
                      <td>{event.referralSource || 'Direct'}</td>
                      <td>{formatDateTime(event.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupAnalyticsPage;
