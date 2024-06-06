import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import React from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';

interface EvmWalletInfoSectionProps {
  evmTokens?: EVMToken[];
  prices: EvmPrices;
}

const WalletInfoSection = ({
  evmTokens,
  prices,
}: EvmWalletInfoSectionProps) => {
  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {prices &&
          evmTokens &&
          EvmTokensUtils.sortTokens(evmTokens, prices)
            .filter(
              (token) =>
                token.tokenInfo.type === EVMTokenType.NATIVE ||
                !token.tokenInfo.possibleSpam,
            )
            .map((token, index) => (
              <EVMWalletInfoSectionItemComponent
                key={`${token.tokenInfo.name}-${index}`}
                token={token}
                mainValueLabel={token.tokenInfo.symbol}
                mainValue={token.formattedBalance}
                mainValueSubLabel={token.tokenInfo.name}
              />
            ))}
        {!evmTokens && <RotatingLogoComponent />}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
