import { createContext, useContext, type ReactNode } from 'react';
import { usePortalController } from './usePortalController';
import type { PortalInitProps } from './types';

export type PortalContextValue = ReturnType<typeof usePortalController>;

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children, ...init }: PortalInitProps & { children: ReactNode }) {
  const value = usePortalController(init);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error('usePortal must be used within PortalProvider');
  return value;
}
