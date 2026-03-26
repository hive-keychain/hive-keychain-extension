import { AutoCompleteUtils } from 'src/utils/autocomplete.utils';

describe('autocomplete.utils', () => {
  describe('filterStringList', () => {
    it('returns items whose lowercase value includes the query', () => {
      expect(
        AutoCompleteUtils.filterStringList(['Alice', 'bob', 'Carol'], 'bo'),
      ).toEqual(['bob']);
    });

    it('excludes non-string entries', () => {
      expect(
        AutoCompleteUtils.filterStringList(
          ['ok', null as unknown as string, 'okay'],
          'ok',
        ),
      ).toEqual(['ok', 'okay']);
    });

    it('returns empty array when nothing matches', () => {
      expect(AutoCompleteUtils.filterStringList(['a', 'b'], 'zzz')).toEqual([]);
    });
  });

  describe('filterValuesList', () => {
    it('matches on value substring', () => {
      expect(
        AutoCompleteUtils.filterValuesList(
          [{ value: 'HiveUser' }, { value: 'other' }],
          'hive',
        ),
      ).toEqual([{ value: 'HiveUser' }]);
    });

    it('matches on subLabel when value does not match', () => {
      expect(
        AutoCompleteUtils.filterValuesList(
          [{ value: 'x', subLabel: 'Delegation' }, { value: 'y' }],
          'deleg',
        ),
      ).toEqual([{ value: 'x', subLabel: 'Delegation' }]);
    });

    it('drops entries with non-string value', () => {
      expect(
        AutoCompleteUtils.filterValuesList(
          [{ value: 1 as unknown as string }],
          '1',
        ),
      ).toEqual([]);
    });

    it('drops entries when subLabel is not a string', () => {
      expect(
        AutoCompleteUtils.filterValuesList(
          [{ value: 'only', subLabel: 99 as unknown as string }],
          '99',
        ),
      ).toEqual([]);
    });
  });

  describe('filterCategoriesList', () => {
    it('keeps categories that have matching values and drops empty categories', () => {
      const list = {
        categories: [
          {
            title: 'A',
            values: [
              { value: 'match-here' },
              { value: 'no' },
            ],
          },
          {
            title: 'B',
            values: [{ value: 'none' }],
          },
        ],
      };
      expect(AutoCompleteUtils.filterCategoriesList(list, 'match')).toEqual([
        {
          title: 'A',
          values: [{ value: 'match-here' }],
        },
      ]);
    });

    it('matches subLabel inside nested categories', () => {
      const list = {
        categories: [
          {
            title: 'T',
            values: [{ value: 'v', subLabel: 'FindMe' }],
          },
        ],
      };
      expect(AutoCompleteUtils.filterCategoriesList(list, 'find')).toEqual([
        {
          title: 'T',
          values: [{ value: 'v', subLabel: 'FindMe' }],
        },
      ]);
    });
  });
});
