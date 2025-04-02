import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

interface Props {
  nft: EvmErc721TokenCollectionItem;
  collection: EvmErc721Token;
  expanded?: boolean;
  onClick: () => void;
}

export const EvmNftDetails = ({
  nft,
  collection,
  expanded,
  onClick,
}: Props) => {
  return (
    <>
      <div
        className={`detailed-nft ${expanded ? 'expanded' : ''}`}
        onClick={() => onClick()}>
        <img src={nft.metadata.image} />
        <div className="name">{nft.metadata.name}</div>
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
            <div className="label-value smart-contract-address">
              <div className="label">
                {chrome.i18n.getMessage('evm_nft_token_type')}
              </div>
              <div className="value">{collection.tokenInfo.type}</div>
            </div>
            <ButtonComponent
              label="popup_html_send_transfer"
              onClick={() => console.log('sending', nft, collection)}
              type={ButtonType.IMPORTANT}
              height="small"
            />
          </>
        )}
      </div>
    </>
  );
};
