import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
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
    // const connectedWallets = await EvmWalletUtils.getConnectedWallets(domain);
    const connectedWallets = [
      '0xe5C4ff89560aa837E0Fa104116C332C7C3f56d63',
      '0x1898562227A3c955D64cE483811a13ffd68dd8AA',
    ];
    setConnectedWallets(connectedWallets);
    if (connectedWallets.includes(active.address)) {
      setStatus(DappStatusEnum.CONNECTED);
    } else if (connectedWallets.length) {
      setStatus(DappStatusEnum.OTHER_ACCOUNT_CONNECTED);
    } else {
      setStatus(DappStatusEnum.DISCONNECTED);
    }
  };

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
          <div className="popup-title">
            <img src={dapp?.favIconUrl} />
            {FormatUtils.urlToDomain(dapp?.url!)}
          </div>
          {accounts
            .filter((account) =>
              connectedWallets.includes(account.wallet.address),
            )
            .map((account) => (
              <EvmAccountDisplayComponent account={account} active={active} />
            ))}
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
