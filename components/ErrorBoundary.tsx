'use client';

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 * Prevents entire app from crashing
 */
import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console in development
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // TODO: Log to monitoring service (Sentry, etc.)
    // Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-mono text-sm text-destructive mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs overflow-auto max-h-48">
                      {this.state.errorInfo}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="default">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Smaller error boundary for specific sections
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName = 'this section' 
}: { 
  children: ReactNode;
  sectionName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold">Error loading {sectionName}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Unable to load this content. Please refresh the page.
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

