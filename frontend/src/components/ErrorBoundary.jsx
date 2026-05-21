import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
          textAlign: 'center',
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Algo deu errado
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: '1.5rem' }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              fontSize: '0.75rem',
              color: 'var(--color-danger)',
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: '0.5rem',
              maxWidth: '600px',
              overflow: 'auto',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={18} />
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
