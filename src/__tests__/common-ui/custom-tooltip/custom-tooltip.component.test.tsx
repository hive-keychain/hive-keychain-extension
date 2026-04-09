import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';

describe('custom-tooltip.component', () => {
  interface RectOptions {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  const hasUnmountedStateUpdateWarning = (
    consoleError: jest.SpyInstance<void, any[]>,
  ) =>
    consoleError.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes(
            "Can't perform a React state update on an unmounted component",
          ),
      ),
    );

  const createDOMRect = ({
    left,
    top,
    width,
    height,
  }: RectOptions): DOMRect =>
    ({
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => undefined,
    } as DOMRect);

  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: height,
      writable: true,
    });
  };

  const mockTooltipRects = ({
    anchorRect,
    tooltipRect,
  }: {
    anchorRect: RectOptions;
    tooltipRect: RectOptions;
  }) =>
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('tooltip-anchor')) {
          return createDOMRect(anchorRect);
        }

        if (this.getAttribute('data-testid') === 'tooltip-content') {
          return createDOMRect(tooltipRect);
        }

        return createDOMRect({ left: 0, top: 0, width: 0, height: 0 });
      });

  const renderAndOpenTooltip = (position?: 'top' | 'bottom' | 'left' | 'right') => {
    render(
      <CustomTooltip
        dataTestId="tooltip"
        message="tooltip_message"
        position={position}>
        <button type="button">hover me</button>
      </CustomTooltip>,
    );

    fireEvent.mouseEnter(screen.getByTestId('tooltip'));
    act(() => {
      jest.advanceTimersByTime(251);
    });

    return screen.getByTestId('tooltip-content');
  };

  beforeEach(() => {
    setViewport(320, 600);
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    cleanup();
  });

  it('cleans up the delayed open timer when unmounted before showing', () => {
    jest.useFakeTimers();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <CustomTooltip dataTestId="tooltip" message="tooltip_message">
        <button type="button">hover me</button>
      </CustomTooltip>,
    );

    fireEvent.mouseEnter(screen.getByTestId('tooltip'));
    unmount();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });

  it('cleans up the delayed close timer when unmounted after hiding', () => {
    jest.useFakeTimers();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <CustomTooltip dataTestId="tooltip" message="tooltip_message">
        <button type="button">hover me</button>
      </CustomTooltip>,
    );

    fireEvent.mouseEnter(screen.getByTestId('tooltip'));
    act(() => {
      jest.advanceTimersByTime(251);
    });

    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId('tooltip'));
    unmount();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });

  it('keeps the preferred top placement when it fits in the viewport', () => {
    jest.useFakeTimers();
    mockTooltipRects({
      anchorRect: { left: 100, top: 200, width: 40, height: 20 },
      tooltipRect: { left: 0, top: 0, width: 150, height: 60 },
    });

    const tooltip = renderAndOpenTooltip();

    expect(tooltip).toHaveClass('tooltip', 'top');
    expect(tooltip).toHaveStyle({ left: '45px', top: '132px' });
    expect(tooltip.style.getPropertyValue('--tooltip-arrow-offset-x')).toBe(
      '69px',
    );
  });

  it('flips from top to bottom when there is not enough room above', () => {
    jest.useFakeTimers();
    mockTooltipRects({
      anchorRect: { left: 100, top: 10, width: 40, height: 20 },
      tooltipRect: { left: 0, top: 0, width: 150, height: 60 },
    });

    const tooltip = renderAndOpenTooltip();

    expect(tooltip).toHaveClass('tooltip', 'bottom');
    expect(tooltip).toHaveStyle({ left: '45px', top: '38px' });
  });

  it('flips from left to right when there is not enough room on the left', () => {
    jest.useFakeTimers();
    mockTooltipRects({
      anchorRect: { left: 4, top: 120, width: 20, height: 20 },
      tooltipRect: { left: 0, top: 0, width: 150, height: 60 },
    });

    const tooltip = renderAndOpenTooltip('left');

    expect(tooltip).toHaveClass('tooltip', 'right');
    expect(tooltip).toHaveStyle({ left: '32px', top: '100px' });
    expect(tooltip.style.getPropertyValue('--tooltip-arrow-offset-y')).toBe(
      '24px',
    );
  });

  it('clamps horizontal position when a top tooltip would overflow the viewport', () => {
    jest.useFakeTimers();
    mockTooltipRects({
      anchorRect: { left: 286, top: 200, width: 20, height: 20 },
      tooltipRect: { left: 0, top: 0, width: 150, height: 60 },
    });

    const tooltip = renderAndOpenTooltip();

    expect(tooltip).toHaveClass('tooltip', 'top');
    expect(tooltip).toHaveStyle({ left: '162px', top: '132px' });
    expect(tooltip.style.getPropertyValue('--tooltip-arrow-offset-x')).toBe(
      '128px',
    );
  });
});
