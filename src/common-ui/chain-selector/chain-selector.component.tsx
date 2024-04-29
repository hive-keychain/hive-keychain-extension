import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';

const ChainSelector = ({ chains }: PropsFromRedux) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OptionItem>();

  useEffect(() => {
    let optionItems: OptionItem[] = chains.map((c) => {
      return { label: c.symbol, value: c, img: c.logo };
    });
    setOptions(optionItems);
    setSelectedItem(options[0]);
  }, [chains]);

  return (
    <>
      {options && selectedItem && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          options={options}
          selectedItem={selectedItem}
          setSelectedItem={(item) => setSelectedItem(item)}
          background="white"
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chains: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        logo: 'https://cdn.moralis.io/eth/0x.png',
      },
    ],
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainSelectorComponent = connector(ChainSelector);
