import {
  loadActiveAccount,
  refreshActiveAccount,
} from '@popup/actions/active-account.actions';
import { loadCurrencyPrices } from '@popup/actions/currency-prices.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.actions';
import { resetTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ActionsSectionComponent } from '@popup/pages/app-container/home/actions-section/actions-section.component';
import { EstimatedAccountValueSectionComponent } from '@popup/pages/app-container/home/estimated-account-value-section/estimated-account-value-section.component';
import { ResourcesSectionComponent } from '@popup/pages/app-container/home/resources-section/resources-section.component';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { TopBarComponent } from '@popup/pages/app-container/home/top-bar/top-bar.component';
import { WalletInfoSectionComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { WhatsNewComponent } from '@popup/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import './home.component.scss';

const Home = ({
  activeAccount,
  loadActiveAccount,
  accounts,
  activeRpc,
  loadBittrexPrices,
  loadGlobalProperties,
  refreshActiveAccount,
  globalProperties,
  resetTitleContainerProperties,
}: PropsFromRedux) => {
  const [displayLoader, setDisplayLoader] = useState(false);
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  useEffect(() => {
    resetTitleContainerProperties();
    loadBittrexPrices();
    loadGlobalProperties();
    console.log(
      'ActiveAccountUtils.isEmpty(activeAccount): ,',
      ActiveAccountUtils.isEmpty(activeAccount),
    );
    if (!ActiveAccountUtils.isEmpty(activeAccount)) {
      console.log('Not empty lets refresh');
      refreshActiveAccount();
    }
    initWhatsNew();
  }, []);

  useEffect(() => {
    if (
      Object.keys(globalProperties).length > 0 &&
      !ActiveAccountUtils.isEmpty(activeAccount)
    ) {
      setTimeout(() => {
        setDisplayLoader(false);
      }, 1000);
    } else {
      setDisplayLoader(true);
    }
  }, [globalProperties, activeAccount]);

  useEffect(() => {
    if (ActiveAccountUtils.isEmpty(activeAccount) && accounts.length) {
      initActiveAccount();
    }
  }, []);

  const initWhatsNew = async () => {
    const lastVersionSeen = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
    );
    const versionLog = await VersionLogUtils.getLastVersion();
    const extensionVersion = chrome.runtime
      .getManifest()
      .version.split('.')
      .splice(0, 2)
      .join('.');
    if (
      extensionVersion !== lastVersionSeen &&
      versionLog.version === extensionVersion
    ) {
      console.log('loading whats new');
      console.log(
        'extensionVersion',
        extensionVersion,
        'lastVersionSeen',
        lastVersionSeen,
        'versionLog.version',
        versionLog.version,
      );
      setWhatsNewContent(versionLog);
      setDisplayWhatsNew(true);
    }
  };

  const initActiveAccount = async () => {
    const lastActiveAccountName =
      await ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
    const lastActiveAccount = accounts.find(
      (account: LocalAccount) => lastActiveAccountName === account.name,
    );
    loadActiveAccount(lastActiveAccount ? lastActiveAccount : accounts[0]);
  };

  return (
    <div className="home-page">
      {!displayLoader && activeRpc && activeRpc.uri !== 'NULL' && (
        <div aria-label="home-page-component">
          <TopBarComponent />
          <SelectAccountSectionComponent />
          <ResourcesSectionComponent />
          <EstimatedAccountValueSectionComponent />
          <WalletInfoSectionComponent />
          <ActionsSectionComponent />
        </div>
      )}

      {displayLoader && (
        <div className="loading">
          <RotatingLogoComponent></RotatingLogoComponent>
          <div className="caption">HIVE KEYCHAIN</div>
        </div>
      )}

      {!displayLoader && displayWhatsNew && (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts,
    activeRpc: state.activeRpc,
    globalProperties: state.globalProperties,
    isAppReady:
      Object.keys(state.globalProperties).length > 0 &&
      !ActiveAccountUtils.isEmpty(state.activeAccount),
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  loadBittrexPrices: loadCurrencyPrices,
  loadGlobalProperties,
  refreshActiveAccount,
  resetTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
