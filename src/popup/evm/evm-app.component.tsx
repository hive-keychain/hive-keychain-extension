import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const EvmApp = ({ navigateTo }: PropsFromRedux) => {
  useEffect(() => {
    navigateTo(Screen.EVM_ADD_WALLET_MAIN);
  }, []);
  return <EvmRouterComponent />;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateTo,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmAppComponent = connector(EvmApp);
