import React from 'react';

interface VoxShieldProps {
  className?: string;
  size?: number | string;
}

/**
 * The unified Vox Ecclesiae gold shield mark, identical to the one on the
 * public landing page, so the portal and the website share one identity.
 */
export const VoxShield: React.FC<VoxShieldProps> = ({ className = '', size = '100%' }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={`select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 22 Q50 28 80 22 L80 55 Q80 74 50 88 Q20 74 20 55 Z"
      fill="#0d1222"
      stroke="#f5bd32"
      strokeWidth="2.5"
    />
    <path
      d="M50 34 V74 M36 46 H64"
      stroke="#f7d66b"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="50" cy="15" r="6" fill="none" stroke="#f5bd32" strokeWidth="2" />
  </svg>
);
