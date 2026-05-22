import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base p-6 text-center">
      <Logo showWordmark={false} className="scale-125" />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
        <Compass className="size-7" strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold text-content">
          404 — Page not found
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          The page you're looking for doesn't exist or has moved.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
}
