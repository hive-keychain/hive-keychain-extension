import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/dapp-status/dapp-status.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import FormatUtils from 'src/utils/format.utils';

const EvmDappStatus = ({ active }: PropsFromRedux) => {
  const [dapp, setDapp] = useState<chrome.tabs.Tab>();
  const [status, setStatus] = useState<DappStatusEnum>(
    DappStatusEnum.DISCONNECTED,
  );
  const [showDetail, setShowDetail] = useState(false);

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
    const connectedWallets: string[] = [];
    await EvmWalletUtils.getConnectedWallets(domain);
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
          <div
            className="caption"
            dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage(
                'html_popup_governance_renewal_introduction',
              ),
            }}></div>
        </PopupContainer>
      )}
    </>
  );
};

const connector = connect((state: RootState) => {
  return {
    active: state.evm.activeAccount,
  };
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmDappStatusComponent = connector(EvmDappStatus);
