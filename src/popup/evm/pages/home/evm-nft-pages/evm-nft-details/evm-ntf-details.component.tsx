import {
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
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
  collection: EvmErc721Token;
  onSend?: () => void;
}

export const EvmNftDetailsView = ({
  nft,
  collection,
  onSend,
  chain,
}: PropsFromRedux) => {
  const contractAddress = collection.tokenInfo.contractAddress;
  const contractExplorerUrl = EvmNftDisplayUtils.getNftContractExplorerUrl(
    chain?.blockExplorer?.url,
    contractAddress,
  );
  const displayName = EvmNftDisplayUtils.getNftDisplayName(
    nft,
    collection.tokenInfo.name,
  );
  const collectionName = collection.tokenInfo.name?.trim();
  const isErc1155 = collection.tokenInfo.type === EVMSmartContractType.ERC1155;
  const ownedQuantity = EvmNftDisplayUtils.getNftOwnedQuantity(nft);
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
      className="nft-details"
      data-testid="nft-details"
      key={`${collection.tokenInfo.contractAddress}-${nft.id}`}>
      <div className="nft-details-body">
        <EvmNftMedia className="nft-details-hero" src={nft.metadata.image} />
        <div className="nft-details-title-row">
          <div className="nft-details-name">{displayName}</div>
          <div className="nft-details-standard">
            {EvmNftDisplayUtils.formatNftStandard(collection.tokenInfo.type)}
          </div>
        </div>
        {collectionName && (
          <div className="nft-details-collection">{collectionName}</div>
        )}
        <div className="nft-details-token-id">{`#${nft.id}`}</div>
        {isErc1155 && (
          <div className="nft-details-owned" data-testid="nft-owned-quantity">
            <span className="nft-owned-mark" aria-hidden="true" />
            {I18nUtils.getMessage('evm_nft_you_own', [String(ownedQuantity)])}
          </div>
        )}
        <div className="nft-details-meta">
            <div className="label-value smart-contract-address">
              <div className="label">
                {I18nUtils.getMessage('evm_nft_contract')}
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
                  onClick={copyContractAddress}>
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
                      onClick={openContractInBlockExplorer}>
                      <SVGIcon icon={SVGIcons.GLOBAL_EXTERNAL_LINK} />
                    </button>
                  </CustomTooltip>
                )}
              </div>
            </div>
            <div className="label-value">
              <div className="label">
                {I18nUtils.getMessage('evm_nft_token_id')}
              </div>
              <div className="value">{nft.id}</div>
            </div>
            <div className="label-value">
              <div className="label">
                {I18nUtils.getMessage('evm_nft_token_standard')}
              </div>
              <div className="value">
                {EvmNftDisplayUtils.formatNftStandard(collection.tokenInfo.type)}
              </div>
            </div>
            {!!nft.metadata.attributes &&
              nft.metadata.attributes.map((attribute) => (
                <div
                  className="label-value"
                  key={`${collection.tokenInfo.contractAddress}-${nft.id}-${attribute.trait_type}`}>
                  <div className="label">{attribute.trait_type}</div>
                  <div className="value">
                    {typeof attribute.value === 'string'
                      ? attribute.value
                      : JSON.stringify(attribute.value)}
                  </div>
                </div>
              ))}
          </div>
      </div>
      <ButtonComponent
        onClick={() => onSend?.()}
        label="popup_html_send_transfer"
        logo={SVGIcons.WALLET_SEND}
        additionalClass="nft-details-send"
        dataTestId="nft-details-send"
        height="medium"
      />
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
