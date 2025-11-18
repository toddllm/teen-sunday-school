import React from 'react';
import { Link } from 'react-router-dom';
import sessionDiagnostics from '../services/sessionDiagnosticsService';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to session diagnostics
    sessionDiagnostics.logError({
      type: 'react-error-boundary',
      message: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleDownloadDiagnostics = () => {
    sessionDiagnostics.exportDiagnostics();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p className="error-description">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {errorCount > 1 && (
              <div className="error-warning">
                <strong>Multiple errors detected ({errorCount})</strong>
                <p>Please try reloading the page or reporting this issue.</p>
              </div>
            )}

            <div className="error-details">
              <details>
                <summary>Technical Details</summary>
                <div className="error-stack">
                  <h3>Error Message:</h3>
                  <pre>{error && error.toString()}</pre>
                  {errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            </div>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                Try Again
              </button>
              <button onClick={this.handleReload} className="btn-secondary">
                Reload Page
              </button>
              <Link to="/bug-report" className="btn-report">
                Report This Issue
              </Link>
            </div>

            <div className="error-diagnostics">
              <button
                onClick={this.handleDownloadDiagnostics}
                className="btn-download"
              >
                Download Diagnostics
              </button>
              <p className="diagnostics-note">
                Download diagnostic information to include in your bug report
              </p>
            </div>

            <div className="error-help">
              <h3>What can I do?</h3>
              <ul>
                <li>Click "Try Again" to attempt to recover</li>
                <li>Click "Reload Page" to refresh the application</li>
                <li>Report this issue so we can fix it</li>
                <li>Try clearing your browser cache and cookies</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
