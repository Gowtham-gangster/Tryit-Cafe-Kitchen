import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF6EE] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#FFFBF7] p-8 rounded-3xl border border-[#EEDDCC] shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertOctagon size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-[#2B1408]">
                Something went wrong
              </h2>
              <p className="text-xs text-[#7A5C4A] leading-relaxed">
                An unexpected interface issue occurred. You can reload the page or return to the cafe home.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] text-left overflow-x-auto text-[11px] font-mono text-red-600 max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/20 transition-all active:scale-95"
              >
                <RotateCcw size={15} />
                <span>Reload Page</span>
              </button>

              <a
                href="/"
                className="w-full sm:flex-1 py-3 rounded-2xl bg-[#FDF6EE] hover:bg-[#FBEFE1] text-[#2B1408] border border-[#EEDDCC] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Home size={15} />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
