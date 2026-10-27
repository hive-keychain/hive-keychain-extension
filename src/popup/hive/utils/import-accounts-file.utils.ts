import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { activateHiveAccount } from '@popup/hive/actions/active-account.actions';
import AccountUtils from '@popup/hive/utils/account.utils';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { Store } from 'redux';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import FileUtils from 'src/utils/file.utils';
import Logger from 'src/utils/logger.utils';

type ImportAccountsStore = Store<RootState>;

const IMPORT_ACCOUNTS_PAGE = 'import-accounts.html';

const sendImportedFileToBackground = async (file: File): Promise<void> => {
  const base64 = await FileUtils.toBase64(file);
  const fileData = atob(base64);
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.IMPORT_ACCOUNTS,
    value: fileData,
  });
};

const openSidePanelFilePicker = (): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.kc';
  input.style.display = 'none';
  input.onchange = async (event) => {
    const selectedFile = (event.target as HTMLInputElement).files?.[0];
    if (!selectedFile) {
      input.remove();
      return;
    }

    await sendImportedFileToBackground(selectedFile);
    input.remove();
  };
  document.body.appendChild(input);
  input.click();
};

const openImportAccountsWindow = (): void => {
  chrome.windows.getCurrent(async (currentWindow) => {
    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL(IMPORT_ACCOUNTS_PAGE),
      type: 'popup',
      height: 600,
      width: 435,
      left: currentWindow.width! - 350 + currentWindow.left!,
      top: currentWindow.top,
    };
    // Except on Firefox
    //@ts-ignore
    if (typeof InstallTrigger === undefined) win.focused = true;
    await chrome.windows.create(win);
  });
};

const getImportErrorMessage = (value: BackgroundMessage['value']): string => {
  if (typeof value === 'string') {
    return value;
  }

  return value?.message ?? 'import_html_error';
};

const activateImportedHiveAccount = async (
  reduxStore: ImportAccountsStore,
  hiveAccount: LocalAccount,
): Promise<void> => {
  await reduxStore.dispatch(activateHiveAccount(hiveAccount));
};

const resolveImportedAccountsRegisterChainId = async (
  activeChain: RootState['chain'],
): Promise<string | undefined> => {
  if (
    activeChain?.type === ChainType.EVM &&
    (activeChain as EvmChain).isCustom !== true
  ) {
    return activeChain.chainId;
  }

  const setupChains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
    ChainType.EVM,
  );
  return setupChains.find(
    (setupChain) =>
      setupChain.type === ChainType.EVM && setupChain.isCustom !== true,
  )?.chainId;
};

const registerImportedEvmAccounts = async (
  evmAccounts: Array<{ wallet?: { address?: string } }>,
  activeChain: RootState['chain'],
) => {
  const hasAddress = evmAccounts.some((account) =>
    Boolean(account.wallet?.address?.trim()),
  );
  if (!hasAddress) {
    return;
  }

  const chainId = await resolveImportedAccountsRegisterChainId(activeChain);
  if (!chainId) {
    return;
  }

  try {
    await EvmLightNodeUtils.registerLocalAddresses(chainId);
  } catch (error) {
    Logger.error(
      'Error while registering imported EVM addresses with light node',
      error,
    );
  }
};

const applyImportedAccountsMessage = async (
  message: BackgroundMessage,
  reduxStore: ImportAccountsStore,
): Promise<boolean> => {
  if (message.command !== BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
    return false;
  }

  const { mk, chain } = reduxStore.getState();

  if (
    !(typeof message.value === 'string') &&
    message.value?.success &&
    message.value?.accountType === 'all'
  ) {
    const hiveAccounts =
      message.value?.accounts?.length > 0
        ? message.value.accounts
        : ((await AccountUtils.getAccountsFromLocalStorage(mk)) ?? []);
    EvmWalletUtils.invalidateRebuildAccountsCache();
    const evmAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    reduxStore.dispatch(setAccounts(hiveAccounts));
    reduxStore.dispatch(setEvmAccounts(evmAccounts));
    await registerImportedEvmAccounts(evmAccounts, chain);
    if (hiveAccounts[0]) {
      await activateImportedHiveAccount(reduxStore, hiveAccounts[0]);
    } else if (chain?.type === ChainType.EVM && evmAccounts[0]) {
      await reduxStore.dispatch(
        loadEvmActiveAccount(chain as EvmChain, evmAccounts[0].wallet),
      );
    }
    reduxStore.dispatch(resetTitleContainerProperties());
    reduxStore.dispatch(setSuccessMessage('import_html_success'));
    reduxStore.dispatch(navigateTo(Screen.HOME_PAGE, true));
    return true;
  }

  if (
    !(typeof message.value === 'string') &&
    message.value?.success &&
    message.value?.accountType === 'evm'
  ) {
    EvmWalletUtils.invalidateRebuildAccountsCache();
    const evmAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    reduxStore.dispatch(setEvmAccounts(evmAccounts));
    await registerImportedEvmAccounts(evmAccounts, chain);
    if (chain?.type === ChainType.EVM && evmAccounts[0]) {
      await reduxStore.dispatch(
        loadEvmActiveAccount(chain as EvmChain, evmAccounts[0].wallet),
      );
    }
    reduxStore.dispatch(resetTitleContainerProperties());
    reduxStore.dispatch(setSuccessMessage('import_html_success'));
    reduxStore.dispatch(navigateTo(Screen.HOME_PAGE, true));
    return true;
  }

  if (
    !(typeof message.value === 'string') &&
    message.value?.accountType !== 'evm' &&
    message.value?.accounts?.length
  ) {
    reduxStore.dispatch(setAccounts(message.value.accounts));
    reduxStore.dispatch(resetTitleContainerProperties());
    await activateImportedHiveAccount(reduxStore, message.value.accounts[0]);
    reduxStore.dispatch(setSuccessMessage('import_html_success'));
    reduxStore.dispatch(navigateTo(Screen.HOME_PAGE, true));
    return true;
  }

  reduxStore.dispatch(setErrorMessage(getImportErrorMessage(message.value)));
  return true;
};

const startImportAccountsFromFile = (
  reduxStore: ImportAccountsStore,
): void => {
  const onSentBackAccountsListener = async (
    backgroundMessage: BackgroundMessage,
  ) => {
    if (
      backgroundMessage.command !==
      BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS
    ) {
      return;
    }

    chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    await applyImportedAccountsMessage(backgroundMessage, reduxStore);
  };

  chrome.runtime.onMessage.addListener(onSentBackAccountsListener);

  if (ExtensionSurfaceUtils.isSidePanelPage()) {
    openSidePanelFilePicker();
    return;
  }

  openImportAccountsWindow();
};

const ImportAccountsFileUtils = {
  startImportAccountsFromFile,
  applyImportedAccountsMessage,
};

export default ImportAccountsFileUtils;
