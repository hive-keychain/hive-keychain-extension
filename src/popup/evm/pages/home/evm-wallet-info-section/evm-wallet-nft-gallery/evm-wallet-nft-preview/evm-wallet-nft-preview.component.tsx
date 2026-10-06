import {
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  token: EvmErc721Token;
  onClick: () => void;
}

export const EvmWalletNftPreviewComponent = ({ token, onClick }: Props) => {
  const formattedAddress = EvmFormatUtils.formatAddress(
    token.tokenInfo.contractAddress,
  );
  const collectionName = token.tokenInfo.name?.trim() || formattedAddress;
  const shouldShowAddress =
    collectionName.toLowerCase() !== formattedAddress.toLowerCase();
  const ownedCount = EvmNftDisplayUtils.getCollectionOwnedQuantity(token);
  const ownedLabel = I18nUtils.getMessage(
    ownedCount === 1 ? 'evm_nft_item_count_one' : 'evm_nft_item_count_other',
    [String(ownedCount)],
  );

  return (
    <div
      className="nft-collection-preview-card"
      onClick={() => onClick()}
      key={`collection-${token.tokenInfo.contractAddress}`}>
      <div className="nft-collection-header">
        <div className="nft-collection-heading">
          <span className="nft-collection-name">{collectionName}</span>
          {shouldShowAddress && (
            <span className="nft-collection-address">{formattedAddress}</span>
          )}
        </div>
        <span className="nft-collection-count">
          {ownedLabel}
          <SVGIcon className="go-to-icon" icon={SVGIcons.GLOBAL_ARROW} />
        </span>
      </div>
      <div className="nft-preview-container">
        {token.collection.slice(0, 4).map((collectionItem) => {
          const quantity = EvmNftDisplayUtils.getNftOwnedQuantity(collectionItem);
          return (
            <CustomTooltip
              key={`collection-${token.tokenInfo.contractAddress}-${collectionItem.id}`}
              message={EvmNftDisplayUtils.getNftDisplayName(
                collectionItem,
                token.tokenInfo.name,
              )}
              skipTranslation>
              <div className="nft-preview-thumb">
                <EvmNftMedia
                  className="nft-preview"
                  src={collectionItem.metadata.image}
                />
                {quantity > 1 && (
                  <div className="nft-balance">{`×${quantity}`}</div>
                )}
              </div>
            </CustomTooltip>
          );
        })}
      </div>
    </div>
  );
};
