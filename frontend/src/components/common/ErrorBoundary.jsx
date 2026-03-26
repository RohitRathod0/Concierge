import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryFallback extends React.Component {
  render() {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Something went wrong</h2>
        <p className="text-gray-500 font-medium max-w-md mb-8">
          We encountered an unexpected error while trying to render this section. Our team has been notified.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl shadow-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorBoundaryFallback />;
    }
    return this.props.children;
  }
}
