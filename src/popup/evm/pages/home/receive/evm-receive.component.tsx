import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

const ADDRESS_PREFIX_LENGTH = 2;
const HIGHLIGHTED_ADDRESS_LENGTH = 5;

const normalizeExplorerUrl = (url: string) => url.replace(/\/+$/, '');

const renderHighlightedAddress = (address: string) => {
  if (!address.startsWith('0x') || address.length <= ADDRESS_PREFIX_LENGTH) {
    return <strong>{address}</strong>;
  }

  const addressWithoutPrefix = address.slice(ADDRESS_PREFIX_LENGTH);
  const firstSegment = addressWithoutPrefix.slice(
    0,
    HIGHLIGHTED_ADDRESS_LENGTH,
  );
  const middleSegment = addressWithoutPrefix.slice(
    HIGHLIGHTED_ADDRESS_LENGTH,
    -HIGHLIGHTED_ADDRESS_LENGTH,
  );
  const lastSegment = addressWithoutPrefix.slice(-HIGHLIGHTED_ADDRESS_LENGTH);

  return (
    <>
      <span>0x</span>
      <strong>{firstSegment}</strong>
      <span>{middleSegment}</span>
      <strong>{lastSegment}</strong>
    </>
  );
};

const getActiveEvmAccount = (
  accounts: EvmAccount[],
  activeAddress: string,
) => {
  return accounts.find(
    (account) =>
      account.wallet.address.toLowerCase() === activeAddress.toLowerCase(),
  );
};

const EvmReceive = ({
  activeAccount,
  accounts,
  chain,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const address = activeAccount.wallet?.address ?? activeAccount.address ?? '';
  const activeEvmAccount = useMemo(
    () => getActiveEvmAccount(accounts, address),
    [accounts, address],
  );
  const accountName = activeEvmAccount
    ? EvmAccountUtils.getAccountName(activeEvmAccount)
    : address;
  const blockExplorerAddressUrl = useMemo(() => {
    if (!chain.blockExplorer?.url) {
      return undefined;
    }
    if (!address) {
      return undefined;
    }
    return `${normalizeExplorerUrl(chain.blockExplorer.url)}/address/${address}`;
  }, [address, chain.blockExplorer?.url]);

  useEffect(() => {
    setTitleContainerProperties({
      title: accountName,
      skipTitleTranslation: true,
      isBackButtonEnabled: true,
    });
  }, [accountName, setTitleContainerProperties]);

  const handleCopyAddress = () => {
    void copyTextWithToast(address, COPY_GENERIC_MESSAGE_KEY);
  };

  const handleViewOnBlockExplorer = () => {
    if (!blockExplorerAddressUrl) {
      return;
    }
    chrome.tabs.create({ url: blockExplorerAddressUrl });
  };

  return (
    <div className="evm-receive-page" data-testid="evm-receive-page">
      <div className="evm-receive-panel">
        <div className="evm-receive-account">
          <div className="evm-receive-chain">
            <ChainLogo
              chainName={chain.name}
              logoUri={chain.logo}
              className="evm-receive-chain-inline-logo"
            />
            <span>{chain.name}</span>
          </div>
        </div>

        <button
          className="evm-receive-address-row"
          data-testid="evm-receive-copy-address"
          onClick={handleCopyAddress}>
          <span className="evm-receive-address">
            {renderHighlightedAddress(address)}
          </span>
          <SVGIcon
            className="evm-receive-copy-icon"
            icon={SVGIcons.EVM_ACCOUNT_COPY}
          />
        </button>

        <div className="evm-receive-qr-frame">
          <QRCode
            bgColor="#ffffff"
            fgColor="#111111"
            level="H"
            size={220}
            value={address}
            className="evm-receive-qr-code"
          />
          <div className="evm-receive-qr-logo">
            <ChainLogo
              chainName={chain.name}
              logoUri={chain.logo}
              className="evm-receive-chain-logo"
            />
          </div>
        </div>

        {blockExplorerAddressUrl && (
          <ButtonComponent
            additionalClass="evm-receive-explorer-button"
            height="small"
            label="popup_html_evm_receive_view_explorer"
            logo={SVGIcons.GLOBAL_ARROW_RIGHT}
            onClick={handleViewOnBlockExplorer}
            type={ButtonType.ALTERNATIVE}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmReceiveComponent = connector(EvmReceive);
