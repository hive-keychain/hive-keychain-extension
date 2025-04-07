import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React, { useEffect } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  token: EvmErc721Token;
  onClick: () => void;
}

export const EvmWalletNftPreviewComponent = ({ token, onClick }: Props) => {
  useEffect(() => {
    console.log(`collection-${token.tokenInfo.address}`);
  }, []);

  return (
    <div
      className="nft-collection-preview-card"
      onClick={() => onClick()}
      key={`collection-${token.tokenInfo.address}`}>
      <div className="nft-collection-name-panel">
        <span className="ntf-collection-name">{token.tokenInfo.name}</span>
        <span className="nft-collection-address">
          {EvmFormatUtils.formatAddress(token.tokenInfo.address)}
        </span>
      </div>
      <div className="nft-collection-preview">
        <div className="nft-preview-container">
          {token.collection.slice(0, 4).map((collectionItem) => (
            <React.Fragment
              key={`collection-${token.tokenInfo.address}-${collectionItem.id}`}>
              <CustomTooltip
                message={collectionItem.metadata.name}
                skipTranslation>
                <img
                  className="nft-preview"
                  src={collectionItem.metadata.image}
                />
              </CustomTooltip>
            </React.Fragment>
          ))}
        </div>
        <SVGIcon className="go-to-icon" icon={SVGIcons.GLOBAL_ARROW} />
      </div>
    </div>
  );
};
