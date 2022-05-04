import ArrayUtils from 'src/utils/array.utils';

describe('mergeWithoutDuplicate tests', () => {
  test('must merge arrays of and have no duplicates', () => {
    const array1 = [
      { name: 'theghost1980' },
      { name: 'aggroed' },
      { name: 'quentin' },
    ];
    const array2 = [
      { name: 'theghost1980' },
      { name: 'aggroed' },
      { name: 'quentin' },
      { name: 'marcus' },
    ];
    const expectedArray = [
      { name: 'theghost1980' },
      { name: 'aggroed' },
      { name: 'quentin' },
      { name: 'marcus' },
    ];
    const mergedArrays = ArrayUtils.mergeWithoutDuplicate(
      array1,
      array2,
      'name',
    );
    expect(mergedArrays).toEqual(expectedArray);
  });
});
