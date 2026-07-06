import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GlobalSearch } from '../src/features/search/GlobalSearch';

describe('GlobalSearch', () => {
  it('finds events and routes to the calendar', () => {
    const onNavigate = vi.fn();

    render(
      <GlobalSearch
        members={[]}
        announcements={[]}
        events={[
          {
            id: 'event-1',
            title: 'Diocesan Media Formation',
            description: 'Training for parish media teams',
            date: '2026-07-12',
            type: 'meeting',
            category: 'Media',
            location: 'Pastoral Centre',
          },
        ]}
        onOpenMember={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open global search/i }));
    fireEvent.change(
      screen.getByRole('textbox', {
        name: /search members, events, announcements, and resources/i,
      }),
      { target: { value: 'media formation' } },
    );
    fireEvent.click(screen.getByRole('option', { name: /diocesan media formation/i }));

    expect(onNavigate).toHaveBeenCalledWith('events');
  });

  it('opens resources from a natural-language query', () => {
    const onNavigate = vi.fn();

    render(
      <GlobalSearch
        members={[]}
        events={[]}
        announcements={[]}
        onOpenMember={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open global search/i }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'catechism forms' },
    });
    fireEvent.click(screen.getByRole('option', { name: /catholic resource library/i }));

    expect(onNavigate).toHaveBeenCalledWith('guidelines');
  });
});

