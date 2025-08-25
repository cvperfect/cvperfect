import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🚨 React Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can log to an error reporting service here
    if (typeof window !== 'undefined') {
      // Store error for debugging
      window.lastReactError = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      }
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Coś poszło nie tak</h2>
            <p>
              Aplikacja napotkała nieoczekiwany błąd. Nie martw się - Twoje dane są bezpieczne.
            </p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                🔄 Spróbuj ponownie
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                ♻️ Odśwież stronę
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Szczegóły błędu (development)</summary>
                <pre className="error-stack">
                  <strong>Error:</strong> {this.state.error?.message}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {this.state.error?.stack}
                  {'\n\n'}
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-boundary-content {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-radius: 20px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              text-align: center;
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 20px;
            }

            h2 {
              color: #333;
              margin: 0 0 15px 0;
              font-size: 1.8rem;
              font-weight: 600;
            }

            p {
              color: #666;
              margin-bottom: 30px;
              font-size: 1.1rem;
              line-height: 1.6;
            }

            .error-actions {
              display: flex;
              gap: 15px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 30px;
            }

            .retry-button, .reload-button {
              padding: 12px 24px;
              border: none;
              border-radius: 10px;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }

            .retry-button {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
            }

            .retry-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }

            .reload-button {
              background: #f8f9fa;
              color: #495057;
              border: 2px solid #e9ecef;
            }

            .reload-button:hover {
              background: #e9ecef;
              transform: translateY(-2px);
            }

            .error-details {
              text-align: left;
              margin-top: 20px;
              background: #f8f9fa;
              border-radius: 10px;
              padding: 15px;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 500;
              color: #666;
              margin-bottom: 10px;
            }

            .error-stack {
              background: #2d3748;
              color: #e2e8f0;
              padding: 15px;
              border-radius: 8px;
              font-size: 0.85rem;
              overflow-x: auto;
              margin: 0;
              white-space: pre-wrap;
              word-break: break-word;
            }

            @media (max-width: 768px) {
              .error-boundary-content {
                padding: 30px 20px;
                margin: 20px;
              }

              .error-actions {
                flex-direction: column;
              }

              .retry-button, .reload-button {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for functional components
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ErrorBoundary