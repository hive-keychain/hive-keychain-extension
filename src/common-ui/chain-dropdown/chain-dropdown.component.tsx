import { Chain } from '@popup/multichain/reducers/chain.reducer';
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

const ChainDropdown = ({ chain }: PropsFromRedux) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OptionItem>();

  useEffect(() => {
    if (chain.name.length > 0) init(chain);
  }, [chain]);

  const init = async (chain: Chain) => {
    const chains = await ChainUtils.getChains();
    let optionItems: OptionItem[] = chains.map((c) => {
      return { label: c.symbol, value: c, img: c.logo };
    });
    setOptions(optionItems);
    setSelectedItem({ label: chain.symbol, value: chain, img: chain.logo });
  };

  return (
    <>
      {options && selectedItem && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          options={options}
          selectedItem={selectedItem}
          setSelectedItem={(item) => setSelectedItem(item)}
          background="white"
          footer={
            <div className="option add-blockchain-panel">
              <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE} />
              <div className="label">Add blockchain</div>
            </div>
          }
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

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainDropdownComponent = connector(ChainDropdown);
