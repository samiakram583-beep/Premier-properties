import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F7F4] text-[#0F2A24] flex items-center justify-center px-6 py-16">
          <div className="max-w-lg w-full border border-[#0F2A24]/15 bg-white p-8">
            <p className="text-sm text-[#B38B52] font-medium mb-2">Application notice</p>
            <h1 className="font-display text-3xl font-semibold mb-3">
              Something interrupted this view.
            </h1>
            <p className="text-[#51625C] text-sm leading-relaxed mb-6">
              Please reload the page to restore the workspace. If you were signing in or updating
              records, verify your permissions and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-sm font-medium hover:bg-[#0A1E19] transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
