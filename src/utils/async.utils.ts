/* istanbul ignore next */
const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

interface PromiseObject {
  [promiseKey: string]: any;
}

const promiseAllWithKeys = async (promiseHashMap: {
  [promiseKey: string]: Promise<any>;
}): Promise<PromiseObject> => {
  const keys = Object.keys(promiseHashMap);
  const promises = Object.values(promiseHashMap);

  const values = await Promise.all(promises);
  console.log({ values });

  const result: any = {};

  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = values[i];
  }
  return result;
};

export const AsyncUtils = { sleep, promiseAllWithKeys };
