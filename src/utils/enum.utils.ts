const isKeyOf = (key: string, enumObject: any) => {
  return Object.keys(enumObject).some((v) => v === key);
};

const isValueOf = (key: string, enumObject: any) => {
  return Object.values(enumObject).some((v) => v === key);
};

export const EnumUtils = { isKeyOf, isValueOf };
