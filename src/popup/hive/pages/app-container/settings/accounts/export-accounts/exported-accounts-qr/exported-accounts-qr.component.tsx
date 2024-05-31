import AccountUtils from '@popup/hive/utils/account.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useRef, useState } from 'react';
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
  let displayInterval: NodeJS.Timer;

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_exported_accounts_QR',
      isBackButtonEnabled: true,
    });
    exportAllAccountsQR();
    return () => {
      if (displayInterval) clearInterval(displayInterval);
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
      let chunkString = '';
      tempLocalAccountsChunk.map((t) => {
        chunkString += AccountUtils.generateQRCode(t);
      });
      tempAccountsDataQR.push({
        data: chunkString,
        index,
        total: localAccounts.length,
      });
    }
    setaccountsDataQR(tempAccountsDataQR);
    displayInterval = setInterval(() => {
      if (pageIndex === accountsDataQR.length - 1) {
        setPageIndex(0);
        return;
      }
      setPageIndex((prevPageIndex) => prevPageIndex + 1);
    }, 1000);
  };

  const closePage = () => {
    clearInterval(displayInterval);
    navigateTo(Screen.HOME_PAGE, true);
  };

  //   const handleNextQR = () => {
  //     if (pageIndex === accountsDataQR.length - 1) {
  //       setPageIndex(0);
  //       return;
  //     }
  //     setPageIndex((prevPageIndex) => prevPageIndex + 1);
  //   };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORTED_ACCOUNTS_QR}-page`}
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
              size={240}
              value={`${QR_CONTENT_PREFIX}${JSON.stringify(
                accountsDataQR[pageIndex],
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportedAccountsQRComponent = connector(ExportedAccountsQR);
