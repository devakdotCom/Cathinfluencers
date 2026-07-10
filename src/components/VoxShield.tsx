import React from 'react';
import { VoxEcclesiaeLogo } from './VoxEcclesiaeLogo';

interface VoxShieldProps {
  className?: string;
  size?: number | string;
}

/** Official Vox Ecclesiae crest — inline SVG so logos work without a missing /crest.png asset. */
export const VoxShield: React.FC<VoxShieldProps> = ({ className = '', size = '100%' }) => (
  <VoxEcclesiaeLogo size={size} className={`object-contain ${className}`} />
);
