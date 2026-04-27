import { ChainSelectorPageComponent } from '@popup/multichain/pages/chain-selector/chain-selector.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const EvmCustomChains = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_manage_chains',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  return <ChainSelectorPageComponent hideTitle />;
};

const connector = connect(null, {
  setTitleContainerProperties,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomChainsComponent = connector(EvmCustomChains);
