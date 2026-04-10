import { setAccountsForOrigin } from '@background/evm/evm-provider-state.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  getHostnameFromUrl,
  getOriginFromUrl,
} from 'src/utils/browser-origin.utils';
import Logger from 'src/utils/logger.utils';

const EvmDappStatus = ({ activeAccount, accounts }: PropsFromRedux) => {
  const [dapp, setDapp] = useState<chrome.tabs.Tab>();
  const [status, setStatus] = useState<DappStatusEnum>(
    DappStatusEnum.DISCONNECTED,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    onAddressLoaded();
  }, [activeAccount.address, dapp]);

  const init = async () => {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (activeTab?.url && activeTab.url.length > 0) setDapp(activeTab);
  };

  const getCurrentOrigin = () => {
    const origin = getOriginFromUrl(dapp?.url);
    if (!origin) {
      Logger.error("Can't find origin");
      return null;
    }

    return origin;
  };

  const onAddressLoaded = async () => {
    const origin = getCurrentOrigin();
    if (!origin || !activeAccount.address.length) {
      return;
    }

    const normalizedActiveAddress = activeAccount.address.toLowerCase();
    const connectedOriginWallets = await EvmWalletUtils.getConnectedWallets(
      origin,
    );

    setConnectedWallets(connectedOriginWallets);
    if (connectedOriginWallets.includes(normalizedActiveAddress)) {
      setStatus(DappStatusEnum.SELECTED);
    } else if (connectedOriginWallets.length) {
      setStatus(DappStatusEnum.CONNECTED);
    } else {
      setStatus(DappStatusEnum.DISCONNECTED);
    }
  };

  const connectedAccounts = accounts.filter((account) =>
    connectedWallets.includes(account.wallet.address.toLowerCase()),
  );
  const unconnectedAccounts = accounts.filter(
    (account) => !connectedWallets.includes(account.wallet.address.toLowerCase()),
  );

  if (!dapp?.url) return null;

  return (
    <div className="dapp-status-wrapper">
      <DappStatusComponent
        imageUrl={dapp?.favIconUrl}
        onClick={() => setShowDetail(true)}
        status={status}
      />
      {showDetail && (
        <PopupContainer
          className="dapp-status-details"
          onClickOutside={() => setShowDetail(false)}>
          <div className="dapp-status-details-wrapper">
            <div className="popup-title">
              <img src={dapp?.favIconUrl} />
              <div className="domain">{getHostnameFromUrl(dapp.url)}</div>
              <SVGIcon
                icon={SVGIcons.TOP_BAR_CLOSE_BTN}
                onClick={() => setShowDetail(false)}
              />
            </div>
            <div className="caption">
              {chrome.i18n.getMessage('popup_html_evm_dapp_status_caption')}
            </div>
            <div className="accounts-section">
              {connectedAccounts.length ? (
                <div className="account-section-title">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_dapp_status_connected_accounts',
                  )}
                </div>
              ) : null}
              {connectedAccounts.map((account) => (
                <div
                  className="account-section-item"
                  key={`connected-${account.wallet.address}`}>
                  <EvmAccountDisplayComponent
                    account={account}
                    activeAccount={activeAccount}
                    status={
                      account.wallet.address === activeAccount.address
                        ? DappStatusEnum.SELECTED
                        : DappStatusEnum.CONNECTED
                    }
                    fullName
                  />
                  <SVGIcon
                    icon={SVGIcons.GLOBAL_ERROR}
                    className="account-section-icon"
                    onClick={async () => {
                      const origin = getCurrentOrigin();
                      if (!origin) return;

                      await setAccountsForOrigin(
                        origin,
                        connectedWallets.filter(
                          (address) =>
                            address !== account.wallet.address.toLowerCase(),
                        ),
                      );
                      onAddressLoaded();
                    }}
                  />
                </div>
              ))}
              {unconnectedAccounts.length ? (
                <div className="account-section-title">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_dapp_status_other_accounts',
                  )}
                </div>
              ) : null}
              {unconnectedAccounts.map((account) => (
                <div
                  className="account-section-item"
                  key={`unconnected-${account.wallet.address}`}>
                  <EvmAccountDisplayComponent
                    account={account}
                    activeAccount={activeAccount}
                    status={DappStatusEnum.DISCONNECTED}
                    fullName
                  />
                  <SVGIcon
                    icon={SVGIcons.GLOBAL_ADD_CIRCLE}
                    className="account-section-icon"
                    onClick={async () => {
                      const origin = getCurrentOrigin();
                      if (!origin) return;

                      await setAccountsForOrigin(origin, [
                        ...connectedWallets,
                        account.wallet.address,
                      ]);
                      onAddressLoaded();
                    }}
                  />
                </div>
              ))}
            </div>
            {connectedAccounts.length > 0 && (
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="popup_html_evm_dapp_status_disconnect_all"
                onClick={async () => {
                  const origin = getCurrentOrigin();
                  if (!origin) return;

                  await setAccountsForOrigin(origin, []);
                  onAddressLoaded();
                }}
              />
            )}
          </div>
        </PopupContainer>
      )}
    </div>
  );
};

const connector = connect((state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    accounts: state.evm.accounts,
  };
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmDappStatusComponent = connector(EvmDappStatus);
