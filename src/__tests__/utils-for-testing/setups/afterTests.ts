import { cleanup } from '@testing-library/react';

const clean = () => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.useRealTimers();
  cleanup();
};

export default { clean };
