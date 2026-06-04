/* istanbul ignore next */
const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

export const AsyncUtils = { sleep };
