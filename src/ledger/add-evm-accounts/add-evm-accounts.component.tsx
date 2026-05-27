import { Theme } from '@popup/theme.context';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import {
  EvmAccount,
  EvmAccountSource,
  EvmLedgerDerivationMode,
} from '@popup/evm/interfaces/wallet.interface';
import {
  EvmLedgerUtils,
  EvmLedgerWalletWithBalance,
} from '@popup/evm/utils/evm-ledger.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { KeychainError } from 'src/keychain-error';
import { EvmChainUtils } from 'src/popup/evm/utils/evm-chain.utils';
import { EvmFormatUtils } from 'src/popup/evm/utils/evm-format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import VaultUtils from 'src/utils/vault.utils';

enum AddEvmAccountsFromLedgerStep {
  DISCOVER_ACCOUNTS = 'evm_add_accounts_from_ledger',
  SELECT_ACCOUNTS = 'select_account_from_ledger',
  FINISHED = 'add_accounts_from_ledger_finished',
}

const LEDGER_DERIVATION_MODES = [
  EvmLedgerDerivationMode.BIP44,
  EvmLedgerDerivationMode.LEDGER_LIVE,
  EvmLedgerDerivationMode.LEGACY,
];

const AddEvmAccountsComponent = () => {
  const [loading, setLoading] = useState(false);
  const [selectableAccounts, setSelectableAccounts] = useState<
    EvmLedgerWalletWithBalance[]
  >([]);
  const [selectedAccounts, setSelectedAccounts] = useState<
    EvmLedgerWalletWithBalance[]
  >([]);
  const [step, setStep] = useState(
    AddEvmAccountsFromLedgerStep.DISCOVER_ACCOUNTS,
  );
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<Theme>();
  const [chain, setChain] = useState<EvmChain>();
  const [localAccounts, setLocalAccounts] = useState<EvmAccount[]>([]);
  const [selectedDerivationMode, setSelectedDerivationMode] =
    useState<EvmLedgerDerivationMode>(EvmLedgerDerivationMode.BIP44);

  useEffect(() => {
    void init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);
    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);

    const queryParams = new URLSearchParams(window.location.search);
    const chainId = queryParams.get('chainId');
    const loadedChain = chainId
      ? await ChainUtils.getChain<EvmChain>(chainId)
      : await EvmChainUtils.getLastEvmChain();
    setChain(loadedChain);
    setLocalAccounts(await loadLocalAccounts());
  };

  const getErrorMessage = (error: any) => {
    if (error instanceof KeychainError) {
      return error.message;
    }
    return EvmLedgerUtils.parseLedgerError(error).message;
  };

  const loadLocalAccounts = async () => {
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    return mk ? await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk) : [];
  };

  const getLedgerPathMetadata = (accounts: EvmAccount[]) =>
    accounts
      .filter((account) => account.source === EvmAccountSource.LEDGER)
      .map((account) => ({
        path: account.path,
        derivationMode: account.derivationMode,
      }));

  const getStartIndex = (
    derivationMode: EvmLedgerDerivationMode = selectedDerivationMode,
    accounts: EvmAccount[] = localAccounts,
  ) =>
    EvmLedgerUtils.getNextDerivationIndex(
      getLedgerPathMetadata(accounts),
      derivationMode,
    );

  const filterFromExistingAccounts = (
    discoveredAccounts: EvmLedgerWalletWithBalance[],
    existingAccounts: EvmAccount[],
  ) => {
    const existingAddresses = existingAccounts.map((account) =>
      EvmWalletUtils.getAccountAddress(account).toLowerCase(),
    );

    return discoveredAccounts.filter(
      (account) =>
        !existingAddresses.includes(account.wallet.address.toLowerCase()),
    );
  };

  const selectDerivationMode = (derivationMode: EvmLedgerDerivationMode) => {
    setSelectedDerivationMode(derivationMode);
    setSelectableAccounts([]);
    setSelectedAccounts([]);
    setMessage('');
  };

  const discoverAccounts = async () => {
    if (!chain) return;

    setMessage('');
    setLoading(true);
    try {
      await EvmLedgerUtils.init(true);
      const refreshedLocalAccounts = await loadLocalAccounts();
      setLocalAccounts(refreshedLocalAccounts);
      const discoveredAccounts = await EvmLedgerUtils.discoverAccounts(chain, {
        derivationMode: selectedDerivationMode,
        startIndex: getStartIndex(
          selectedDerivationMode,
          refreshedLocalAccounts,
        ),
      });
      const filteredDiscoveredAccounts = filterFromExistingAccounts(
        discoveredAccounts,
        refreshedLocalAccounts,
      );

      setSelectableAccounts(filteredDiscoveredAccounts);
      setSelectedAccounts(
        filteredDiscoveredAccounts.filter((account) => account.selected),
      );

      if (filteredDiscoveredAccounts.length === 0) {
        setMessage(
          discoveredAccounts.length === 0
            ? 'no_account_found_on_ledger_error'
            : 'all_ledger_accounts_already_imported',
        );
        setStep(AddEvmAccountsFromLedgerStep.FINISHED);
        return;
      }
      setStep(AddEvmAccountsFromLedgerStep.SELECT_ACCOUNTS);
    } catch (error: any) {
      Logger.log(error);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = (account: EvmLedgerWalletWithBalance) => {
    if (isSelected(account)) {
      setSelectedAccounts((currentAccounts) =>
        currentAccounts.filter(
          (currentAccount) =>
            currentAccount.wallet.address !== account.wallet.address,
        ),
      );
    } else {
      setSelectedAccounts((currentAccounts) => [...currentAccounts, account]);
    }
  };

  const isSelected = (account: EvmLedgerWalletWithBalance) => {
    return selectedAccounts.some(
      (selectedAccount) =>
        selectedAccount.wallet.address === account.wallet.address,
    );
  };

  const processDiscoveredAccounts = async () => {
    if (!chain || selectedAccounts.length === 0) return;

    setLoading(true);
    try {
      const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
      if (!mk) {
        throw new Error('Missing master key');
      }
      await EvmWalletUtils.addLedgerAccounts(
        selectedAccounts.map((account) =>
          EvmLedgerUtils.toStoredLedgerAccount(account.wallet),
        ),
        mk,
        chrome.i18n.getMessage('ledger_source_name') || 'Ledger',
      );
      await Promise.all(
        selectedAccounts.map((account) =>
          EvmLightNodeUtils.registerAddress(
            chain.chainId,
            account.wallet.address,
            false,
          ),
        ),
      );
      setMessage('add_accounts_from_ledger_sucessful');
      setStep(AddEvmAccountsFromLedgerStep.FINISHED);
    } catch (error: any) {
      Logger.log(error);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getAccountTitle = (account: EvmLedgerWalletWithBalance) => {
    return `${EvmFormatUtils.formatAddress(account.wallet.address)} - ${
      account.balance
    } ${chain?.mainToken ?? ''}`;
  };

  const getAccountPathHint = (account: EvmLedgerWalletWithBalance) => {
    const derivationMode =
      account.wallet.derivationMode ??
      EvmLedgerUtils.getDerivationModeFromPath(account.wallet.path) ??
      EvmLedgerDerivationMode.BIP44;
    const derivationModeLabel = chrome.i18n.getMessage(
      EvmLedgerUtils.getDerivationModeLabelKey(derivationMode),
    );

    return chrome.i18n.getMessage('evm_ledger_account_path_hint', [
      derivationModeLabel,
      account.wallet.index.toString(),
      account.wallet.path,
    ]);
  };

  return (
    <div className={`theme ${theme} connect-ledger`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage(step)}</div>
      </div>

      {step === AddEvmAccountsFromLedgerStep.DISCOVER_ACCOUNTS && (
        <div className="account-discovery">
          <div className="caption">
            {chrome.i18n.getMessage('evm_ledger_account_discovery_caption')}
          </div>
          <div className="derivation-mode-selector">
            {LEDGER_DERIVATION_MODES.map((derivationMode) => (
              <button
                type="button"
                key={derivationMode}
                data-testid={`evm-ledger-derivation-${derivationMode}`}
                className={`derivation-mode-option ${
                  selectedDerivationMode === derivationMode ? 'selected' : ''
                }`}
                onClick={() => selectDerivationMode(derivationMode)}>
                <span>
                  {chrome.i18n.getMessage(
                    EvmLedgerUtils.getDerivationModeLabelKey(derivationMode),
                  )}
                </span>
                <span className="derivation-mode-start-index">
                  {chrome.i18n.getMessage('evm_ledger_derivation_next_index', [
                    getStartIndex(derivationMode).toString(),
                  ])}
                </span>
              </button>
            ))}
          </div>
          <div className="error">{chrome.i18n.getMessage(message)}</div>
          <div className="fill-space"></div>
          <ButtonComponent
            label="synchronize_ledger_button"
            onClick={discoverAccounts}
          />
        </div>
      )}

      {step === AddEvmAccountsFromLedgerStep.SELECT_ACCOUNTS && (
        <div className="select-accounts">
          <div className="caption">
            {chrome.i18n.getMessage('ledger_select_account_caption')}
          </div>
          <div className="list">
            {selectableAccounts.map((account) => (
              <CheckboxPanelComponent
                key={account.wallet.address}
                title={getAccountTitle(account)}
                skipTranslation
                checked={isSelected(account)}
                onChange={() => toggleAccount(account)}>
                <div className="ledger-account-path">
                  {getAccountPathHint(account)}
                </div>
              </CheckboxPanelComponent>
            ))}
          </div>
          <div className="fill-space"></div>
          <ButtonComponent
            label="ledger_select_accounts"
            onClick={processDiscoveredAccounts}
            disabled={selectedAccounts.length === 0}
          />
        </div>
      )}

      {step === AddEvmAccountsFromLedgerStep.FINISHED && (
        <>
          <div>{chrome.i18n.getMessage(message)}</div>
          <div className="fill-space"></div>
          <div className="bottom-button-panel">
            <ButtonComponent
              label="popup_html_close"
              onClick={() => window.close()}
              type={ButtonType.IMPORTANT}
            />
          </div>
        </>
      )}

      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default AddEvmAccountsComponent;
