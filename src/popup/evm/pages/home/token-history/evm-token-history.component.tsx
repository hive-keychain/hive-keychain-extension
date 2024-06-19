import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EvmTokenHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const EvmTokenHistoryPage = ({
  token,
  account,
  chain,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [history, setHistory] = useState<EvmTokenHistory>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens_history',
      titleParams: [token.tokenInfo.symbol],
      isBackButtonEnabled: true,
      // rightAction: {
      //   icon: SVGIcons.WALLET_HISTORY_FILTER_BUTTON,
      //   callback: toggleFilter,
      //   className: 'wallet-filter-button',
      // },
    });
    init();
  }, []);

  const init = async () => {
    const res = await EvmTokensHistoryUtils.getHistory(
      token,
      chain,
      account.wallet.address,
      account.wallet.signingKey,
    );
    console.log(res);
  };

  return <div className="evm-token-history"></div>;
};

const mapStateToProps = (state: RootState) => {
  return {
    token: state.navigation.params.token as EVMToken,
    chain: state.chain as EvmChain,
    account: state.evm.accounts[0] as EvmAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTokenHistoryComponent = connector(EvmTokenHistoryPage);
