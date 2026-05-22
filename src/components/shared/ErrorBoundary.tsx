import { Component, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <AlertOctagon className="size-7" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-lg font-semibold text-content">
            Something went wrong
          </h2>
          <p className="mt-1 max-w-md text-sm text-content-muted">
            This screen hit an unexpected error. You can reload the page to
            continue — your demo data is safe in this browser.
          </p>
          <pre className="mt-3 max-w-md overflow-x-auto rounded-md bg-muted p-2 text-left font-mono text-[11px] text-content-muted">
            {this.state.error.message}
          </pre>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
