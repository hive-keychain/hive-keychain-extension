import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { WalletInfoSectionItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import React from 'react';

interface EvmWalletInfoSectionProps {
  evmTokens: EvmErc20TokenBalanceWithPrice[];
}

const WalletInfoSection = ({ evmTokens }: EvmWalletInfoSectionProps) => {
  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {evmTokens.map((token, index) => (
          <WalletInfoSectionItemComponent
            key={`${token.name}-${index}`}
            tokenSymbol={token.name}
            icon={token.logo}
            mainValue={token.balanceFormatted}
            mainValueLabel={token.symbol}
          />
        ))}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
