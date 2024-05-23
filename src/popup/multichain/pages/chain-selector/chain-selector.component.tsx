import { Screen } from '@interfaces/screen.interface';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Badge, BadgeType } from 'src/common-ui/badge/badge.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EnumUtils } from 'src/utils/enum.utils';

interface ChainSelectorProps {}

const ChainSelector = ({
  chain,
  setChain,
  navigateTo,
}: PropsFromRedux & ChainSelectorProps) => {
  const [nonSetupChains, setNonSetupChains] = useState<Chain[]>();
  const [setupChains, setSetupChains] = useState<Chain[]>();

  useEffect(() => {
    init();
  }, [chain]);

  const init = async () => {
    setNonSetupChains(await ChainUtils.getNonSetupChains());
    setSetupChains(await ChainUtils.getSetupChains());
  };

  const selectChain = async (chain: Chain) => {
    if (
      chain.type === ChainType.EVM &&
      setupChains?.some((c) => c.type === ChainType.EVM)
    ) {
      await ChainUtils.addChainToSetupChains(chain);
    }
    setChain(chain);
  };

  const onCloseClicked = async () => {
    let previousChain = ChainUtils.getPreviousChain();
    if (previousChain) setChain(previousChain);
    else if (setupChains) setChain(setupChains[0]);
  };

  return (
    <>
      <PageTitleComponent
        title="html_popup_chain_selector_page_title"
        isBackButtonEnabled={setupChains?.length}
        isCloseButtonDisabled
        onBackAdditional={onCloseClicked}></PageTitleComponent>
      <div className="chain-selector-page">
        <div className="caption">{chrome.i18n.getMessage('')}</div>
        <div className="chain-cards-container">
          {nonSetupChains &&
            nonSetupChains.length > 0 &&
            nonSetupChains.map((chain: Chain, index: number) => (
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
                {
                  <Badge
                    small
                    badgeType={
                      chain.testnet ? BadgeType.TESTNET : BadgeType.MAINNET
                    }
                  />
                }
              </div>
            ))}
          <div
            key={`add-custom-chain`}
            className="chain-card add-custom-chain"
            onClick={() => navigateTo(Screen.CREATE_BLOCKCHAIN_PAGE)}>
            <SVGIcon icon={SVGIcons.SELECT_ADD} />
            <div className="chain-name">
              {chrome.i18n.getMessage('html_popup_add_blockchain')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    // hasBackButton: state.navigation.stack[0].params?.hasBackButton,
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  setChain,
  navigateTo,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainSelectorPageComponent = connector(ChainSelector);
