const generateRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min;
};

const generateMultipleRandomWithoutDuplicates = (
  min: number,
  max: number,
  number: number,
) => {
  const randoms: number[] = [];
  do {
    const random = generateRandom(min, max);
    if (!randoms.includes(random)) {
      randoms.push(random);
    }
  } while (randoms.length < number);
  return randoms;
};

const generateOrderedRandomWithoutDuplicates = (
  min: number,
  max: number,
  number: number,
) => {
  return generateMultipleRandomWithoutDuplicates(min, max, number).sort(
    (a, b) => a - b,
  );
};

const countDecimals = (number: string | bigint | number) => {
  const value = number.toString().split('.');
  if (value[1]) return value[1].length;
  else return 0;
};

export const MathUtils = {
  generateRandom,
  generateMultipleRandomWithoutDuplicates,
  generateOrderedRandomWithoutDuplicates,
  countDecimals,
};
