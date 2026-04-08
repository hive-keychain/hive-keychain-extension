import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';

describe('custom-tooltip.component', () => {
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

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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
});
