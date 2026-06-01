// components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white to-[#F5FEF7]">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-[#1B4D3E] mb-2">Something went wrong</h1>
          <p className="text-[#84A98C] text-sm mb-4 max-w-xs">
            {this.state.error?.message || 'Unable to load the app. Please check your internet connection and try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#52B788] text-white rounded-xl shadow-md hover:bg-[#2D6A4F] transition-all"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}