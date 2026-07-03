import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftGalleryComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component';
import { EvmWalletTokensComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-tokens/evm-wallet-tokens.component';
import { EvmHistoryComponent } from '@popup/evm/pages/home/token-history/evm-history.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';

interface WalletSectionRefsProps {
  walletScrollRef?: React.RefObject<HTMLDivElement>;
}

interface EvmWalletInfoSectionProps {
  activeAccount: EvmActiveAccount;
  chain: EvmChain;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
  loadEvmHistory: Function;
  reloadEvmActiveAccount: () => Promise<void>;
  initialDisplayNfts?: boolean;
  initialDisplayHistory?: boolean;
}

enum EvmDisplayedPage {
  TOKENS = 'tokens',
  NTFS = 'nfts',
  HISTORY = 'history',
}

export const EvmWalletInfoSectionComponent = ({
  activeAccount,
  chain,
  onClickOnNftPreview,
  loadEvmHistory,
  reloadEvmActiveAccount,
  initialDisplayNfts,
  initialDisplayHistory,
  walletScrollRef,
}: EvmWalletInfoSectionProps & WalletSectionRefsProps) => {
  const lightNodeUnavailable = Boolean(
    activeAccount.nativeAndErc20Tokens.lightNodeUnavailable ||
      activeAccount.nfts.lightNodeUnavailable ||
      activeAccount.history.lightNodeUnavailable,
  );
  const canDisplayHistory = chain.isCustom === true || !lightNodeUnavailable;

  const getInitialDisplayedSection = (): EvmDisplayedPage => {
    if (initialDisplayHistory && canDisplayHistory) {
      return EvmDisplayedPage.HISTORY;
    }
    if (initialDisplayNfts) return EvmDisplayedPage.NTFS;
    return EvmDisplayedPage.TOKENS;
  };
  const [displayedSection, setDisplayedSection] = useState<EvmDisplayedPage>(
    getInitialDisplayedSection(),
  );
  const effectiveDisplayedSection =
    !canDisplayHistory && displayedSection === EvmDisplayedPage.HISTORY
      ? EvmDisplayedPage.TOKENS
      : displayedSection;

  useEffect(() => {
    if (!canDisplayHistory && displayedSection === EvmDisplayedPage.HISTORY) {
      setDisplayedSection(EvmDisplayedPage.TOKENS);
    }
  }, [canDisplayHistory, displayedSection]);

  const loadHistory = async (reset?: boolean) => {
    loadEvmHistory();
  };

  const tabValues = [
    {
      label: `evm_tab_${EvmDisplayedPage.TOKENS}`,
      value: EvmDisplayedPage.TOKENS,
    },
    {
      label: `evm_tab_${EvmDisplayedPage.NTFS}`,
      value: EvmDisplayedPage.NTFS,
    },
    ...(canDisplayHistory
      ? [
          {
            label: chain.isCustom
              ? 'evm_activity_tab'
              : `evm_tab_${EvmDisplayedPage.HISTORY}`,
            value: EvmDisplayedPage.HISTORY,
          },
        ]
      : []),
  ];

  const getDisplayedSection = () => {
    switch (effectiveDisplayedSection) {
      case EvmDisplayedPage.TOKENS: {
        return (
          <EvmWalletTokensComponent
            chain={chain}
            activeAccount={activeAccount}
            reloadEvmActiveAccount={reloadEvmActiveAccount}
          />
        );
      }
      case EvmDisplayedPage.NTFS: {
        return (
          <EvmWalletNftGalleryComponent
            activeAccount={activeAccount}
            onClickOnNftPreview={onClickOnNftPreview}
            chain={chain}
          />
        );
      }
      case EvmDisplayedPage.HISTORY: {
        return (
          <EvmHistoryComponent
            chain={chain}
            history={activeAccount.history.value}
            onClickOnLoadMore={loadHistory}
            loading={activeAccount.history.loading}
          />
        );
      }
    }
  };

  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section" ref={walletScrollRef}>
        {activeAccount.nativeAndErc20Tokens && (
          <>
            <SlidingBarComponent
              onChange={setDisplayedSection}
              selectedValue={effectiveDisplayedSection}
              values={tabValues}
              id="tabs"
            />
            {getDisplayedSection()}
          </>
        )}
      </div>
    </div>
  );
};
