import ArrayUtils from 'src/utils/array.utils';

describe('mergeWithoutDuplicate tests:\n', () => {
  test('Passing 2 arrays of strings and no key, must merge them without having duplicates', () => {
    const array1 = ['The World', 'The World', 'is', 'a', 'BIG', 'BIG'];
    const array2 = ['Mistery', 'BIG', 'can', 'YOU', 'TELL', '?'];
    expect(ArrayUtils.mergeWithoutDuplicate(array1, array2)).toEqual([
      'The World',
      'is',
      'a',
      'BIG',
      'Mistery',
      'can',
      'YOU',
      'TELL',
      '?',
    ]);
  });

  test('providing the key name, must 2 merge arrays of and have no duplicates on the resulting array', () => {
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

  test('providing the key name, must merge 2 arrays with more than 1 property of and have no duplicates on the resulting array', () => {
    const array1 = [
      { name: 'theghost1980', age: 100 },
      { name: 'aggroed', age: 100 },
      { name: 'quentin', age: 10 },
    ];
    const array2 = [
      { name: 'theghost1980' },
      { name: 'aggroed' },
      { name: 'quentin' },
      { name: 'marcus' },
    ];
    const expectedArray = [
      { name: 'theghost1980', age: 100 },
      { name: 'aggroed', age: 100 },
      { name: 'quentin', age: 10 },
      { name: 'marcus' },
    ];
    const mergedArrays = ArrayUtils.mergeWithoutDuplicate(
      array1,
      array2,
      'name',
    );
    expect(mergedArrays).toEqual(expectedArray);
  });

  test('Not providing the key name(undefined instead), will just merge two arrays with duplicates', () => {
    const array1 = [
      { name: 'theghost1980', age: 100 },
      { name: 'aggroed', age: 100 },
      { name: 'quentin', age: 10 },
    ];
    const array2 = [
      { name: 'theghost1980' },
      { name: 'aggroed' },
      { name: 'quentin' },
      { name: 'marcus' },
    ];
    const expectedArray = [...array1, ...array2];
    const mergedArrays = ArrayUtils.mergeWithoutDuplicate(
      array1,
      array2,
      undefined,
    );
    expect(mergedArrays).toEqual(expectedArray);
  });
});

describe('getMaxValue tests', () => {
  test('Not providing a property name and passing a list, will return the max element in that array', () => {
    const list = [1, 2, 4, 5, 0];
    const maxValue = ArrayUtils.getMaxValue(list, undefined);
    expect(maxValue).toBe(5);
    const list2 = [11, 20, 4000, 50, 0];
    const maxValue2 = ArrayUtils.getMaxValue(list2, undefined);
    expect(maxValue2).toBe(4000);
  });
  test('Not providing a property name and passing a list with equal values, will return the repeated element', () => {
    const list = [1, 1, 1, 1, 1];
    const maxValue = ArrayUtils.getMaxValue(list, undefined);
    expect(maxValue).toBe(1);
    const list2 = [1000, 1000, 1000, 1000, 1000];
    const maxValue2 = ArrayUtils.getMaxValue(list2, undefined);
    expect(maxValue2).toBe(1000);
  });
  test('Providing a property name and passing a {keys:values} list, will return max numeric value', () => {
    const list = [
      { age: 10 },
      { age: 100 },
      { age: 210 },
      { age: 1900 },
      { age: 1 },
    ];
    const maxValue = ArrayUtils.getMaxValue(list, 'age');
    expect(maxValue).toBe(1900);
    const list2 = [
      { age: 10, name: 'sat' },
      { age: 100, name: 'bob' },
      { age: 210, name: 'ana' },
      { age: 11900, name: 'sea' },
      { age: 1, name: 'con' },
    ];
    const maxValue2 = ArrayUtils.getMaxValue(list2, 'age');
    expect(maxValue2).toBe(11900);
  });
  test('Providing a {key:pair} list but NO property will return 0', () => {
    const list = [
      { age: 10 },
      { age: 100 },
      { age: 210 },
      { age: 1900 },
      { age: 1 },
    ];
    const maxValue = ArrayUtils.getMaxValue(list);
    expect(maxValue).toBe(0);
  });
});

describe('getMinValue', () => {
  test('Not providing a property name and passing a list, will return the min element in that array', () => {
    const list = [1, 2, 4, 5, 120];
    const maxValue = ArrayUtils.getMinValue(list, undefined);
    expect(maxValue).toBe(1);
    const list2 = [11, 20, 4000, 50, 0];
    const maxValue2 = ArrayUtils.getMinValue(list2, undefined);
    expect(maxValue2).toBe(0);
  });
  test('Not providing a property name and passing a list with equal values, will return the repeated element', () => {
    const list = [1, 1, 1, 1, 1];
    const maxValue = ArrayUtils.getMinValue(list, undefined);
    expect(maxValue).toBe(1);
    const list2 = [1000, 1000, 1000, 1000, 1000];
    const maxValue2 = ArrayUtils.getMinValue(list2, undefined);
    expect(maxValue2).toBe(1000);
  });
  test('Providing a property name and passing a {keys:values} list, will return min numeric value', () => {
    const list = [
      { age: 10 },
      { age: 100 },
      { age: 210 },
      { age: 1900 },
      { age: 1 },
    ];
    const maxValue = ArrayUtils.getMinValue(list, 'age');
    expect(maxValue).toBe(1);
    const list2 = [
      { age: 10, name: 'sat' },
      { age: 100, name: 'bob' },
      { age: 210, name: 'ana' },
      { age: 11900, name: 'sea' },
      { age: 1.5, name: 'con' },
    ];
    const maxValue2 = ArrayUtils.getMinValue(list2, 'age');
    expect(maxValue2).toBe(1.5);
  });
  test('Providing a {key:pair} list but NO property will return 0', () => {
    const list = [
      { age: 10, name: 's' },
      { age: 100 },
      { age: 210 },
      { age: 1900 },
      { age: 1 },
    ];
    const maxValue = ArrayUtils.getMaxValue(list);
    expect(maxValue).toBe(0);
  });
});
