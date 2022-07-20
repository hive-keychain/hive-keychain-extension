import { cleanup } from '@testing-library/react';

const clean = () => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
  jest.clearAllMocks();
};

export default { clean };
