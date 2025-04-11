import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import React, { useEffect, useState } from 'react';

interface Props {
  prices: EvmPrices;
  activeAccount: EvmActiveAccount;
}

export const EvmWalletTokensComponent = ({ prices, activeAccount }: Props) => {
  const [displayedTokens, setDisplayedTokens] = useState<NativeAndErc20Token[]>(
    [],
  );
  useEffect(() => {
    init();
  }, [activeAccount.nativeAndErc20Tokens]);

  const init = async () => {
    const tokens: NativeAndErc20Token[] =
      (await EvmTokensUtils.filterTokensBasedOnSettings(
        activeAccount.nativeAndErc20Tokens,
      )) as NativeAndErc20Token[];
    const sortedTokens = EvmTokensUtils.sortTokens(tokens, prices);

    setDisplayedTokens(sortedTokens);
  };

  return (
    <>
      {displayedTokens.map((token, index) => (
        <EVMWalletInfoSectionItemComponent
          key={`${token.tokenInfo.name}-${index}`}
          token={token}
          mainValueLabel={token.tokenInfo.symbol}
          mainValue={token.formattedBalance}
          mainValueSubLabel={token.tokenInfo.name}
        />
      ))}
    </>
  );
};
