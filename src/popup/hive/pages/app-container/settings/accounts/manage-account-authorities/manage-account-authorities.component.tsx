import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Screen } from '@interfaces/screen.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { AccountAuthoritiesListComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list.component';

type HiveAccountOption = OptionItem & {
  value: string;
};

const ManageAccountAuthorities = ({
  accounts,
  activeAccount,
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
  );
  const [managedAccount, setManagedAccount] = useState<
    ActiveAccount | undefined
  >();
  const [isLoadingManagedAccount, setIsLoadingManagedAccount] = useState(false);

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
      title: 'popup_html_account_authorities',
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
      setManagedAccount(undefined);
      return;
    }

    if (
      selectedAccountName === activeAccount.name &&
      activeAccount.account?.name === selectedAccountName
    ) {
      setManagedAccount(activeAccount);
      setIsLoadingManagedAccount(false);
      return;
    }

    let cancelled = false;

    const loadManagedAccount = async () => {
      setIsLoadingManagedAccount(true);
      const localAccount = accounts.find(
        (account) => account.name === selectedAccountName,
      );
      if (!localAccount) {
        if (!cancelled) {
          setManagedAccount(undefined);
          setIsLoadingManagedAccount(false);
        }
        return;
      }

      try {
        const [extendedAccount, rc] = await Promise.all([
          AccountUtils.getExtendedAccount(selectedAccountName),
          AccountUtils.getRCMana(selectedAccountName),
        ]);
        if (cancelled) {
          return;
        }
        setManagedAccount({
          name: selectedAccountName,
          keys: localAccount.keys,
          account: extendedAccount,
          rc,
        });
      } finally {
        if (!cancelled) {
          setIsLoadingManagedAccount(false);
        }
      }
    };

    void loadManagedAccount();

    return () => {
      cancelled = true;
    };
  }, [accounts, activeAccount, selectedAccountName]);

  return (
    <div
      className="settings-manage-account-authorities"
      data-testid={`${Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES}-page`}>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_manage_accounts_authorities_text')}
      </div>

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

      {isLoadingManagedAccount && <LoadingComponent />}
      {!isLoadingManagedAccount && managedAccount && (
        <AccountAuthoritiesListComponent managedAccount={managedAccount} />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccount: state.hive.activeAccount,
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountAuthoritiesComponent = connector(
  ManageAccountAuthorities,
);
