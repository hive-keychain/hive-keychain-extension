import CheckboxComponent from '@common-ui/checkbox/checkbox/checkbox.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Badge, BadgeType } from 'src/common-ui/badge/badge.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

interface ChainSelectorProps {}

const ChainSelector = ({
  chain,
  setChain,
  navigateTo,
}: PropsFromRedux & ChainSelectorProps) => {
  const [setupChains, setSetupChains] = useState<Chain[]>();
  const [popularChains, setPopularChains] = useState<Chain[]>();
  const [nonPopularChains, setNonPopularChains] = useState<Chain[]>();

  const [filteredPopularChains, setFilteredPopularChains] = useState<Chain[]>();
  const [filteredNonPopularChains, setFilteredNonPopularChains] =
    useState<Chain[]>();

  const [showTestnets, setShowTestnets] = useState(false);

  const [search, setSearch] = useState('');
  useEffect(() => {
    init();
  }, [chain]);

  useEffect(() => {
    setFilteredPopularChains(popularChains?.filter(filterChains));
    setFilteredNonPopularChains(nonPopularChains?.filter(filterChains));
  }, [search, showTestnets]);

  const init = async () => {
    setSetupChains(await ChainUtils.getSetupChains());

    const chains = await ChainUtils.getNonSetupChains();
    const nonPopChains = chains?.filter((chain) => !chain.isPopular);
    const popChains = chains?.filter((chain) => chain.isPopular);
    setNonPopularChains(nonPopChains);
    setPopularChains(popChains);
    setFilteredPopularChains(popChains?.filter(filterChains));
    setFilteredNonPopularChains(nonPopChains?.filter(filterChains));
    setShowTestnets(false);
  };

  const selectChain = async (chain: Chain) => {
    setChain(chain);
  };

  const onCloseClicked = async () => {
    let previousChain = ChainUtils.getPreviousChain();
    if (previousChain) setChain(previousChain);
    else if (setupChains) setChain(setupChains[0]);
  };

  const filterChains = (chain: Chain) => {
    return (
      (showTestnets || (!showTestnets && !chain.testnet)) &&
      (chain.chainId.toLowerCase().includes(search.toLowerCase()) ||
        chain.name.toLowerCase().includes(search.toLowerCase()) ||
        (chain.type === ChainType.EVM &&
          (chain as EvmChain).mainToken
            .toLowerCase()
            .includes(search.toLowerCase())))
    );
  };

  return (
    <>
      <PageTitleComponent
        title="html_popup_chain_selector_page_title"
        isBackButtonEnabled={setupChains?.length}
        isCloseButtonDisabled
        onBackAdditional={onCloseClicked}></PageTitleComponent>
      <div className="chain-selector-page">
        <div className="search-container">
          <InputComponent
            classname="search-input"
            value={search}
            onChange={setSearch}
            placeholder="popup_html_search"
            type={InputType.TEXT}
          />
          <CheckboxComponent
            checked={showTestnets}
            onChange={setShowTestnets}
            title="popup_html_show_testnets"
          />
        </div>

        <div className="lists-container">
          {filteredPopularChains && filteredPopularChains.length > 0 && (
            <div className="chain-cards-container">
              <div className="chain-cards-container-title">
                {chrome.i18n.getMessage('html_popup_popular_chains')}
              </div>
              <div className="chain-cards-container-list">
                {filteredPopularChains.map((chain: Chain, index: number) => (
                  <div
                    key={`chain-${chain.name}-${index}`}
                    className="chain-card"
                    onClick={() => {
                      selectChain(chain);
                    }}>
                    <img src={chain.logo} />
                    <div className="chain-name">{chain.name}</div>
                    {chain.testnet && (
                      <Badge small badgeType={BadgeType.TESTNET} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {filteredNonPopularChains && filteredNonPopularChains.length > 0 && (
            <div className="chain-cards-container">
              <div className="chain-cards-container-title">
                {chrome.i18n.getMessage('html_popup_non_popular_chains')}
              </div>
              <div className="chain-cards-container-list">
                {filteredNonPopularChains.map((chain: Chain, index: number) => (
                  <div
                    key={`chain-${chain.name}-${index}`}
                    className="chain-card"
                    onClick={() => {
                      selectChain(chain);
                    }}>
                    <img src={chain.logo} />
                    <div className="chain-name">{chain.name}</div>
                    {chain.testnet && (
                      <Badge small badgeType={BadgeType.TESTNET} />
                    )}
                  </div>
                ))}
              </div>
              {/* <div
            key={`add-custom-chain`}
            className="chain-card add-custom-chain"
            onClick={() => navigateTo(Screen.CREATE_BLOCKCHAIN_PAGE)}>
            <SVGIcon icon={SVGIcons.SELECT_ADD} />
            <div className="chain-name">
              {chrome.i18n.getMessage('html_popup_add_blockchain')}
            </div>
          </div> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  setChain,
  navigateTo,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainSelectorPageComponent = connector(ChainSelector);
