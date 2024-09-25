import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmAccountsComponent = ({
  accounts,
  setTitleContainerProperties,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_accounts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, []);
  return (
    <>
      {accounts.map((account: EvmAccount) => (
        <>{account.id}</>
      ))}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});

type PropsType = ConnectedProps<typeof connector>;

export default connector(EvmAccountsComponent);
