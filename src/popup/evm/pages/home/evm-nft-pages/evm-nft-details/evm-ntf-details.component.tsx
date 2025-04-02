import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { Separator } from 'src/common-ui/separator/separator.component';

interface Props {
  nft: EvmErc721TokenCollectionItem;
  collection: EvmErc721Token;
}

export const EvmNftDetails = ({ nft, collection }: Props) => {
  return (
    <>
      <div className="detailed-nft">
        <img src={nft.metadata.image} />
        <div className="name">{nft.metadata.name}</div>
        <div className="collection-name">{nft.metadata.name}</div>
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
      </div>
      <ButtonComponent
        label="popup_html_send_transfer"
        onClick={() => console.log('sending', nft, collection)}
        type={ButtonType.IMPORTANT}
        height="small"
      />
      <Separator type="horizontal" fullSize />
    </>
  );
};
