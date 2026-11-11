interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  lightText = false,
}: BrandLogoProps) {
  const iconDims =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize =
    size === 'sm' ? 'text-[16px]' : size === 'lg' ? 'text-[22px]' : 'text-[18px]';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        className={`${iconDims} shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#526B58" />
        <path
          d="M9 21.5C9 16.8056 12.134 13 16 13C19.866 13 23 16.8056 23 21.5H9Z"
          stroke="#F7F7F3"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 21.5H24.5"
          stroke="#F7F7F3"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="16" cy="10.25" r="1.6" fill="#C28B60" />
      </svg>
      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span
            className={`${textSize} font-semibold tracking-tight ${
              lightText ? 'text-white' : 'text-[var(--text-primary)]'
            }`}
          >
            Mise
          </span>
          <span
            className={`text-[11px] font-medium uppercase tracking-widest ${
              lightText ? 'text-white/65' : 'text-[var(--text-muted)]'
            }`}
          >
            Ops
          </span>
        </div>
      )}
    </div>
  );
}
