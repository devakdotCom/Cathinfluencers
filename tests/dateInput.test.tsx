import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateInput } from '../src/components/forms/DateInput';

describe('DateInput', () => {
  it('auto-formats manual input and emits an ISO date', () => {
    const onChange = vi.fn();
    render(<DateInput label="Date of birth" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '25121995' },
    });
    expect(screen.getByLabelText('Date of birth')).toHaveValue('25-12-1995');
    expect(onChange).toHaveBeenCalledWith('1995-12-25');
  });

  it('rejects impossible dates', () => {
    render(<DateInput label="Event date" value="" onChange={() => undefined} />);
    const input = screen.getByLabelText('Event date');
    fireEvent.change(input, { target: { value: '31022026' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid date');
  });
});
