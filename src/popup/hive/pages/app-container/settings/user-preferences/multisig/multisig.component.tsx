import { LocalAccount } from '@interfaces/local-account.interface';
import { MultisigAccountConfig } from '@interfaces/multisig.interface';
import HiveUtils from '@popup/hive/utils/hive.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
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
}: PropsFromRedux) => {
  const [multisigAccountConfig, setMultisigAccountConfig] =
    useState<MultisigAccountConfig>(defaultConfig);

  const [localAccount, setLocalAccount] = useState<LocalAccount>();

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
  };

  const saveMultisigEnabled = async (newValue: boolean) => {
    const newConfig = {
      ...multisigAccountConfig,
      isEnabled: newValue,
    };
    setMultisigAccountConfig(newConfig);
    await MultisigUtils.saveMultisigConfig(activeAccount.name!, newConfig);
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
              <CheckboxPanelComponent
                dataTestId="checkbox-multisig-active-key-enabled"
                title="popup_html_enable_active_key_multisig"
                checked={multisigAccountConfig?.active?.isEnabled || false}
                onChange={(newValue) => saveMultisigEnabledActive(newValue)}
              />
              <CheckboxPanelComponent
                dataTestId="checkbox-multisig-public-key-enabled"
                title="popup_html_enable_posting_key_multisig"
                checked={multisigAccountConfig?.posting?.isEnabled || false}
                onChange={(newValue) => saveMultisigEnabledPosting(newValue)}
              />
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MultisigComponent = connector(Multisig);
