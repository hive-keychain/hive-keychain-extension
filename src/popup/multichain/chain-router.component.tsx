import { ActionButton } from '@interfaces/action-button.interface';
import { EvmAppComponent } from '@popup/evm/evm-app.component';
import { HiveAppComponent } from '@popup/hive/hive-app.component';
import ChainSelector from '@popup/multichain/chain-selector.component';
import { Chain } from '@popup/multichain/multichain.context';
import { SignUpScreen } from '@popup/multichain/sign-up.context';
import { SignUpComponent } from '@popup/multichain/sign-up/sign-up.component';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MessageContainerComponent } from 'src/common-ui/message-container/message-container.component';

type Props = { screen: SignUpScreen; selectedChain?: Chain };

const ChainRouter = ({
  screen,
  selectedChain,
  errorMessage,
}: Props & PropsFromRedux) => {
  const renderChain = () => {
    switch (selectedChain) {
      case Chain.HIVE:
        return <HiveAppComponent />;
      case Chain.EVM:
        return <EvmAppComponent />;
      default:
        return screen === SignUpScreen.SIGN_UP ? (
          <SignUpComponent />
        ) : (
          <ChainSelector />
        );
    }
  };

  return (
    <>
      {renderChain()}
      {errorMessage?.key && <MessageContainerComponent />}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return { errorMessage: state.errorMessage };
};

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector> & ActionButton;

export default connector(ChainRouter);
