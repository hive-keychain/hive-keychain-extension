import { Chain, useChainContext } from '@popup/multichain/multichain.context';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const ChainSelector = () => {
  const { setChain } = useChainContext();

  return (
    <div className="chain-selector-page">
      <PageTitleComponent
        title="html_popup_chain_selector_page_title"
        isCloseButtonDisabled></PageTitleComponent>
      <div className="caption">{chrome.i18n.getMessage('')}</div>
      <div className="chain-cards-container">
        <div
          className="chain-card"
          onClick={() => {
            setChain(Chain.HIVE);
          }}>
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_HIVE} />
          <div className="chain-name">Hive</div>
        </div>
        <div
          className="chain-card"
          onClick={() => {
            setChain(Chain.EVM);
          }}>
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_AVALANCHE} />
          <div className="chain-name">Avalanche</div>
        </div>
        <div
          className="chain-card"
          onClick={() => {
            setChain(Chain.EVM);
          }}>
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_BNB} />
          <div className="chain-name">BNB</div>
        </div>
        <div
          className="chain-card"
          onClick={() => {
            setChain(Chain.EVM);
          }}>
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_POLYGON} />
          <div className="chain-name">Polygon</div>
        </div>
        <div
          className="chain-card"
          onClick={() => {
            setChain(Chain.EVM);
          }}>
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_ETHEREUM} />
          <div className="chain-name">Ethereum</div>
        </div>
      </div>
    </div>
  );
};

export default ChainSelector;
