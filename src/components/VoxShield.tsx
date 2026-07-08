import React from 'react';

interface VoxShieldProps {
  className?: string;
  size?: number | string;
}

/**
 * The official Vox Ecclesiae crest (Commission for Social Communications,
 * Archdiocese of Madras - Mylapore). Served from /crest.png in public/.
 * Used everywhere the brand mark appears so the whole platform carries the
 * one official identity.
 */
export const VoxShield: React.FC<VoxShieldProps> = ({ className = '', size = '100%' }) => (
  <img
    src="/crest.png"
    width={size}
    height={size}
    alt="Vox Ecclesiae official crest"
    className={`select-none object-contain ${className}`}
    draggable={false}
  />
);
