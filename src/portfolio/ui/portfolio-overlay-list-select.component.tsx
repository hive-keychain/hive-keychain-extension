import React, {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import './portfolio-overlay-list-select.component.scss';

let overlaySelectIdCounter = 0;

const useOverlaySelectId = (): string => {
  const idRef = useRef<string>();
  if (!idRef.current) {
    overlaySelectIdCounter += 1;
    idRef.current = `portfolio-overlay-select-${overlaySelectIdCounter}`;
  }
  return idRef.current;
};

export type PortfolioOverlayListOption = {
  value: string;
  label: string;
};

export type PortfolioOverlayListSelectProps = {
  label: string;
  options: PortfolioOverlayListOption[];
  value: string;
  onChange: (value: string) => void;
  renderOption: (value: string) => ReactNode;
  renderDisplay?: (value: string) => ReactNode;
  disabled?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
};

export const PortfolioOverlayListSelect = ({
  label,
  options,
  value,
  onChange,
  renderOption,
  renderDisplay,
  disabled,
  error,
  hint,
  id,
  className,
}: PortfolioOverlayListSelectProps) => {
  const generatedId = useOverlaySelectId();
  const fieldId = id ?? generatedId;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedLabel = options[selectedIndex]?.label ?? value;
  const displayFn = renderDisplay ?? renderOption;

  const [highlightIndex, setHighlightIndex] = useState(() =>
    selectedIndex >= 0 ? selectedIndex : 0,
  );

  useEffect(() => {
    if (open) {
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${highlightIndex}"]`,
    );
    element?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDocMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const moveHighlight = useCallback(
    (delta: number) => {
      if (options.length === 0) {
        return;
      }
      setHighlightIndex((current) => {
        const next = current + delta;
        return Math.max(0, Math.min(options.length - 1, next));
      });
    },
    [options.length],
  );

  const choose = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
    },
    [onChange],
  );

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        moveHighlight(1);
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        moveHighlight(-1);
      }
      return;
    }
    if (open && event.key === 'Home') {
      event.preventDefault();
      setHighlightIndex(0);
      return;
    }
    if (open && event.key === 'End') {
      event.preventDefault();
      setHighlightIndex(options.length - 1);
      return;
    }
    if (open && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const option = options[highlightIndex];
      if (option) {
        choose(option.value);
      }
      return;
    }
    if (!open && event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const shellClass = [
    'portfolio-overlay-select__shell',
    disabled ? 'is-disabled' : '',
    error ? 'is-invalid' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const activeDescendant =
    open && options.length > 0
      ? `${listboxId}-opt-${highlightIndex}`
      : undefined;

  return (
    <div
      ref={rootRef}
      className={['portfolio-overlay-select', className].filter(Boolean).join(' ')}>
      <label
        id={labelId}
        className="portfolio-overlay-select__label"
        htmlFor={fieldId}>
        {label}
      </label>
      <div className="portfolio-overlay-select__shell-wrap">
        <div className={shellClass}>
          <button
            id={fieldId}
            type="button"
            className="portfolio-overlay-select__trigger"
            disabled={disabled || options.length === 0}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={activeDescendant}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [hint && !error ? hintId : null, error ? errorId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-label={`${label}: ${selectedLabel}`}
            onClick={() => {
              if (!disabled && options.length > 0) {
                setOpen((current) => !current);
              }
            }}
            onKeyDown={onTriggerKeyDown}>
            <span className="portfolio-overlay-select__preview">
              {displayFn(value)}
            </span>
          </button>
          <span className="portfolio-overlay-select__caret" aria-hidden />
        </div>
        {open ? (
          <ul
            ref={listRef}
            className="portfolio-overlay-select__list"
            role="listbox"
            id={listboxId}
            aria-labelledby={labelId}>
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-opt-${index}`}
                data-option-index={index}
                role="option"
                aria-selected={option.value === value}
                data-highlighted={index === highlightIndex ? 'true' : undefined}
                className="portfolio-overlay-select__option"
                onMouseEnter={() => setHighlightIndex(index)}
                onMouseDown={(mouseEvent) => mouseEvent.preventDefault()}
                onClick={() => choose(option.value)}>
                {renderOption(option.value)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="portfolio-overlay-select__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="portfolio-overlay-select__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
