import {
  KeychainKeyTypes,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import keychainify from 'src/content-scripts/keychainify/keychainify';
import KeychainifyUtils from 'src/utils/keychainify.utils';

describe('keychainify.ts tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('requestTransfer cases:\n', () => {
    it('Must drop an invalid redirect_uri before dispatching the request', () => {
      jest
        .spyOn(KeychainifyUtils, 'isRedirectUriAcceptable')
        .mockReturnValue(false);
      const sDispatchRequest = jest
        .spyOn(keychainify, 'dispatchRequest')
        .mockImplementation(() => {});

      keychainify.requestTransfer(
        null,
        'alice',
        'bob',
        '1',
        'memo',
        'HIVE',
        'javascript:alert(1)',
      );

      expect(sDispatchRequest).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          type: KeychainRequestTypes.transfer,
          redirect_uri: '',
        }),
      );
    });
  });

  describe('requestCustomJSON cases:\n', () => {
    it('Must keep a valid redirect_uri when the validator accepts it', () => {
      jest
        .spyOn(KeychainifyUtils, 'isRedirectUriAcceptable')
        .mockReturnValue(true);
      const sDispatchRequest = jest
        .spyOn(keychainify, 'dispatchRequest')
        .mockImplementation(() => {});

      keychainify.requestCustomJSON(
        null,
        '["alice"]',
        '[]',
        'custom-id',
        '{"test":true}',
        'display message',
        'https://app.example.com/hk-callback',
      );

      expect(sDispatchRequest).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          type: 'custom',
          method: KeychainKeyTypes.posting,
          redirect_uri: 'https://app.example.com/hk-callback',
        }),
      );
    });
  });
});
