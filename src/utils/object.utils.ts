const isPureObject = (obj: any) => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    !Array.isArray(obj)
  );
};

export const ObjectUtils = {
  isPureObject,
};
