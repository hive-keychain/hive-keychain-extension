const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

export const AsyncUtils = { sleep };
