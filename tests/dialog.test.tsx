import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DialogProvider, useDialog } from '../src/components/ui/DialogProvider';

function Harness() {
  const dialog = useDialog();
  return (
    <button onClick={() => void dialog.confirm({ title: 'Delete?', message: 'Permanent action' })}>
      Open
    </button>
  );
}

describe('DialogProvider', () => {
  it('renders an accessible confirmation dialog', () => {
    render(<DialogProvider><Harness /></DialogProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Permanent action')).toBeVisible();
  });
});
