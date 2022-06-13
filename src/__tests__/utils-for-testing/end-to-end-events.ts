import userEvent from '@testing-library/user-event';

const advanceTimers = () => jest.runOnlyPendingTimers();

export const userEventPendingTimers = userEvent.setup({
  advanceTimers: advanceTimers,
});

export const userEventPendingNoAutoClose = userEvent.setup({
  advanceTimers: advanceTimers,
  skipAutoClose: true,
});

export const userEventDefault = userEvent;
