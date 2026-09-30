import {
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { BaseSyntheticEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  nft: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem;
  collection: EvmErc721Token | EvmErc721Token;
  expanded?: boolean;
  onClick?: () => void;
  nftSize?: 'small' | 'normal';
  children?: React.ReactNode;
}

const normalizeExplorerUrl = (url: string) => url.replace(/\/+$/, '');

const getNftContractExplorerUrl = (
  explorerBaseUrl: string | undefined,
  contractAddress: string,
): string | undefined => {
  if (!explorerBaseUrl) {
    return undefined;
  }
  return `${normalizeExplorerUrl(explorerBaseUrl)}/token/${contractAddress}`;
};

export const EvmNftDetailsView = ({
  nft,
  collection,
  expanded,
  onClick,
  nftSize,
  chain,
  children,
}: PropsFromRedux) => {
  const contractAddress = collection.tokenInfo.contractAddress;
  const contractExplorerUrl = getNftContractExplorerUrl(
    chain?.blockExplorer?.url,
    contractAddress,
  );
  const handleOnClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    if (onClick) onClick();
  };
  const copyContractAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
  };
  const openContractInBlockExplorer = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (!contractExplorerUrl) {
      return;
    }
    chrome.tabs.create({ url: contractExplorerUrl });
  };

  return (
    <div
      key={`${collection.tokenInfo.contractAddress}-${nft.id}`}
      className={`detailed-nft ${expanded ? 'expanded' : ''}`}
      onClick={handleOnClick}>
      <EvmNftMedia
        className={`${nftSize ?? 'normal'}`}
        src={nft.metadata.image}
      />
      <div className="name">
        {nft.metadata.name ?? `${collection.tokenInfo.name} #${nft.id}`}
      </div>
      {(nft as EvmErc1155TokenCollectionItem).balance > 1 && !expanded && (
        <div className="nft-balance">
          {(nft as EvmErc1155TokenCollectionItem).balance}
        </div>
      )}
      {expanded && (
        <>
          <div className="collection-name">{collection.tokenInfo.name}</div>
          <div className="label-value smart-contract-address">
            <div className="label">
              {I18nUtils.getMessage('evm_operation_smart_contract_address')}
            </div>
            <div className="value contract-address-value">
              <CustomTooltip
                message={contractAddress}
                skipTranslation
                additionalClassName="evm-address-tooltip">
                <span
                  className="contract-address"
                  data-testid={`nft-contract-address-${contractAddress}-${nft.id}`}>
                  {EvmFormatUtils.formatAddress(contractAddress)}
                </span>
              </CustomTooltip>
              <button
                type="button"
                className="contract-address-copy"
                aria-label={I18nUtils.getMessage('html_popup_copy')}
                data-testid={`nft-contract-copy-${contractAddress}-${nft.id}`}
                onClick={copyContractAddress}
                onKeyDown={(event) => event.stopPropagation()}>
                <SVGIcon icon={SVGIcons.SELECT_COPY} />
              </button>
              {contractExplorerUrl && (
                <CustomTooltip
                  message="portfolio_history_view_on_explorer"
                  position="top"
                  delayShow={300}>
                  <button
                    type="button"
                    className="contract-address-explorer"
                    aria-label={I18nUtils.getMessage(
                      'portfolio_history_view_on_explorer',
                    )}
                    data-testid={`nft-contract-explorer-${contractAddress}-${nft.id}`}
                    onClick={openContractInBlockExplorer}
                    onKeyDown={(event) => event.stopPropagation()}>
                    <SVGIcon icon={SVGIcons.GLOBAL_EXTERNAL_LINK} />
                  </button>
                </CustomTooltip>
              )}
            </div>
          </div>
          <div className="label-value smart-contract-address">
            <div className="label">
              {I18nUtils.getMessage('evm_nft_token_id')}
            </div>
            <div className="value">{nft.id}</div>
          </div>
          {(nft as EvmErc1155TokenCollectionItem)?.balance && (
            <div className="label-value smart-contract-address">
              <div className="label">
                {I18nUtils.getMessage('popup_html_balance')}
              </div>
              <div className="value">
                {(nft as EvmErc1155TokenCollectionItem)?.balance}
              </div>
            </div>
          )}
          <div className="label-value smart-contract-address">
            <div className="label">
              {I18nUtils.getMessage('evm_nft_token_type')}
            </div>
            <div className="value">{collection.tokenInfo.type}</div>
          </div>

          {!!nft.metadata.attributes &&
            nft.metadata.attributes.map((attribute) => (
              <div
                className="label-value smart-contract-address"
                key={`${collection.tokenInfo.contractAddress}-${nft.id}-${attribute.trait_type}`}>
                <div className="label">{attribute.trait_type}</div>
                <div className="value">
                  {typeof attribute.value === 'string'
                    ? attribute.value
                    : JSON.stringify(attribute.value)}
                </div>
              </div>
            ))}

          {children}
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const EvmNftDetails = connector(EvmNftDetailsView);
