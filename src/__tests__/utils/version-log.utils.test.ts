import { KeychainApi } from '@api/keychain';
import { VersionLogUtils } from 'src/utils/version-log.utils';

jest.mock('@api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

describe('version-log.utils', () => {
  it('getLastVersion returns the Keychain API payload', async () => {
    (KeychainApi.get as jest.Mock).mockResolvedValueOnce({ version: '3.15.1' });

    await expect(VersionLogUtils.getLastVersion()).resolves.toEqual({
      version: '3.15.1',
    });
    expect(KeychainApi.get).toHaveBeenCalledWith('last-extension-version');
  });
});
