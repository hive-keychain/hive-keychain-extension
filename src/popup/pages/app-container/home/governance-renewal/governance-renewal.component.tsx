import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import './governance-renewal.component.scss';

interface GovernanceRenewalProps {
  accountNames: string[];
}

interface AccountsSelected {
  [username: string]: boolean;
}

const GovernanceRenewal = ({
  accountNames,
}: PropsFromRedux & GovernanceRenewalProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<AccountsSelected>();

  useEffect(() => {
    const select: AccountsSelected = {};
    for (const accountName of accountNames) {
      select[accountName] = true;
    }
    setSelectedAccounts(select);
  }, []);

  const toggleAccount = (accountName: string) => {
    setSelectedAccounts({
      ...selectedAccounts,
      [accountName]: !selectedAccounts![accountName],
    } as AccountsSelected);
  };

  return (
    <div className="governance-renewal">
      <div className="title">
        {chrome.i18n.getMessage('html_popup_governance_renewal_title')}
      </div>
      <div className="introduction">
        {chrome.i18n.getMessage('html_popup_governance_renewal_introduction')}
      </div>
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
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GovernanceRenewalComponent = connector(GovernanceRenewal);
