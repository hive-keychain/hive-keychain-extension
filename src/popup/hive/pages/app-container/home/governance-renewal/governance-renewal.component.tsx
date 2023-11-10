import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import { RootState } from 'src/popup/hive/store';
import { GovernanceUtils } from 'src/popup/hive/utils/governance.utils';

interface GovernanceRenewalProps {
  accountNames: string[];
}

interface AccountsSelected {
  [username: string]: boolean;
}

const GovernanceRenewal = ({
  accountNames,
  accounts,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux & GovernanceRenewalProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<AccountsSelected>();
  const [hasAccountsSelected, setHasAccountsSelected] = useState<boolean>(true);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    const select: AccountsSelected = {};
    for (const accountName of accountNames) {
      select[accountName] = true;
    }
    setSelectedAccounts(select);
  }, []);

  const toggleAccount = (accountName: string) => {
    const newValue = {
      ...selectedAccounts,
      [accountName]: !selectedAccounts![accountName],
    };
    setSelectedAccounts(newValue as AccountsSelected);
    setHasAccountsSelected(
      Object.values(newValue).some((value) => value === true),
    );
  };

  const handleSubmitButton = async () => {
    const usernamesToRenew = Object.keys(selectedAccounts!).filter(
      (username) => selectedAccounts![username] === true,
    );
    const usernamesToIgnore = Object.keys(selectedAccounts!).filter(
      (username) => selectedAccounts![username] === false,
    );
    if (usernamesToRenew.length > 0) {
      addToLoadingList('html_popup_governance_renewing');
      await GovernanceUtils.renewUsersGovernance(usernamesToRenew, accounts);
      removeFromLoadingList('html_popup_governance_renewing');
    }

    if (usernamesToIgnore.length > 0) {
      await GovernanceUtils.addToIgnoreRenewal(usernamesToIgnore);
    }

    setForceHide(true);
  };

  const navigateToArticle = () => {
    chrome.tabs.create({
      url: 'https://peakd.com/hive/@hiveio/hive-hardfork-25-is-on-the-way-hive-to-reach-equilibrium-on-june-30th-2021#governance-expiration',
    });
  };

  return (
    <PopupContainer
      className={`governance-renewal ${forceHide ? 'force-hide' : ''}`}>
      <div className="popup-title">
        {chrome.i18n.getMessage('html_popup_governance_renewal_title')}
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(
            'html_popup_governance_renewal_introduction',
          ),
        }}></div>
      {selectedAccounts && (
        <div className="list">
          {accountNames.map((name) => (
            <CheckboxComponent
              key={name}
              checked={selectedAccounts[name]}
              onChange={() => toggleAccount(name)}
              title={`@${name}`}
              skipTranslation
            />
          ))}
        </div>
      )}
      <a className="read-more-link" onClick={() => navigateToArticle()}>
        {chrome.i18n.getMessage('html_popup_governance_expiration_read_more')}
      </a>
      <div className="popup-footer">
        <ButtonComponent
          label={
            hasAccountsSelected
              ? 'html_popup_governance_renew'
              : 'html_popup_governance_ignore'
          }
          onClick={() => handleSubmitButton()}
        />
      </div>
    </PopupContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GovernanceRenewalComponent = connector(GovernanceRenewal);
