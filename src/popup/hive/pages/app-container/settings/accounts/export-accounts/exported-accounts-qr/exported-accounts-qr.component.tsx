import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';

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
      data: LocalAccount[];
      index: number;
      total: number;
    }[]
  >([]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [check1, setCheck1] = useState<boolean>(false);
  const [check2, setCheck2] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_exported_accounts_QR',
      isBackButtonEnabled: true,
    });
    exportAllAccountsQR();
  }, []);

  useEffect(() => {
    document.onkeydown = function (e) {
      if (!showQR) return;
      switch (e.code) {
        case 'ArrowLeft': // left arrow pressed
          pageIndex === 0 ? null : movePrevious();
          break;

        case 'ArrowRight': // right arrow pressed
          pageIndex === accountsDataQR.length - 1 ? null : moveNext();
          break;
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    };
    return () => {
      document.onkeydown = null;
    };
  }, [pageIndex, accountsDataQR]);

  const exportAllAccountsQR = () => {
    let tempAccountsDataQR: {
      data: LocalAccount[];
      index: number;
      total: number;
    }[] = [];
    let index = 0;
    for (let i = 0; i < localAccounts.length; i += 2) {
      index++;
      const tempLocalAccountsChunk = [...localAccounts].splice(i, 2);
      tempAccountsDataQR.push({
        data: tempLocalAccountsChunk.map((t) =>
          AccountUtils.generateQRCode(t, false),
        ),
        index,
        total: Math.ceil(localAccounts.length / 2),
      });
    }
    setaccountsDataQR(tempAccountsDataQR);
  };

  const moveNext = () => {
    setPageIndex((newPageIndex) =>
      Math.min(newPageIndex + 1, accountsDataQR.length - 1),
    );
  };

  const movePrevious = () => {
    setPageIndex((newPageIndex) => Math.max(0, newPageIndex - 1));
  };

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
              <div>
                {chrome.i18n.getMessage(
                  'popup_html_qr_exported_set_disclaimer1',
                ) + ' '}
              </div>
              <div className="red">
                {chrome.i18n.getMessage('popup_html_qr_disclaimer2')}
              </div>
              <div>{chrome.i18n.getMessage('popup_html_qr_disclaimer3')}</div>
            </div>
          </div>
          {!showQR ? (
            <div>
              <CheckboxPanelComponent
                text="popup_html_qr_exported_check1"
                onChange={(checked) => {
                  setCheck1(checked);
                }}
                checked={check1}
              />
              <CheckboxPanelComponent
                text="popup_html_qr_exported_check2"
                onChange={(checked) => {
                  setCheck2(checked);
                }}
                checked={check2}
              />
              <div className="submit-button-container">
                <ButtonComponent
                  label="popup_html_qr_exported_show_button"
                  onClick={() => {
                    if (check1 && check2) setShowQR(true);
                  }}
                  type={ButtonType.IMPORTANT}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="qr-code-container">
                <div>
                  {accountsDataQR[pageIndex].index}/
                  {accountsDataQR[pageIndex].total} : @
                  {accountsDataQR[pageIndex].data
                    .map((e: LocalAccount) => e.name)
                    .join(', @')}
                </div>
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
              <div className="buttons-container">
                <ButtonComponent
                  label="popup_html_whats_new_previous"
                  onClick={movePrevious}
                  type={ButtonType.ALTERNATIVE}
                  additionalClass={`button-export-accounts-qr ${
                    pageIndex === 0 ? 'hidden' : ''
                  }`}
                />
                <ButtonComponent
                  label="popup_html_whats_new_next"
                  onClick={moveNext}
                  additionalClass={`button-export-accounts-qr ${
                    pageIndex === accountsDataQR.length - 1 ? 'hidden' : ''
                  }`}
                />
              </div>
            </div>
          )}
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
