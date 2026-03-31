import VaultModule from '@background/vault.module';
import Logger from 'src/utils/logger.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

describe('vault.module', () => {
  const originalOffscreen = chrome.offscreen;

  afterEach(() => {
    (chrome as any).offscreen = originalOffscreen;
    jest.restoreAllMocks();
  });

  it('init returns immediately when chrome.offscreen is unavailable', async () => {
    delete (chrome as any).offscreen;

    const debug = jest.spyOn(Logger, 'debug').mockImplementation(() => {});

    await VaultModule.init();

    expect(debug).not.toHaveBeenCalled();
  });

  it('init skips creation when an offscreen document already exists', async () => {
    (chrome as any).offscreen = {
      hasDocument: jest.fn().mockResolvedValue(true),
      createDocument: jest.fn(),
      Reason: { IFRAME_SCRIPTING: 'IFRAME_SCRIPTING' },
    };

    const debug = jest.spyOn(Logger, 'debug').mockImplementation(() => {});

    await VaultModule.init();

    expect(chrome.offscreen!.hasDocument).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(
      'Found existing offscreen document, closing.',
    );
    expect(chrome.offscreen!.createDocument).not.toHaveBeenCalled();
  });

  it('init creates document and resolves when VAULT_LOADED is received', async () => {
    let capturedListener: ((msg: { command: string }) => void) | undefined;
    const addListener = jest.fn((fn: (msg: { command: string }) => void) => {
      capturedListener = fn;
    });
    const removeListener = jest.fn();

    jest.spyOn(chrome.runtime.onMessage, 'addListener').mockImplementation(addListener as any);
    jest.spyOn(chrome.runtime.onMessage, 'removeListener').mockImplementation(removeListener);

    (chrome as any).offscreen = {
      hasDocument: jest.fn().mockResolvedValue(false),
      createDocument: jest.fn().mockResolvedValue(undefined),
      Reason: { IFRAME_SCRIPTING: 'IFRAME_SCRIPTING' },
    };

    const promise = VaultModule.init();

    expect(capturedListener).toBeDefined();
    capturedListener!({ command: BackgroundCommand.VAULT_LOADED });

    await promise;

    expect(chrome.offscreen!.createDocument).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalled();
  });
});
