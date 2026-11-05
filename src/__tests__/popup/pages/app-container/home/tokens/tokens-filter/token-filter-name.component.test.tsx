import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TokenFilterName } from 'src/popup/hive/pages/app-container/home/tokens/tokens-filter/tokens-filter.component';

describe('token-filter-name.component', () => {
  const shortName = 'DUCAT';
  const longName = 'Decentralized Unified Currency Augmentation Token';
  const originalScrollWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollWidth',
  );
  const originalClientWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth',
  );

  const setNameOverflow = (overflows: boolean) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get() {
        return overflows ? 420 : 40;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 120;
      },
    });
  };

  const restoreElementSize = () => {
    if (originalScrollWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollWidth',
        originalScrollWidth,
      );
    }
    if (originalClientWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        'clientWidth',
        originalClientWidth,
      );
    }
  };

  const hoverName = (nameElement: HTMLElement) => {
    fireEvent.mouseEnter(nameElement.closest('.tooltip-container')!);
    act(() => {
      jest.advanceTimersByTime(251);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    restoreElementSize();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  it('keeps a short token name without a tooltip', () => {
    setNameOverflow(false);
    render(<TokenFilterName name={shortName} />);
    const nameElement = screen.getByText(shortName);

    hoverName(nameElement);

    expect(nameElement).toHaveClass('name');
    expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
  });

  it('shows the full token name in a tooltip when the name is truncated', () => {
    setNameOverflow(true);
    render(<TokenFilterName name={longName} />);
    const nameElement = screen.getByText(longName);

    hoverName(nameElement);

    expect(nameElement).toHaveClass('name');
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(longName);
  });
});
