import { BackgroundMessage } from '@background/background-message.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  ConnectDisconnectMessage,
  MultisigAccountConfig,
} from '@interfaces/multisig.interface';
import { setErrorMessage } from '@popup/hive/actions/message.actions';
import HiveUtils from '@popup/hive/utils/hive.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';

const defaultConfig: MultisigAccountConfig = {
  isEnabled: false,
  active: { isEnabled: false, publicKey: '', message: '' },
  posting: { isEnabled: false, publicKey: '', message: '' },
};

const Multisig = ({
  activeAccount,
  accounts,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const [multisigAccountConfig, setMultisigAccountConfig] =
    useState<MultisigAccountConfig>(defaultConfig);

  const [localAccount, setLocalAccount] = useState<LocalAccount>();
  const [isActiveLedger, setIsActiveLedger] = useState(false);
  const [isPostingLedger, setIsPostingLedger] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_multisig',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    init();
  }, [activeAccount]);

  const init = async () => {
    const multisigAccountConfig = await MultisigUtils.getMultisigAccountConfig(
      activeAccount.name!,
    );
    setMultisigAccountConfig(multisigAccountConfig ?? defaultConfig);
    setLocalAccount(
      accounts.find((account) => account.name === activeAccount.name!),
    );
    if (activeAccount.keys.active) {
      setIsActiveLedger(KeysUtils.isUsingLedger(activeAccount.keys.active));
    }
    if (activeAccount.keys.posting) {
      setIsPostingLedger(KeysUtils.isUsingLedger(activeAccount.keys.posting));
    }
  };

  const saveMultisigEnabled = async (isEnabled: boolean) => {
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
    await MultisigUtils.saveMultisigConfig(activeAccount.name!, newConfig);
    if (!isEnabled) {
      notifyBackground({
        account: activeAccount.name!,
        connect: isEnabled,
      });
    }
  };

  const saveMultisigEnabledActive = async (isEnabled: boolean) => {
    let message: string = '';
    let publicKey: string = '';

    if (isEnabled) {
      message = HiveUtils.signMessage(
        activeAccount.name!,
        localAccount?.keys.active!,
      );
      publicKey = localAccount?.keys.activePubkey!;
    }

    const newConfig: MultisigAccountConfig = {
      ...multisigAccountConfig!,
      active: { isEnabled: isEnabled, message: message, publicKey: publicKey },
    };

    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(activeAccount.name!, newConfig);
    notifyBackground({
      account: activeAccount.name!,
      connect: isEnabled,
      publicKey: multisigAccountConfig.active.publicKey,
      message: multisigAccountConfig.active.message,
    });
  };

  const saveMultisigEnabledPosting = async (isEnabled: boolean) => {
    let message: string = '';
    let publicKey: string = '';

    if (isEnabled) {
      message = HiveUtils.signMessage(
        activeAccount.name!,
        localAccount?.keys.posting!,
      );
      publicKey = localAccount?.keys.postingPubkey!;
    }

    const newConfig: MultisigAccountConfig = {
      ...multisigAccountConfig!,
      posting: { isEnabled: isEnabled, message: message, publicKey: publicKey },
    };
    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(activeAccount.name!, newConfig);
    notifyBackground({
      account: activeAccount.name!,
      connect: isEnabled,
      publicKey: multisigAccountConfig.posting.publicKey,
      message: multisigAccountConfig.posting.message,
    });
  };

  const notifyBackground = (message: ConnectDisconnectMessage) => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.MULTISIG_REFRESH_CONNECTIONS,
      value: message,
    } as BackgroundMessage);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_MULTISIG}-page`}
      className="multisig-config-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_multisig_intro')}
      </div>

      <SelectAccountSectionComponent fullSize background="white" />

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
              {activeAccount.keys.active && (
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
              {activeAccount.keys.posting && (
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
  return { accounts: state.accounts, activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MultisigComponent = connector(Multisig);
