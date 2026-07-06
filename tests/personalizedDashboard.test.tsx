import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PersonalizedDashboard } from '../src/features/dashboard/PersonalizedDashboard';

describe('PersonalizedDashboard', () => {
  it('gives public visitors a clear registration path', () => {
    const onRegister = vi.fn();

    render(
      <PersonalizedDashboard
        user={null}
        role="public"
        member={null}
        memberCount={18}
        events={[]}
        announcements={[]}
        onRegister={onRegister}
        onOpenProfile={vi.fn()}
        onOpenDirectory={vi.fn()}
        onOpenEvents={vi.fn()}
        onOpenAnnouncements={vi.fn()}
        onOpenAdmin={vi.fn()}
        onVerify={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: /your catholic media ministry starts here/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /register as a member/i }));
    expect(onRegister).toHaveBeenCalledOnce();
  });
});

