import { useEffect, useState } from 'react';
import { BrandLogo } from '../ui/BrandLogo';

const STATUS_STEPS = [
  'Initializing workspace',
  'Loading restaurant data',
  "Organizing today's operations",
  'Almost ready',
];

interface LoadingWorkspaceProps {
  onComplete: () => void;
  durationMs?: number;
}

export function LoadingWorkspace({
  onComplete,
  durationMs = 1350,
}: LoadingWorkspaceProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(14);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setStepIndex(1);
      setProgress(46);
    }, durationMs * 0.25);

    const t2 = window.setTimeout(() => {
      setStepIndex(2);
      setProgress(76);
    }, durationMs * 0.52);

    const t3 = window.setTimeout(() => {
      setStepIndex(3);
      setProgress(100);
    }, durationMs * 0.78);

    const tFade = window.setTimeout(() => {
      setFadingOut(true);
    }, durationMs - 200);

    const tDone = window.setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(tFade);
      window.clearTimeout(tDone);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6 transition-opacity duration-200 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-[300px] flex flex-col items-center text-center animate-page-in">
        <BrandLogo size="lg" />

        <p className="mt-6 text-[15px] font-medium text-[var(--text-primary)]">
          Preparing your workspace...
        </p>

        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-[var(--border-color)]">
          <div
            className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 min-h-[18px] text-[12.5px] text-[var(--text-secondary)] transition-opacity duration-150">
          {STATUS_STEPS[stepIndex]}
        </p>
      </div>
    </div>
  );
}
