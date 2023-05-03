import { ExtendedAccount } from '@hiveio/dhive';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { loadCurrencyPrices } from '@popup/actions/currency-prices.actions';
import { resetTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ActionsSectionComponent } from '@popup/pages/app-container/home/actions-section/actions-section.component';
import { EstimatedAccountValueSectionComponent } from '@popup/pages/app-container/home/estimated-account-value-section/estimated-account-value-section.component';
import { GovernanceRenewalComponent } from '@popup/pages/app-container/home/governance-renewal/governance-renewal.component';
import { ResourcesSectionComponent } from '@popup/pages/app-container/home/resources-section/resources-section.component';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { TopBarComponent } from '@popup/pages/app-container/home/top-bar/top-bar.component';
import { ProposalVotingSectionComponent } from '@popup/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component';
import { WalletInfoSectionComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { SurveyComponent } from '@popup/pages/app-container/survey/survey.component';
import { Survey } from '@popup/pages/app-container/survey/survey.interface';
import { WhatsNewComponent } from '@popup/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';
import {
  WrongKeyPopupComponent,
  WrongKeysOnUser,
} from '@popup/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { SurveyUtils } from 'src/utils/survey.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';
import './home.component.scss';

const Home = ({
  activeAccount,
  accounts,
  activeRpc,
  refreshActiveAccount,
  resetTitleContainerProperties,
}: PropsFromRedux) => {
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [governanceAccountsToExpire, setGovernanceAccountsToExpire] = useState<
    string[]
  >([]);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();
  const [displayWrongKeyPopup, setDisplayWrongKeyPopup] = useState<
    WrongKeysOnUser | undefined
  >(); //TODO add types

  useEffect(() => {
    resetTitleContainerProperties();

    if (!ActiveAccountUtils.isEmpty(activeAccount)) {
      refreshActiveAccount();
    }
    initWhatsNew();
    initSurvey();
    //to clear //TODO remove
    //testing
    // resetNoKeyCheck();
    //end testing
    initCheckKeysOnAccounts(accounts);
  }, []);

  useEffect(() => {
    if (activeRpc && activeRpc.uri !== 'NULL')
      initGovernanceExpirationReminder(
        accounts
          .filter((localAccount: LocalAccount) => localAccount.keys.active)
          .map((localAccount: LocalAccount) => localAccount.name),
      );
  }, [activeRpc]);

  const initGovernanceExpirationReminder = async (accountNames: string[]) => {
    const accountsToRemind = await GovernanceUtils.getGovernanceReminderList(
      accountNames,
    );
    setGovernanceAccountsToExpire(accountsToRemind);
  };

  const initSurvey = async () => {
    setSurveyToDisplay(await SurveyUtils.getSurvey());
  };

  const initWhatsNew = async () => {
    const lastVersionSeen = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
    );

    if (!lastVersionSeen) {
      WhatsNewUtils.saveLastSeen();
      return;
    }

    const versionLog = await VersionLogUtils.getLastVersion();
    const extensionVersion = chrome.runtime
      .getManifest()
      .version.split('.')
      .splice(0, 2)
      .join('.');
    if (
      extensionVersion !== lastVersionSeen &&
      versionLog?.version === extensionVersion
    ) {
      setWhatsNewContent(versionLog);
      setDisplayWhatsNew(true);
    }
  };

  const initCheckKeysOnAccounts = async (localAccounts: LocalAccount[]) => {
    const extendedAccountsList = await AccountUtils.getExtendedAccounts(
      localAccounts.map((acc) => acc.name!),
    );
    let foundWrongKey: any;
    try {
      //TODO to properly test, add localAccounts using localstorage from vm console
      // //change key here
      // const indexToUpdate1 = extendedAccountsList.findIndex(
      //   (extAccount) => extAccount.name === 'keychain.tests',
      // );
      // extendedAccountsList[indexToUpdate1].active.key_auths[0][0] =
      //   '1989879823u1i';
      // extendedAccountsList[indexToUpdate1].posting.key_auths[0][0] =
      //   '1989879823u1i';
      // //end change

      let no_key_check = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.NO_KEY_CHECK,
      );
      console.log({ no_key_check }); //TODO to remove
      if (!no_key_check) no_key_check = { [localAccounts[0].name!]: [] };

      for (let i = 0; i < extendedAccountsList.length; i++) {
        const accountName = localAccounts[i].name!;
        const keys = localAccounts[i].keys;
        foundWrongKey = { [accountName]: [] };
        if (!no_key_check.hasOwnProperty(accountName)) {
          no_key_check = { ...no_key_check, [accountName]: [] };
        }
        for (const [key, value] of Object.entries(keys)) {
          if (key.includes('Pubkey') && !String(value).includes('@')) {
            const keyType = key.split('Pubkey')[0];
            addWrongKeyIfMissing(
              keyType as KeychainKeyTypesLC,
              accountName,
              value,
              extendedAccountsList[i],
              foundWrongKey,
              no_key_check,
            );
          }
        }
        if (foundWrongKey[accountName].length > 0) {
          setDisplayWrongKeyPopup(foundWrongKey);
          break;
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  };

  const addWrongKeyIfMissing = (
    keyType: KeychainKeyTypesLC,
    accountName: string,
    value: string,
    extendedAccountsListItem: ExtendedAccount,
    foundWrongKey: WrongKeysOnUser,
    no_key_check: any,
  ) => {
    if (
      keyType === KeychainKeyTypesLC.active ||
      keyType === KeychainKeyTypesLC.posting
    ) {
      if (
        !extendedAccountsListItem[keyType].key_auths.find(
          (keyAuth) => keyAuth[0] === value,
        ) &&
        !no_key_check[accountName].find(
          (keyName: string) => keyName === keyType,
        )
      ) {
        foundWrongKey[accountName].push(keyType);
      }
    } else if (keyType === KeychainKeyTypesLC.memo) {
      if (
        extendedAccountsListItem['memo_key'] !== value &&
        !no_key_check[accountName].find(
          (keyName: string) => keyName === keyType,
        )
      ) {
        foundWrongKey[accountName].push(keyType);
      }
    }
  };

  //just for testing //TODO to remove
  const resetNoKeyCheck = () =>
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.NO_KEY_CHECK,
      null,
    );
  //end just for testing

  const renderPopup = (
    displayWhatsNew: boolean,
    governanceAccountsToExpire: string[],
    surveyToDisplay: Survey | undefined,
    displayWrongKeyPopup: WrongKeysOnUser | undefined,
  ) => {
    if (displayWhatsNew) {
      return (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      );
    } else if (governanceAccountsToExpire.length > 0) {
      return (
        <GovernanceRenewalComponent accountNames={governanceAccountsToExpire} />
      );
    } else if (surveyToDisplay) {
      return <SurveyComponent survey={surveyToDisplay} />;
    } else if (displayWrongKeyPopup) {
      return (
        <WrongKeyPopupComponent
          displayWrongKeyPopup={displayWrongKeyPopup}
          setDisplayWrongKeyPopup={setDisplayWrongKeyPopup}
        />
      );
    }
  };

  return (
    <div className="home-page">
      {activeRpc && activeRpc.uri !== 'NULL' && (
        <div aria-label="home-page-component">
          <TopBarComponent />
          <SelectAccountSectionComponent />
          <ResourcesSectionComponent />
          <EstimatedAccountValueSectionComponent />
          <WalletInfoSectionComponent />
          <ActionsSectionComponent />
          <ProposalVotingSectionComponent />
        </div>
      )}

      {renderPopup(
        displayWhatsNew,
        governanceAccountsToExpire,
        surveyToDisplay,
        displayWrongKeyPopup,
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
  loadCurrencyPrices,
  refreshActiveAccount,
  resetTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
