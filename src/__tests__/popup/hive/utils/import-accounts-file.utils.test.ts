import { Screen } from '@interfaces/screen.interface';
import { MessageType } from '@reference-data/message-type.enum';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import ImportAccountsFileUtils from 'src/popup/hive/utils/import-accounts-file.utils';
import FileUtils from 'src/utils/file.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';

describe('import-accounts-file.utils tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getStore = () =>
    getFakeStore({
      ...initialEmptyStateStore,
      mk: 'mk',
      hive: {
        ...initialEmptyStateStore.hive,
        accounts: [],
      },
    });

  it('opens the accounts import window from a popup', () => {
    jest.spyOn(ExtensionSurfaceUtils, 'isSidePanelPage').mockReturnValue(false);
    jest
      .spyOn(chrome.windows, 'getCurrent')
      .mockImplementation((callback: any) =>
        callback({ width: 400, left: 0, top: 0 }),
      );
    const createSpy = jest
      .spyOn(chrome.windows, 'create')
      .mockResolvedValue({ id: 1 } as any);
    jest
      .spyOn(chrome.runtime, 'getURL')
      .mockReturnValue('chrome-extension://test/import-accounts.html');

    ImportAccountsFileUtils.startImportAccountsFromFile(getStore());

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'chrome-extension://test/import-accounts.html',
        type: 'popup',
      }),
    );
  });

  it('sends the selected file through IMPORT_ACCOUNTS from the side panel', async () => {
    jest.spyOn(ExtensionSurfaceUtils, 'isSidePanelPage').mockReturnValue(true);
    jest.spyOn(FileUtils, 'toBase64').mockResolvedValue('ZmlsZQ==');
    const sendMessageSpy = jest
      .spyOn(CommunicationUtils, 'runtimeSendMessage')
      .mockResolvedValue(undefined as never);

    const createdInputs: HTMLInputElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'input') {
        createdInputs.push(element as HTMLInputElement);
      }
      return element;
    });

    ImportAccountsFileUtils.startImportAccountsFromFile(getStore());

    const fileInput = createdInputs[0];
    expect(fileInput).toBeDefined();
    expect(fileInput.accept).toBe('.kc');

    const file = new File(['wallet'], '2026-09-15-export.kc');
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    await fileInput.onchange?.({
      target: fileInput,
    } as unknown as Event);

    expect(sendMessageSpy).toHaveBeenCalledWith({
      command: BackgroundCommand.IMPORT_ACCOUNTS,
      value: atob('ZmlsZQ=='),
    });
  });

  it('applies a full backup callback to the store and navigates home', async () => {
    const reduxStore = getStore();
    const importedHiveAccounts = [accounts.local.one];
    const importedEvmAccounts = [
      {
        id: 0,
        seedId: 1,
        wallet: { address: '0x1234567890123456789012345678901234567890' },
        source: 'seed',
      },
    ] as any;
    jest
      .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
      .mockResolvedValue(importedEvmAccounts);
    jest.spyOn(EvmWalletUtils, 'invalidateRebuildAccountsCache');
    jest.spyOn(ExtensionSurfaceUtils, 'isSidePanelPage').mockReturnValue(false);
    jest
      .spyOn(chrome.windows, 'getCurrent')
      .mockImplementation((callback: any) =>
        callback({ width: 400, left: 0, top: 0 }),
      );
    jest.spyOn(chrome.windows, 'create').mockResolvedValue({ id: 1 } as any);

    let onMessageListener: ((message: any) => void) | undefined;
    jest
      .spyOn(chrome.runtime.onMessage, 'addListener')
      .mockImplementation((listener: any) => {
        onMessageListener = listener;
      });
    const removeListenerSpy = jest.spyOn(
      chrome.runtime.onMessage,
      'removeListener',
    );

    ImportAccountsFileUtils.startImportAccountsFromFile(reduxStore);
    expect(onMessageListener).toBeDefined();

    await onMessageListener!({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: {
        success: true,
        accountType: 'all',
        accounts: importedHiveAccounts,
        message: 'import_html_success',
      },
    });

    expect(removeListenerSpy).toHaveBeenCalled();
    expect(reduxStore.getState().hive.accounts).toEqual(importedHiveAccounts);
    expect(reduxStore.getState().navigation.stack[0].currentPage).toBe(
      Screen.HOME_PAGE,
    );
    expect(reduxStore.getState().message.key).toBe('import_html_success');
    expect(reduxStore.getState().message.type).toBe(MessageType.SUCCESS);
  });

  it('shows an error message when the backup import fails', async () => {
    const reduxStore = getStore();
    jest.spyOn(ExtensionSurfaceUtils, 'isSidePanelPage').mockReturnValue(false);
    jest
      .spyOn(chrome.windows, 'getCurrent')
      .mockImplementation((callback: any) =>
        callback({ width: 400, left: 0, top: 0 }),
      );
    jest.spyOn(chrome.windows, 'create').mockResolvedValue({ id: 1 } as any);

    let onMessageListener: ((message: any) => void) | undefined;
    jest
      .spyOn(chrome.runtime.onMessage, 'addListener')
      .mockImplementation((listener: any) => {
        onMessageListener = listener;
      });

    ImportAccountsFileUtils.startImportAccountsFromFile(reduxStore);

    await onMessageListener!({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: {
        success: false,
        message: 'import_html_error',
      },
    });

    expect(reduxStore.getState().message.key).toBe('import_html_error');
    expect(reduxStore.getState().message.type).toBe(MessageType.ERROR);
  });
});
