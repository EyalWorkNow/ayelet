import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
          
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 py-4 rounded-2xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 p-4 bg-gray-100 rounded-xl text-left overflow-auto max-w-full">
              <p className="text-xs font-mono text-gray-500 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
