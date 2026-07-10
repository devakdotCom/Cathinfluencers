import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthFlowNavigation } from '../src/features/auth/AuthFlowNavigation';

vi.mock('../src/utils/marketingNavigation', () => ({
  goToMarketingHome: vi.fn(),
}));

import { goToMarketingHome } from '../src/utils/marketingNavigation';

describe('AuthFlowNavigation', () => {
  it('returns to the marketing landing page', () => {
    const onBeforeNavigate = vi.fn();
    render(<AuthFlowNavigation currentLabel="Register" onBeforeNavigate={onBeforeNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /back to vox ecclesiae landing page/i }));

    expect(onBeforeNavigate).toHaveBeenCalled();
    expect(goToMarketingHome).toHaveBeenCalled();
  });
});
