const isValidHttpsRpcUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidHttpOrHttpsRpcUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
};

const isHttpRpcUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
};

const assertValidHttpsRpcUrl = (url: string): void => {
  if (!isValidHttpsRpcUrl(url)) {
    throw new Error('RPC URL must use HTTPS');
  }
};

const assertValidHttpOrHttpsRpcUrl = (url: string): void => {
  if (!isValidHttpOrHttpsRpcUrl(url)) {
    throw new Error('RPC URL must use HTTP or HTTPS');
  }
};

const assertValidHttpsRpcUrls = (urls: string[]): void => {
  urls.forEach(assertValidHttpsRpcUrl);
};

export const EvmRpcUrlUtils = {
  isValidHttpsRpcUrl,
  isValidHttpOrHttpsRpcUrl,
  isHttpRpcUrl,
  assertValidHttpsRpcUrl,
  assertValidHttpOrHttpsRpcUrl,
  assertValidHttpsRpcUrls,
};
