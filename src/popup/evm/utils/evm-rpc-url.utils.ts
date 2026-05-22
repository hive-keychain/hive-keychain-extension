const isValidHttpsRpcUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const assertValidHttpsRpcUrl = (url: string): void => {
  if (!isValidHttpsRpcUrl(url)) {
    throw new Error('RPC URL must use HTTPS');
  }
};

const assertValidHttpsRpcUrls = (urls: string[]): void => {
  urls.forEach(assertValidHttpsRpcUrl);
};

export const EvmRpcUrlUtils = {
  isValidHttpsRpcUrl,
  assertValidHttpsRpcUrl,
  assertValidHttpsRpcUrls,
};
