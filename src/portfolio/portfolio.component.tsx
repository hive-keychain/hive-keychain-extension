import { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const PortfolioComponent = () => {
  const [theme, setTheme] = useState<Theme>();
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);
    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
    const mk = await LocalStorageUtils.getValueFromSessionStorage(
      LocalStorageKeyEnum.__MK,
    );
    let localAccounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    if (!localAccounts) {
      //TODO setMessage using "no_account_found_on_ledger_error"
    } else {
      setLocalAccounts(localAccounts);
      setExtendedAccountsList(
        await AccountUtils.getExtendedAccounts(
          localAccounts.map((localAcc) => localAcc.name),
        ),
      );
    }
    setIsLoading(false);
  };

  return (
    <div className={`theme ${theme} portfolio`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage('portfolio')}</div>
      </div>
      {!isLoading && (
        <div className="portfolio-accounts-panel">
          <div className="title">Your Accounts</div>
          <div className="info-row">
            <div className="label">Account</div>
            <div className="label">HP</div>
            <div className="label">HBD</div>
            <div className="label">HIVE</div>
          </div>
          {extendedAccountsList.map((acc, index) => {
            return (
              <div key={`${acc.name}-${index}`} className="info-row">
                <div className="label">@{acc.name}</div>
                <div className="value">{acc.vesting_balance}</div>
                <div className="value">{acc.savings_hbd_balance}</div>
                <div className="value">{acc.balance}</div>
              </div>
            );
          })}
        </div>
      )}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

export default PortfolioComponent;
