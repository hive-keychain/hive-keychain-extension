import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { performKeylessOperation } from '@background/index';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { keylessKeychainRequest } from 'src/background/requests/logic/keyless-keychain.logic';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';

jest.mock('@background/index', () => ({
  performKeylessOperation: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@background/keyless-keychain.module', () => ({
  KeylessKeychainModule: {
    getKeylessRegistrationInfo: jest.fn(),
  },
}));

jest.mock('@background/requests/dialog-lifecycle', () => ({
  createPopup: jest.fn((cb: () => void | Promise<void>) => {
    void Promise.resolve(cb());
  }),
}));

/** keylessKeychainRequest does not await async popup helpers; flush macrotasks before asserting. */
const flushAsyncPopups = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

describe('keylessKeychainRequest', () => {
  const tab = 7;
  const domain = 'https://d.app';
  const sendMessage = chrome.runtime.sendMessage as jest.Mock;

  const makeHandler = () =>
    ({
      data: {},
      setIsKeyless: jest.fn().mockResolvedValue(undefined),
      setIsWaitingForConfirmation: jest.fn().mockResolvedValue(undefined),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    sendMessage.mockResolvedValue(undefined);
    jest.spyOn(chrome.i18n, 'getMessage').mockResolvedValue('msg');
  });

  it('opens anonymous keyless flow when username is empty for an anonymous operation type', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue(
      undefined,
    );
    const requestHandler = makeHandler();
    const request = {
      type: KeychainRequestTypes.vote,
      username: '',
    } as any;

    await keylessKeychainRequest(requestHandler, tab, request, domain);
    await flushAsyncPopups();

    expect(requestHandler.setIsKeyless).toHaveBeenCalledWith(true);
    expect(requestHandler.setIsWaitingForConfirmation).toHaveBeenCalledWith(true);
    expect(createPopup).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: expect.any(String),
        requestHandler,
        data: request,
        tab,
        domain,
      }),
    );
  });

  it('routes addAccount to ADD_ACCOUNT dialog', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue({
      token: 'x',
    });
    const requestHandler = makeHandler();
    const request = { type: KeychainRequestTypes.addAccount } as any;

    await keylessKeychainRequest(requestHandler, tab, request, domain);

    expect(createPopup).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: expect.any(String),
        data: request,
        tab,
        domain,
      }),
    );
  });

  it('answers with failure for unsupported swap when user is not anonymous', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue({
      token: 'x',
    });
    const requestHandler = makeHandler();

    await keylessKeychainRequest(
      requestHandler,
      tab,
      { type: KeychainRequestTypes.swap, username: 'alice' } as any,
      domain,
    );
    await flushAsyncPopups();

    expect(createPopup).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: expect.any(String),
        msg: expect.objectContaining({ success: false }),
      }),
    );
  });

  it('answers with failure for unsupported encodeWithKeys', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue({
      token: 'x',
    });
    const requestHandler = makeHandler();

    await keylessKeychainRequest(
      requestHandler,
      tab,
      { type: KeychainRequestTypes.encodeWithKeys, username: 'alice' } as any,
      domain,
    );
    await flushAsyncPopups();

    expect(createPopup).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: expect.objectContaining({ success: false }),
      }),
    );
  });

  it('opens registration when no keyless auth is registered', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue(
      null,
    );
    const requestHandler = makeHandler();
    const request = { type: KeychainRequestTypes.transfer, username: 'alice' } as any;

    await keylessKeychainRequest(requestHandler, tab, request, domain);
    await flushAsyncPopups();

    expect(requestHandler.setIsKeyless).toHaveBeenCalledWith(true);
    expect(requestHandler.setIsWaitingForConfirmation).toHaveBeenCalledWith(true);
    expect(createPopup).toHaveBeenCalled();
  });

  it('delegates to performKeylessOperation when keyless auth exists', async () => {
    (KeylessKeychainModule.getKeylessRegistrationInfo as jest.Mock).mockResolvedValue({
      token: 't',
    });
    const requestHandler = makeHandler();
    const request = { type: KeychainRequestTypes.transfer, username: 'alice' } as any;

    await keylessKeychainRequest(requestHandler, tab, request, domain);

    expect(performKeylessOperation).toHaveBeenCalledWith(
      requestHandler,
      tab,
      request,
      domain,
    );
  });
});
