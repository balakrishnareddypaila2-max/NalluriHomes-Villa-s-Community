import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F1FCF7] p-6 text-[#141E1B]">
          <div className="w-full max-w-md rounded-2xl border border-[#DAE5E0] bg-white p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-serif text-xl font-semibold">
              Residence Portal Interrupted
            </h1>
            <p className="mt-2 break-words text-xs leading-5 text-[#414845]">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 h-11 w-full rounded-xl bg-[#00241A] text-xs font-semibold text-[#F1FCF7] hover:bg-[#0D3B2E]"
            >
              Reload Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
