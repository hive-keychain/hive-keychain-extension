import { ObjectUtils } from 'src/utils/object.utils';

describe('object.utils', () => {
  it('isPureObject is true only for non-null plain objects', () => {
    expect(ObjectUtils.isPureObject({})).toBe(true);
    expect(ObjectUtils.isPureObject({ a: 1 })).toBe(true);
    expect(ObjectUtils.isPureObject(null)).toBe(false);
    expect(ObjectUtils.isPureObject(undefined)).toBe(false);
    expect(ObjectUtils.isPureObject([])).toBe(false);
    expect(ObjectUtils.isPureObject('x')).toBe(false);
    expect(ObjectUtils.isPureObject(0)).toBe(false);
  });
});
