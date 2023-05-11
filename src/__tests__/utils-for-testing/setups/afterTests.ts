import { cleanup } from '@testing-library/react';
//TODO move the functions you will need into -> cleaning-reset-tests-module.ts
//  and remove what you dont need.
const clean = () => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
  jest.clearAllMocks();
};

const cleanWithoutRunPendingTimers = () => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
};

/**
 * afterAll already defined.
 */
const resetGlobalImage = () => {
  const originalImage = globalThis.Image;
  afterAll(() => {
    globalThis.Image = originalImage;
  });
};

export default { clean, resetGlobalImage, cleanWithoutRunPendingTimers };
