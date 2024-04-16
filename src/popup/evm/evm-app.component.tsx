import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const EvmApp = ({ navigateTo, accounts }: PropsFromRedux) => {
  useEffect(() => {
    console.log(accounts);
    if (!accounts.length) {
      navigateTo(Screen.EVM_ADD_WALLET_MAIN);
    } else {
      navigateTo(Screen.EVM_HOME);
    }
  }, [accounts.length]);

  return <EvmRouterComponent />;
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmAppComponent = connector(EvmApp);
