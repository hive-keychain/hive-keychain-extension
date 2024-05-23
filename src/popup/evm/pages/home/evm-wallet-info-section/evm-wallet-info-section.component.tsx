import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import React from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';

interface EvmWalletInfoSectionProps {
  evmTokens?: EVMToken[];
}

const WalletInfoSection = ({ evmTokens }: EvmWalletInfoSectionProps) => {
  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {evmTokens &&
          evmTokens.map((token, index) => (
            <EVMWalletInfoSectionItemComponent
              key={`${token.tokenInfo.name}-${index}`}
              token={token}
              mainValueLabel={token.tokenInfo.name}
              mainValue={token.formattedBalance}
            />
          ))}
        {!evmTokens && <RotatingLogoComponent />}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
