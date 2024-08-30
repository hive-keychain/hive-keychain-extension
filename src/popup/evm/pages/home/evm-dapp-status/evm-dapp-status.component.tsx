import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { RootState } from '@popup/multichain/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
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
import FormatUtils from 'src/utils/format.utils';

const EvmDappStatus = ({ active, accounts }: PropsFromRedux) => {
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
  }, [active.address, dapp]);

  const init = async () => {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    setDapp(activeTab);
  };

  const onAddressLoaded = async () => {
    if (!dapp || !active.address.length) return;
    const domain = FormatUtils.urlToDomain(dapp.url!);
    const connectedWallets = await EvmWalletUtils.getConnectedWallets(domain);
    const sortedConnectedWallets = [
      connectedWallets.find((e) => e === active.address),
      ...connectedWallets.filter((e) => e !== active.address),
    ];
    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_EVM_EVENT,
      value: {
        eventType: EvmEventName.ACCOUNT_CHANGED,
        args: sortedConnectedWallets,
      },
    } as BackgroundMessage);

    setConnectedWallets(connectedWallets);
    if (connectedWallets.includes(active.address)) {
      setStatus(DappStatusEnum.CONNECTED);
    } else if (connectedWallets.length) {
      setStatus(DappStatusEnum.OTHER_ACCOUNT_CONNECTED);
    } else {
      setStatus(DappStatusEnum.DISCONNECTED);
    }
  };
  const connectedAccounts = accounts.filter((account) =>
    connectedWallets.includes(account.wallet.address),
  );
  const unconnectedAccounts = accounts.filter(
    (account) => !connectedWallets.includes(account.wallet.address),
  );
  return (
    <>
      <DappStatusComponent
        imageUrl={dapp?.favIconUrl}
        onClick={() => setShowDetail(true)}
        status={status}
      />
      {showDetail && (
        <PopupContainer
          className="dapp-status-details"
          onClickOutside={() => setShowDetail(false)}>
          <div className="dapp-status-wrapper">
            <div className="popup-title">
              <img src={dapp?.favIconUrl} />
              <p>{FormatUtils.urlToDomain(dapp?.url!)}</p>
              <SVGIcon
                icon={SVGIcons.TOP_BAR_CLOSE_BTN}
                onClick={() => setShowDetail(false)}
              />
            </div>
            <div className="caption">
              {chrome.i18n.getMessage('popup_html_evm_dapp_status_caption')}
            </div>
            {connectedAccounts.length ? (
              <div className="account-section-title">
                {chrome.i18n.getMessage(
                  'popup_html_evm_dapp_status_connected_accounts',
                )}
              </div>
            ) : null}
            {connectedAccounts.map((account) => (
              <div className="account-section-item">
                <EvmAccountDisplayComponent
                  account={account}
                  active={active}
                  status={
                    account.wallet.address === active.address
                      ? DappStatusEnum.CONNECTED
                      : DappStatusEnum.OTHER_ACCOUNT_CONNECTED
                  }
                />
                <SVGIcon
                  icon={SVGIcons.GLOBAL_ERROR}
                  className="account-section-icon"
                  onClick={async () => {
                    await EvmWalletUtils.disconnectWallet(
                      account.wallet.address,
                      FormatUtils.urlToDomain(dapp?.url!),
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
              <div className="account-section-item">
                <EvmAccountDisplayComponent
                  account={account}
                  active={active}
                  status={DappStatusEnum.DISCONNECTED}
                />
                <SVGIcon
                  icon={SVGIcons.GLOBAL_ADD_CIRCLE}
                  className="account-section-icon"
                  onClick={async () => {
                    await EvmWalletUtils.connectWallet(
                      account.wallet.address,
                      FormatUtils.urlToDomain(dapp?.url!),
                    );
                    onAddressLoaded();
                  }}
                />
              </div>
            ))}
          </div>
          {connectedAccounts.length ? (
            <div className="account-section-button-wrapper">
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="popup_html_evm_dapp_status_disconnect_all"
                onClick={async () => {
                  await EvmWalletUtils.disconnectAllWallets(
                    FormatUtils.urlToDomain(dapp?.url!),
                  );
                  onAddressLoaded();
                }}
              />
            </div>
          ) : null}
        </PopupContainer>
      )}
    </>
  );
};

const connector = connect((state: RootState) => {
  return {
    active: state.evm.activeAccount,
    accounts: state.evm.accounts,
  };
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmDappStatusComponent = connector(EvmDappStatus);
