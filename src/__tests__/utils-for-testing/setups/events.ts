import '@testing-library/jest-dom';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeAwait } from 'src/__tests__/utils-for-testing/interfaces/events';

const advanceTimers = () => jest.runOnlyPendingTimers();

export const userEventPendingTimers = userEvent.setup({
  advanceTimers: advanceTimers,
});

export const userEventPendingNoAutoClose = userEvent.setup({
  advanceTimers: advanceTimers,
  skipAutoClose: true,
});

export const actPendingTimers = async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
};

export const actRunAllTimers = () => {
  act(() => {
    jest.runAllTimers();
  });
};
export const actAdvanceTime = (time: number) => {
  act(() => {
    jest.advanceTimersByTime(time);
  });
};
/**
 * Handling click + getByLabelText only.
 */
export const clickAwait = async (ariaLabels: string[]) => {
  await act(async () => {
    for (let ariaLabel in ariaLabels) {
      await userEventPendingTimers.click(
        screen.getByLabelText(ariaLabels[ariaLabel]),
      );
    }
  });
};
/**
 * Handling type + getByLabelText only. You may use 'text{code}' when needed.
 */
export const typeAwait = async (typeItem: TypeAwait[]) => {
  await act(async () => {
    for (let index in typeItem) {
      await userEventPendingTimers.type(
        screen.getByLabelText(typeItem[index].ariaLabel),
        typeItem[index].text,
      );
    }
  });
};

export const userEventDefault = userEvent;
