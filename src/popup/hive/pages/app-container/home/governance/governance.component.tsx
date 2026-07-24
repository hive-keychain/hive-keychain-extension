import { LocalAccount } from '@interfaces/local-account.interface';
import { Witness } from '@interfaces/witness.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import ActiveAccountUtils from '@popup/hive/utils/active-account.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { KeychainApi } from 'src/api/keychain';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { Tab, TabsComponent } from 'src/common-ui/tabs/tabs.component';
import { MyWitnessTabComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/my-witness-tab.component';
import { ProposalTabComponent } from 'src/popup/hive/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from 'src/popup/hive/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessTabComponent } from 'src/popup/hive/pages/app-container/home/governance/witness-tab/witness-tab.component';

type HiveAccountOption = OptionItem & {
  value: string;
};

const Governance = ({
  setTitleContainerProperties,
  setErrorMessage,
  activeAccount,
  accounts,
  loadActiveAccount,
}: PropsFromRedux) => {
  const [isLoading, setIsLoading] = useState(true);

  const [tabs, setTabs] = useState<Tab[]>([]);
  const activeHiveUsername = activeAccount.name ?? activeAccount.account.name;
  const [selectedHiveAccountName, setSelectedHiveAccountName] =
    useState<string>();
  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedHiveAccountName,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initSelectedHiveAccount = async () => {
      if (accounts.length === 0) return;

      const lastActiveAccountName =
        await ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
      if (isCancelled) return;

      const fallbackAccountName =
        accounts.find((account) => account.name === activeHiveUsername)?.name ??
        accounts[0].name;
      const selectedAccountName =
        accounts.find((account) => account.name === lastActiveAccountName)
          ?.name ?? fallbackAccountName;

      setSelectedHiveAccountName((currentAccountName) =>
        currentAccountName &&
        accounts.some((account) => account.name === currentAccountName)
          ? currentAccountName
          : selectedAccountName,
      );
    };

    initSelectedHiveAccount();

    return () => {
      isCancelled = true;
    };
  }, [accounts, activeHiveUsername]);

  useEffect(() => {
    if (!selectedHiveAccountName) return;
    if (activeHiveUsername === selectedHiveAccountName) return;

    const selectedLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === selectedHiveAccountName,
    );
    if (!selectedLocalAccount) return;

    setTabs([]);
    setIsLoading(true);
    loadActiveAccount(selectedLocalAccount);
  }, [accounts, activeHiveUsername, loadActiveAccount, selectedHiveAccountName]);

  useEffect(() => {
    if (!selectedHiveAccountName) return;
    if (activeHiveUsername !== selectedHiveAccountName) return;

    init();
  }, [activeHiveUsername, selectedHiveAccountName]);

  const handleGovernanceAccountSelected = (accountName: string) => {
    if (accountName === selectedHiveAccountName) {
      return;
    }
    setSelectedHiveAccountName(accountName);
    setTabs([]);
    setIsLoading(true);
  };

  const init = async () => {
    let requestResult;
    requestResult = await KeychainApi.get('hive/v2/witnesses-ranks');
    const ranking: Witness[] = requestResult;
    let hasError = false;
    if (!requestResult || requestResult.length === 0) {
      hasError = true;
      setErrorMessage('popup_html_error_retrieving_witness_ranking');
    }
    const tempTabs: Tab[] = [
      {
        title: 'popup_html_witness',
        content: (
          <WitnessTabComponent
            key={`witness-${activeHiveUsername}`}
            ranking={ranking}
            hasError={hasError}
          />
        ),
      },
      {
        title: 'popup_html_proxy',
        content: <ProxyTabComponent key={`proxy-${activeHiveUsername}`} />,
      },
      {
        title: 'popup_html_proposal',
        content: <ProposalTabComponent key={`proposal-${activeHiveUsername}`} />,
      },
    ];
    if (
      ranking &&
      ranking.length > 0 &&
      ranking.find((witness) => witness.name === activeHiveUsername) !==
        undefined
    ) {
      tempTabs.push({
        title: 'popup_html_my_witness_page',
        content: (
          <MyWitnessTabComponent
            key={`my-witness-${activeHiveUsername}`}
            ranking={ranking}
          />
        ),
      });
    }
    setTabs(tempTabs);

    setIsLoading(false);
  };

  return (
    <div
      className="governance-page"
      aria-label="governance-page"
      data-testid={`${HiveScreen.GOVERNANCE_PAGE}-page`}>
      {selectedAccountOption && (
        <div className="settings-hive-account-select-panel">
          <ComplexeCustomSelect
            options={accountOptions}
            selectedItem={selectedAccountOption}
            setSelectedItem={(option) =>
              handleGovernanceAccountSelected(option.value)
            }
            background="white"
          />
        </div>
      )}
      {!isLoading && <TabsComponent tabs={tabs} />}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    accounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  loadActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GovernanceComponent = connector(Governance);
