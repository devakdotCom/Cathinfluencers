import { CalendarDays } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

function isoToDisplay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function displayToIso(value: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatTypedDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('-');
}

export function DateInput({
  id,
  label,
  value,
  onChange,
  required,
  min,
  max,
  disabled,
  className = '',
}: DateInputProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const inputId = id || generatedId;
  const pickerRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value));
  const [error, setError] = useState('');

  useEffect(() => {
    setDisplayValue(isoToDisplay(value));
  }, [value]);

  const commit = (nextDisplay: string) => {
    if (!nextDisplay) {
      setError('');
      onChange('');
      return;
    }
    if (nextDisplay.length < 10) return;
    const iso = displayToIso(nextDisplay);
    if (!iso || (min && iso < min) || (max && iso > max)) {
      setError(t('form.invalidDate'));
      return;
    }
    setError('');
    onChange(iso);
  };

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker || disabled) return;
    if ('showPicker' in picker) picker.showPicker();
    else picker.click();
  };

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          value={displayValue}
          required={required}
          disabled={disabled}
          placeholder={t('form.datePlaceholder')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={event => {
            const formatted = formatTypedDate(event.target.value);
            setDisplayValue(formatted);
            setError('');
            commit(formatted);
          }}
          onBlur={() => commit(displayValue)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 pr-12 text-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className="vox-focus absolute inset-y-0 right-0 grid min-w-11 place-items-center rounded-r-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700"
          aria-label={`${label}: open calendar`}
        >
          <CalendarDays className="size-4" aria-hidden="true" />
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={event => {
            setError('');
            onChange(event.target.value);
          }}
          className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0"
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
