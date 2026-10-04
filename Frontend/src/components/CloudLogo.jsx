/**
 * CloudLogo — G-Drive-Clone cloud icon used in branding.
 * @param {{ size?: number, className?: string }} props
 */
export default function CloudLogo({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cloud-logo ${className}`}
      aria-hidden="true"
    >
      <path
        d="M8 24a6 6 0 0 1-.88-11.94A8 8 0 0 1 22.83 14 5 5 0 0 1 24 24H8Z"
        fill="url(#cl-g)"
      />
      <path
        d="M14 18l3-3 3 3M17 15v7"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="cl-g" x1="4" y1="10" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
