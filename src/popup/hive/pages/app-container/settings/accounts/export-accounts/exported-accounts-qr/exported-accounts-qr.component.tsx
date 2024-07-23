import AccountUtils from '@popup/hive/utils/account.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

export const QR_CONTENT_PREFIX = 'keychain://add_accounts=';

const ExportedAccountsQR = ({
  setTitleContainerProperties,
  activeAccount,
  localAccounts,
  navigateTo,
}: PropsFromRedux) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [accountsDataQR, setaccountsDataQR] = useState<
    {
      data: string;
      index: number;
      total: number;
    }[]
  >([]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_exported_accounts_QR',
      isBackButtonEnabled: true,
    });
    exportAllAccountsQR();
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const exportAllAccountsQR = () => {
    let tempAccountsDataQR: {
      data: string;
      index: number;
      total: number;
    }[] = [];
    let index = 0;
    for (let i = 0; i < localAccounts.length; i += 2) {
      index++;
      const tempLocalAccountsChunk = [...localAccounts].splice(i, 2);
      tempAccountsDataQR.push({
        data: JSON.stringify(
          tempLocalAccountsChunk.map((t) => AccountUtils.generateQRCode(t)),
        ),
        index,
        total: Math.ceil(localAccounts.length / 2),
      });
    }
    setaccountsDataQR(tempAccountsDataQR);
  };

  useEffect(() => {
    throttledRefresh(pageIndex, accountsDataQR);
  }, [pageIndex, accountsDataQR]);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (newPageIndex, newaccountsDataQR) => {
        if (newPageIndex === newaccountsDataQR.length - 1) {
          setPageIndex(0);
        } else {
          setPageIndex((newPageIndex) => newPageIndex + 1);
        }
      },
      2000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  const closePage = () => {
    navigateTo(Screen.HOME_PAGE, true);
  };

  const encode = (value: string) => {
    return btoa(value);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR}-page`}
      className="settings-exported-accounts-qr">
      {accountsDataQR.length > 0 && (
        <div className="qr-exported-item">
          <div>
            <div className="qr-code-disclaimer">
              <span>
                {chrome.i18n.getMessage(
                  'popup_html_qr_exported_set_disclaimer1',
                ) + ' '}
              </span>
              <span>{chrome.i18n.getMessage('popup_html_qr_disclaimer2')}</span>
            </div>
          </div>
          <div className="qr-code-container">
            <div ref={qrCodeRef}></div>
            <QRCode
              data-testid="qrcode"
              className="qrcode"
              size={300}
              value={`${QR_CONTENT_PREFIX}${encode(
                JSON.stringify(accountsDataQR[pageIndex]),
              )}`}
              bgColor="var(--qrcode-background-color)"
              fgColor="var(--qrcode-foreground-color)"
            />
          </div>
          <div className="button-container">
            <ButtonComponent
              dataTestId="button-next-page"
              type={ButtonType.IMPORTANT}
              label="popup_html_close"
              onClick={closePage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    localAccounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportedAccountsQRComponent = connector(ExportedAccountsQR);
