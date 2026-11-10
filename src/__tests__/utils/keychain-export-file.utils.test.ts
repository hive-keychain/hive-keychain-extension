import KeychainExportFileUtils from 'src/utils/keychain-export-file.utils';

describe('keychain-export-file.utils tests', () => {
  it('builds YYYY-MM-DD-export.kc from the local date', () => {
    expect(
      KeychainExportFileUtils.getKeychainExportFileName(
        new Date(2026, 8, 14),
      ),
    ).toBe('2026-09-14-export.kc');
  });

  it('pads single-digit months and days', () => {
    expect(
      KeychainExportFileUtils.getKeychainExportFileName(new Date(2026, 0, 5)),
    ).toBe('2026-01-05-export.kc');
  });
});
