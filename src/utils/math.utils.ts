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

export const MathUtils = {
  generateRandom,
  generateMultipleRandomWithoutDuplicates,
  generateOrderedRandomWithoutDuplicates,
};
