const collectErrorTextValues = (
  value: unknown,
  seen = new WeakSet<object>(),
): string[] => {
  if (typeof value === 'string') {
    return [value];
  }
  if (!value || typeof value !== 'object') {
    return [];
  }
  if (seen.has(value)) {
    return [];
  }
  seen.add(value);

  return Object.values(value).flatMap((entry) =>
    collectErrorTextValues(entry, seen),
  );
};

const getErrorText = (error: unknown): string => {
  return collectErrorTextValues(error).join(' ');
};

const getMinimumGasPriceWeiFromError = (error: unknown): string | undefined => {
  const text = getErrorText(error);
  const minimumMatch = text.match(/minimum needed\s*:?\s*(\d+)/i);
  return minimumMatch?.[1];
};

const isInsufficientGasPriceError = (error: unknown): boolean => {
  const text = getErrorText(error).toLowerCase();
  return (
    text.includes('transaction gas price below minimum') ||
    text.includes('gas price below minimum') ||
    text.includes('transaction underpriced')
  );
};

export const EvmGasPriceErrorUtils = {
  getMinimumGasPriceWeiFromError,
  isInsufficientGasPriceError,
};
