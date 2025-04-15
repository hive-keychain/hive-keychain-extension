import {
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React, { BaseSyntheticEvent, useEffect } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

interface Props {
  nft: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem;
  collection: EvmErc721Token | EvmErc721Token;
  expanded?: boolean;
  onClick?: () => void;
  onClickSend?: () => void;
  nftSize?: 'small' | 'normal';
}

export const EvmNftDetails = ({
  nft,
  collection,
  expanded,
  onClick,
  onClickSend,
  nftSize,
}: Props) => {
  useEffect(() => {
    console.log({ nft, collection, expanded });
  }, []);

  const handleOnClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    if (onClick) onClick();
  };
  const handleOnClickSend = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    if (onClickSend) onClickSend();
  };

  return (
    <div
      key={`${collection.tokenInfo.address}-${nft.id}`}
      className={`detailed-nft ${expanded ? 'expanded' : ''}`}
      onClick={handleOnClick}>
      <img className={`${nftSize ?? 'normal'}`} src={nft.metadata.image} />
      <div className="name">{nft.metadata.name}</div>
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
              {chrome.i18n.getMessage('evm_operation_smart_contract_address')}
            </div>
            <div className="value">
              {EvmFormatUtils.formatAddress(collection.tokenInfo.address)}
            </div>
          </div>
          <div className="label-value smart-contract-address">
            <div className="label">
              {chrome.i18n.getMessage('evm_nft_token_id')}
            </div>
            <div className="value">{nft.id}</div>
          </div>
          {(nft as EvmErc1155TokenCollectionItem)?.balance && (
            <div className="label-value smart-contract-address">
              <div className="label">
                {chrome.i18n.getMessage('popup_html_balance')}
              </div>
              <div className="value">
                {(nft as EvmErc1155TokenCollectionItem)?.balance}
              </div>
            </div>
          )}
          <div className="label-value smart-contract-address">
            <div className="label">
              {chrome.i18n.getMessage('evm_nft_token_type')}
            </div>
            <div className="value">{collection.tokenInfo.type}</div>
          </div>

          {nft.metadata.attributes &&
            nft.metadata.attributes.map((attribute) => (
              <div
                className="label-value smart-contract-address"
                key={`${collection.tokenInfo.address}-${nft.id}-${attribute.trait_type}`}>
                <div className="label">{attribute.trait_type}</div>
                <div className="value">{attribute.value}</div>
              </div>
            ))}

          {onClickSend && (
            <ButtonComponent
              additionalClass="send-button"
              label="popup_html_send_transfer"
              onClick={(event) => handleOnClickSend(event)}
              type={ButtonType.IMPORTANT}
              height="small"
            />
          )}
        </>
      )}
    </div>
  );
};
