import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  token: EvmErc721Token;
  onClick: () => void;
}

export const EvmWalletNftPreviewComponent = ({ token, onClick }: Props) => {
  return (
    <div className="nft-collection-preview-card" onClick={() => onClick()}>
      <div className="nft-collection-name">{token.tokenInfo.name}</div>
      <div className="nft-collection-preview">
        <div className="nft-preview-container">
          {token.collection.slice(0, 4).map((collectionItem) => (
            <CustomTooltip
              message={collectionItem.metadata.name}
              skipTranslation
              key={`${collectionItem.metadata.name}-${collectionItem.id}`}>
              <img
                className="nft-preview"
                src={collectionItem.metadata.image}
              />
            </CustomTooltip>
          ))}
        </div>
        <SVGIcon className="go-to-icon" icon={SVGIcons.GLOBAL_ARROW} />
      </div>
    </div>
  );
};
