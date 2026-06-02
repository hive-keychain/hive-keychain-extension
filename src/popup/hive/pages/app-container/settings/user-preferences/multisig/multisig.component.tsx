import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  ConnectDisconnectMessage,
  MultisigAccountConfig,
} from '@interfaces/multisig.interface';
import { Screen } from '@interfaces/screen.interface';
import HiveUtils from '@popup/hive/utils/hive.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { CommunicationUtils } from 'src/utils/communication.utils';

const defaultConfig: MultisigAccountConfig = {
  isEnabled: false,
  active: { isEnabled: false, publicKey: '', message: '' },
  posting: { isEnabled: false, publicKey: '', message: '' },
};

type HiveAccountOption = OptionItem & {
  value: string;
};

const Multisig = ({
  accounts,
  activeAccountName,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
  );
  const [multisigAccountConfig, setMultisigAccountConfig] =
    useState<MultisigAccountConfig>(defaultConfig);

  const [localAccount, setLocalAccount] = useState<LocalAccount>();
  const [isActiveLedger, setIsActiveLedger] = useState(false);
  const [isPostingLedger, setIsPostingLedger] = useState(false);

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_multisig',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (!selectedAccountName && activeAccountName) {
      setSelectedAccountName(activeAccountName);
    }
  }, [activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (
      selectedAccountName &&
      accountOptions.some(
        (accountOption) => accountOption.value === selectedAccountName,
      )
    ) {
      return;
    }

    setSelectedAccountName(activeAccountName ?? accounts[0]?.name);
  }, [accounts, activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (!selectedAccountName) {
      return;
    }

    init(selectedAccountName);
  }, [selectedAccountName, accounts]);

  const init = async (accountName: string) => {
    const multisigAccountConfig = await MultisigUtils.getMultisigAccountConfig(
      accountName,
    );
    setMultisigAccountConfig(multisigAccountConfig ?? defaultConfig);
    const account = accounts.find(
      (localAccount) => localAccount.name === accountName,
    );
    setLocalAccount(account);
    if (account?.keys.active) {
      setIsActiveLedger(KeysUtils.isUsingLedger(account.keys.active));
    } else {
      setIsActiveLedger(false);
    }
    if (account?.keys.posting) {
      setIsPostingLedger(KeysUtils.isUsingLedger(account.keys.posting));
    } else {
      setIsPostingLedger(false);
    }
  };

  const saveMultisigEnabled = async (isEnabled: boolean) => {
    if (!selectedAccountName) {
      return;
    }

    if (!MultisigUtils.isMultisigCompatible()) {
      setErrorMessage('min_chrome_version');
      return;
    }
    const newConfig = {
      ...multisigAccountConfig,
      isEnabled: isEnabled,
      active: {
        ...multisigAccountConfig.active,
        isEnabled: false,
      },
      posting: {
        ...multisigAccountConfig.posting,
        isEnabled: false,
      },
    };
    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(selectedAccountName, newConfig);
    if (!isEnabled) {
      notifyBackground({
        account: selectedAccountName,
        connect: isEnabled,
      });
    }
  };

  const saveMultisigEnabledActive = async (isEnabled: boolean) => {
    if (!selectedAccountName) {
      return;
    }

    let message: string = '';
    let publicKey: string = '';

    if (isEnabled) {
      message = HiveUtils.signMessage(
        selectedAccountName,
        localAccount?.keys.active!,
      );
      publicKey = localAccount?.keys.activePubkey!;
    }

    const newConfig: MultisigAccountConfig = {
      ...multisigAccountConfig!,
      active: { isEnabled: isEnabled, message: message, publicKey: publicKey },
    };

    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(selectedAccountName, newConfig);
    notifyBackground({
      account: selectedAccountName,
      connect: isEnabled,
      publicKey: multisigAccountConfig.active.publicKey,
      message: multisigAccountConfig.active.message,
    });
  };

  const saveMultisigEnabledPosting = async (isEnabled: boolean) => {
    if (!selectedAccountName) {
      return;
    }

    let message: string = '';
    let publicKey: string = '';

    if (isEnabled) {
      message = HiveUtils.signMessage(
        selectedAccountName,
        localAccount?.keys.posting!,
      );
      publicKey = localAccount?.keys.postingPubkey!;
    }

    const newConfig: MultisigAccountConfig = {
      ...multisigAccountConfig!,
      posting: { isEnabled: isEnabled, message: message, publicKey: publicKey },
    };
    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(selectedAccountName, newConfig);
    notifyBackground({
      account: selectedAccountName,
      connect: isEnabled,
      publicKey: multisigAccountConfig.posting.publicKey,
      message: multisigAccountConfig.posting.message,
    });
  };

  const notifyBackground = (message: ConnectDisconnectMessage) => {
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.MULTISIG_REFRESH_CONNECTIONS,
      value: message,
    } as BackgroundMessage);
  };

  const hasActiveKey = !!localAccount?.keys.active;
  const hasPostingKey = !!localAccount?.keys.posting;

  return (
    <div
      data-testid={`${Screen.SETTINGS_MULTISIG}-page`}
      className="multisig-config-page">
      <div
        className="intro"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_multisig_intro'),
        }}
      />

      {selectedAccountOption && (
        <div className="settings-hive-account-select-panel">
          <ComplexeCustomSelect
            options={accountOptions}
            selectedItem={selectedAccountOption}
            setSelectedItem={(option) =>
              setSelectedAccountName(option.value)
            }
            background="white"
          />
        </div>
      )}

      {multisigAccountConfig && (
        <>
          <CheckboxPanelComponent
            dataTestId="checkbox-multisig-enabled"
            title="popup_html_enable_multisig"
            checked={multisigAccountConfig?.isEnabled}
            onChange={(newValue) => saveMultisigEnabled(newValue)}
            hint="popup_html_enable_multisig"
          />
          {multisigAccountConfig.isEnabled && (
            <>
              {hasActiveKey && (
                <CheckboxPanelComponent
                  dataTestId="checkbox-multisig-active-key-enabled"
                  title="popup_html_enable_active_key_multisig"
                  checked={multisigAccountConfig?.active?.isEnabled || false}
                  onChange={(newValue) => saveMultisigEnabledActive(newValue)}
                  disabled={isActiveLedger}
                  hint={
                    isActiveLedger ? 'multisig_key_is_ledger_hint' : undefined
                  }
                />
              )}
              {hasPostingKey && (
                <CheckboxPanelComponent
                  dataTestId="checkbox-multisig-public-key-enabled"
                  title="popup_html_enable_posting_key_multisig"
                  checked={multisigAccountConfig?.posting?.isEnabled || false}
                  onChange={(newValue) => saveMultisigEnabledPosting(newValue)}
                  disabled={isPostingLedger}
                  hint={
                    isPostingLedger ? 'multisig_key_is_ledger_hint' : undefined
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MultisigComponent = connector(Multisig);
