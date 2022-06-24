import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

export const userEventDefault = userEvent;
