import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmWalletNftGalleryComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component';
import { EvmWalletTokensComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-tokens/evm-wallet-tokens.component';
import { EvmHistoryComponent } from '@popup/evm/pages/home/token-history/evm-history.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';

interface EvmWalletInfoSectionProps {
  activeAccount: EvmActiveAccount;
  prices: EvmPrices;
  chain: EvmChain;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
}

enum EvmDisplayedPage {
  TOKENS = 'tokens',
  NTFS = 'nfts',
  HISTORY = 'history',
}

const WalletInfoSection = ({
  activeAccount,
  prices,
  chain,
  onClickOnNftPreview,
}: EvmWalletInfoSectionProps) => {
  const [displayedSection, setDisplayedSection] = useState<EvmDisplayedPage>(
    EvmDisplayedPage.TOKENS,
  );

  const [history, setHistory] = useState<EvmUserHistory>();

  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (activeAccount.isInitialized) loadHistory();
  }, [activeAccount.isInitialized]);

  const loadHistory = async () => {
    console.log('starting load history');
    setLoadingHistory(true);
    setHistory(
      await EvmTokensHistoryUtils.fetchHistory(
        activeAccount.address,
        chain,
        history,
      ),
    );
    setLoadingHistory(false);
  };

  const getDisplayedSection = () => {
    switch (displayedSection) {
      case EvmDisplayedPage.TOKENS: {
        return (
          <EvmWalletTokensComponent
            prices={prices}
            activeAccount={activeAccount}
          />
        );
      }
      case EvmDisplayedPage.NTFS: {
        return (
          <EvmWalletNftGalleryComponent
            activeAccount={activeAccount}
            onClickOnNftPreview={onClickOnNftPreview}
          />
        );
      }
      case EvmDisplayedPage.HISTORY: {
        return (
          <EvmHistoryComponent
            chain={chain}
            history={history}
            onClickOnLoadMore={loadHistory}
            loading={loadingHistory}
          />
        );
      }
    }
  };

  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {prices && activeAccount.nativeAndErc20Tokens && (
          <>
            <SlidingBarComponent
              onChange={setDisplayedSection}
              selectedValue={displayedSection}
              values={[
                {
                  label: `evm_tab_${EvmDisplayedPage.TOKENS}`,
                  value: EvmDisplayedPage.TOKENS,
                },
                {
                  label: `evm_tab_${EvmDisplayedPage.NTFS}`,
                  value: EvmDisplayedPage.NTFS,
                },
                {
                  label: `evm_tab_${EvmDisplayedPage.HISTORY}`,
                  value: EvmDisplayedPage.HISTORY,
                },
              ]}
              id="tabs"
            />
            {getDisplayedSection()}
          </>
        )}
        {!activeAccount.isInitialized && <RotatingLogoComponent />}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
