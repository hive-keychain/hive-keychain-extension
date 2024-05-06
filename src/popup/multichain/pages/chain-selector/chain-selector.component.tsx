import { setChain } from '@popup/multichain/actions/chain.actions';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EnumUtils } from 'src/utils/enum.utils';

const ChainSelector = ({ setChain }: PropsFromRedux) => {
  const [chains, setChains] = useState<Chain[]>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setChains(await ChainUtils.getNonSetupChains());
  };

  const selectChain = async (chain: Chain) => {
    await ChainUtils.addChainToSetupChains(chain);
    setChain(chain);
  };

  return (
    <div className="chain-selector-page">
      <PageTitleComponent
        title="html_popup_chain_selector_page_title"
        isCloseButtonDisabled></PageTitleComponent>
      <div className="caption">{chrome.i18n.getMessage('')}</div>
      <div className="chain-cards-container">
        {chains &&
          chains.length > 0 &&
          chains.map((chain: Chain, index: number) => (
            <div
              key={`chain-${chain.name}-${index}`}
              className="chain-card"
              onClick={() => {
                selectChain(chain);
              }}>
              {EnumUtils.isValueOf(chain.logo, SVGIcons) && (
                <SVGIcon icon={chain.logo as SVGIcons} />
              )}
              {!EnumUtils.isValueOf(chain.logo, SVGIcons) && (
                <img src={chain.logo} />
              )}
              <div className="chain-name">{chain.name}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setChain,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainSelectorPageComponent = connector(ChainSelector);
