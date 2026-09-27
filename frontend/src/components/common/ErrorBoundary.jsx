import React from 'react';

/**
 * ErrorBoundary — catches render/lifecycle errors anywhere below it and shows a
 * recoverable fallback instead of a blank white screen. Used at the app root so a
 * single broken page can never take down the whole SPA.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a console trace for debugging; the UI stays usable.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    if (window.location.pathname !== '/') {
      window.location.assign('/');
    }
  };

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', color: '#e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong on this page
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '32rem', marginBottom: '1.25rem' }}>
            The rest of the site is fine. You can head back home and continue.
          </p>
          <button
            onClick={this.handleReset}
            style={{ padding: '0.6rem 1.4rem', background: '#ff9933', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Back to home
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
