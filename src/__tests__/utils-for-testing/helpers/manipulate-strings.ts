const replace = (
  value: string,
  toReplace: string,
  replaceBy: string,
  trim: boolean = false,
) => {
  const newValue = value.replace(toReplace, replaceBy).trim();
  return trim ? newValue.trim() : newValue;
};

const removeExtraSpaces = (value: string) => {
  return value
    .split(' ')
    .filter((word) => word !== '')
    .join(' ');
};

export default { replace, removeExtraSpaces };
