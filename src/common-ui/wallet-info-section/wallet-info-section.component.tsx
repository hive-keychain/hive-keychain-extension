import { EVMBalance } from '@popup/evm/interfaces/active-account.interface';
import { WalletInfoSectionItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import React from 'react';

interface EvmWalletInfoSectionProps {
  evmTokens: EVMBalance[];
}

const WalletInfoSection = ({ evmTokens }: EvmWalletInfoSectionProps) => {
  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {evmTokens &&
          evmTokens.map((token, index) => (
            <WalletInfoSectionItemComponent
              key={`${token.tokenInfo.name}-${index}`}
              tokenSymbol={token.tokenInfo.name}
              icon={token.tokenInfo.logo}
              mainValue={token.formattedBalance}
              mainValueLabel={token.tokenInfo.symbol}
            />
          ))}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
