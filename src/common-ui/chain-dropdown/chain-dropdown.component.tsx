import { Screen } from '@interfaces/screen.interface';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const ChainDropdown = ({ chain, setChain, navigateTo }: PropsFromRedux) => {
  const [options, setOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    if (chain.name.length > 0) init();
  }, [chain]);

  const init = async () => {
    const chains = await ChainUtils.getSetupChains();
    let optionItems: OptionItem[] = chains.map((c) => {
      return { label: c.name, value: c, img: c.logo };
    });
    setOptions(optionItems);
  };

  const handleOnAddBlockchainClicked = () => {
    navigateTo(Screen.SELECT_BLOCKCHAIN_PAGE);
  };

  return (
    <>
      {options && chain && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          options={options}
          selectedItem={{ label: chain.name, value: chain, img: chain.logo }}
          setSelectedItem={(item) => setChain(item.value)}
          background="white"
          footer={
            <div
              className="add-blockchain-panel"
              onClick={handleOnAddBlockchainClicked}>
              <SVGIcon icon={SVGIcons.SELECT_ADD} />
              <div className="text">
                {chrome.i18n.getMessage('html_popup_add_blockchain')}
              </div>
            </div>
          }
          renderOnlyIcon
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  setChain,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainDropdownComponent = connector(ChainDropdown);
