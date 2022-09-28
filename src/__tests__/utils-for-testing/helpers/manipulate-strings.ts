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

const removeHtmlTags = (str: string) => {
  let match = str.match(/\<(.*?)\>/g);
  match?.forEach((toRemove) => {
    str = str.replace(toRemove, '');
  });
  return str;
};

const removeTabs = (str: string) => {
  return str.replace(/\s/g, '');
};

export default { replace, removeExtraSpaces, removeHtmlTags, removeTabs };
