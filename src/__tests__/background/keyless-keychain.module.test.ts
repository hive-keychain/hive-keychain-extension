import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';
import HiveAuthUtils from 'src/utils/hive-auth.utils';

jest.mock('src/utils/hive-auth.utils', () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    challengeRequest: jest.fn(),
    signRequest: jest.fn(),
    authenticate: jest.fn(),
    generateAuthPayloadURI: jest.fn(),
    listenToAuthAck: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@background/utils/keyless-keychain.utils', () => ({
  KeylessKeychainUtils: {
    getKeylessAuthDataByAppName: jest.fn(),
    isKeylessAuthDataRegistered: jest.fn(),
    registerUserAndDapp: jest.fn(),
    updateAuthenticatedKeylessAuthData: jest.fn(),
  },
}));

jest.mock('src/config', () => ({
  __esModule: true,
  default: {
    keyless: { host: 'https://keyless.test' },
  },
}));

describe('KeylessKeychainModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeylessRegistrationInfo', () => {
    it('returns data when registered and valid', async () => {
      const data = { token: 't', expire: 1 };
      (KeylessKeychainUtils.getKeylessAuthDataByAppName as jest.Mock).mockResolvedValue(
        data,
      );
      (KeylessKeychainUtils.isKeylessAuthDataRegistered as jest.Mock).mockReturnValue(
        true,
      );

      const out = await KeylessKeychainModule.getKeylessRegistrationInfo(
        { username: 'alice' } as any,
        'd.app',
        1,
      );

      expect(out).toBe(data);
    });

    it('returns undefined when auth is not registered flag', async () => {
      (KeylessKeychainUtils.getKeylessAuthDataByAppName as jest.Mock).mockResolvedValue({
        token: 'x',
      });
      (KeylessKeychainUtils.isKeylessAuthDataRegistered as jest.Mock).mockReturnValue(
        false,
      );

      await expect(
        KeylessKeychainModule.getKeylessRegistrationInfo(
          { username: 'alice' } as any,
          'd.app',
          1,
        ),
      ).resolves.toBeUndefined();
    });

    it('returns undefined when no stored auth', async () => {
      (KeylessKeychainUtils.getKeylessAuthDataByAppName as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        KeylessKeychainModule.getKeylessRegistrationInfo(
          { username: 'bob' } as any,
          'd.app',
          1,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('handleOperation', () => {
    const handler = {} as RequestsHandler;

    it('routes signBuffer to challengeRequest', async () => {
      await KeylessKeychainModule.handleOperation(
        handler,
        { type: KeychainRequestTypes.signBuffer } as any,
        'd',
        2,
      );

      expect(HiveAuthUtils.connect).toHaveBeenCalled();
      expect(HiveAuthUtils.challengeRequest).toHaveBeenCalledWith(
        handler,
        expect.any(Object),
        'd',
        2,
      );
    });

    it('routes encode/decode to challengeRequest', async () => {
      await KeylessKeychainModule.handleOperation(
        handler,
        { type: KeychainRequestTypes.encode } as any,
        'd',
        2,
      );
      expect(HiveAuthUtils.challengeRequest).toHaveBeenCalled();

      await KeylessKeychainModule.handleOperation(
        handler,
        { type: KeychainRequestTypes.decode } as any,
        'd',
        2,
      );
      expect(HiveAuthUtils.challengeRequest).toHaveBeenCalledTimes(2);
    });

    it('routes default types to signRequest', async () => {
      await KeylessKeychainModule.handleOperation(
        handler,
        { type: KeychainRequestTypes.transfer } as any,
        'd',
        2,
      );

      expect(HiveAuthUtils.signRequest).toHaveBeenCalledWith(
        handler,
        expect.any(Object),
        'd',
        2,
      );
    });

    it('answers with failure for unsupported swap / encodeWithKeys', async () => {
      (chrome.i18n.getMessage as jest.Mock).mockImplementation(
        (_key: string, subs?: string[]) =>
          subs ? `unsupported:${subs[0]}` : 'unsupported',
      );

      await KeylessKeychainModule.handleOperation(
        handler,
        { type: KeychainRequestTypes.swap } as any,
        'd',
        2,
      );

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'answerRequest',
          msg: expect.objectContaining({ success: false }),
        }),
      );
    });
  });

  describe('register', () => {
    const handler = {} as RequestsHandler;

    beforeEach(() => {
      (KeylessKeychainUtils.registerUserAndDapp as jest.Mock).mockReset();
      (HiveAuthUtils.authenticate as jest.Mock).mockReset();
      (HiveAuthUtils.generateAuthPayloadURI as jest.Mock).mockReset();
      (HiveAuthUtils.listenToAuthAck as jest.Mock).mockReset();
    });

    it('sends username required when username is missing', async () => {
      await KeylessKeychainModule.register(
        handler,
        { type: KeychainRequestTypes.transfer } as any,
        'example.com',
        3,
      );

      expect(HiveAuthUtils.connect).toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'answerRequest',
          msg: expect.objectContaining({ success: false }),
        }),
      );
      expect(KeylessKeychainUtils.registerUserAndDapp).not.toHaveBeenCalled();
    });

    it('completes registration flow when registerUserAndDapp returns data', async () => {
      (KeylessKeychainUtils.registerUserAndDapp as jest.Mock).mockResolvedValue({
        appName: 'app',
        authKey: 'ak',
        token: 't',
      });
      (HiveAuthUtils.authenticate as jest.Mock).mockResolvedValue({
        uuid: 'uuid-1',
        expire: Date.now() + 60_000,
      });
      (HiveAuthUtils.generateAuthPayloadURI as jest.Mock).mockResolvedValue(
        'has://auth',
      );

      await KeylessKeychainModule.register(
        handler,
        {
          type: KeychainRequestTypes.transfer,
          username: 'alice',
        } as any,
        'example.com',
        7,
      );

      expect(KeylessKeychainUtils.registerUserAndDapp).toHaveBeenCalled();
      expect(KeylessKeychainUtils.updateAuthenticatedKeylessAuthData).toHaveBeenCalled();
      expect(HiveAuthUtils.generateAuthPayloadURI).toHaveBeenCalledWith(
        expect.objectContaining({
          account: 'alice',
          uuid: 'uuid-1',
          key: 'ak',
          host: 'https://keyless.test',
        }),
      );
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'REGISTER_KEYLESS_KEYCHAIN',
        }),
      );
      expect(HiveAuthUtils.listenToAuthAck).toHaveBeenCalledWith(
        handler,
        'alice',
        expect.any(Object),
        7,
      );
    });

    it('does not show QR when registerUserAndDapp returns nothing', async () => {
      (KeylessKeychainUtils.registerUserAndDapp as jest.Mock).mockResolvedValue(
        null,
      );

      await KeylessKeychainModule.register(
        handler,
        { type: KeychainRequestTypes.transfer, username: 'bob' } as any,
        'example.com',
        1,
      );

      expect(HiveAuthUtils.generateAuthPayloadURI).not.toHaveBeenCalled();
      expect(HiveAuthUtils.listenToAuthAck).not.toHaveBeenCalled();
    });
  });
});
