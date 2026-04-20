import { Card } from '@common-ui/card/card.component';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftPreviewComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-preview/evm-wallet-nft-preview.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import {
  isCustomNftEmptyCardHiddenForChain,
  setCustomNftEmptyCardHiddenForChain,
} from '@popup/evm/utils/evm-custom-nft-empty-card.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import FlatList from 'flatlist-react';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface Props {
  activeAccount: EvmActiveAccount;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
  chain: EvmChain;
  loadEvmActiveAccountNfts: (chain: EvmChain, wallet: HDNodeWallet) => void;
}

const EvmWalletNftGallery = ({
  activeAccount,
  chain,
  onClickOnNftPreview,
  loadEvmActiveAccountNfts,
  navigateTo,
}: Props & PropsFromRedux) => {
  const [displayedCollections, setDisplayedCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();
  const [filteredCollections, setFilteredCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();

  const [filterValue, setFilterValue] = useState('');
  const isCustomChainSelected = chain.isCustom === true;

  const [emptyCardState, setEmptyCardState] = useState<{
    ready: boolean;
    showCard: boolean;
  }>({ ready: false, showCard: false });

  useEffect(() => {
    if (!activeAccount.nfts.initialized) {
      loadEvmActiveAccountNfts(chain, activeAccount.wallet);
    }
  }, []);

  useEffect(() => {
    if (!activeAccount.nfts.loading) {
      init();
    }
  }, [activeAccount.nfts]);

  useEffect(() => {
    if (filteredCollections) {
      setDisplayedCollections(
        filteredCollections.filter(
          (collection) =>
            collection.tokenInfo.name
              ?.toLowerCase()
              .includes(filterValue.toLowerCase()) ||
            collection.tokenInfo.symbol
              ?.toLowerCase()
              .includes(filterValue.toLowerCase()),
        ),
      );
    }
  }, [filterValue]);

  useEffect(() => {
    let cancelled = false;

    const refreshEmptyCard = async () => {
      if (!isCustomChainSelected) {
        if (!cancelled) {
          setEmptyCardState({ ready: true, showCard: false });
        }
        return;
      }

      const [customNfts, hidden] = await Promise.all([
        EvmTokensUtils.getCustomNfts(chain, activeAccount.wallet.address),
        isCustomNftEmptyCardHiddenForChain(chain.chainId),
      ]);

      if (cancelled) {
        return;
      }

      setEmptyCardState({
        ready: true,
        showCard: customNfts.length === 0 && !hidden,
      });
    };

    void refreshEmptyCard();

    return () => {
      cancelled = true;
    };
  }, [
    chain,
    chain.chainId,
    isCustomChainSelected,
    activeAccount.wallet.address,
    activeAccount.nfts.loading,
  ]);

  const init = async () => {
    const acceptedTokens = (await EvmTokensUtils.filterTokensBasedOnSettings(
      activeAccount.nfts.value,
    )) as (EvmErc721Token | EvmErc1155Token)[];
    setFilteredCollections(acceptedTokens);
    setDisplayedCollections(acceptedTokens);
  };

  const openAddCustomTokenPanel = () => {
    navigateTo(EvmScreen.EVM_CUSTOM_NFTS_PAGE);
  };

  const handleHideEmptyCard = async () => {
    await setCustomNftEmptyCardHiddenForChain(chain.chainId);
    setEmptyCardState((prev) => ({ ...prev, showCard: false }));
  };

  return (
    <div className="nft-gallery">
      {displayedCollections && !activeAccount.nfts.loading && (
        <>
          {(displayedCollections.length > 0 || isCustomChainSelected) && (
            <SeparatorWithFilter
              setFilterValue={setFilterValue}
              filterValue={filterValue}
              rightAction={
                isCustomChainSelected
                  ? {
                      icon: SVGIcons.WALLET_SETTINGS,
                      onClick: openAddCustomTokenPanel,
                    }
                  : undefined
              }
              filterDisabled={activeAccount.nfts.value.length === 0}
            />
          )}
          {emptyCardState.ready && emptyCardState.showCard && (
            <Card className="evm-custom-erc20-empty-card">
              <p
                className="evm-custom-erc20-empty-card__message"
                dangerouslySetInnerHTML={{
                  __html: chrome.i18n.getMessage(
                    'evm_custom_nft_empty_card_message',
                  ),
                }}></p>
              <button
                type="button"
                className="evm-custom-erc20-empty-card__hide"
                onClick={() => void handleHideEmptyCard()}>
                {chrome.i18n.getMessage('evm_custom_erc20_empty_card_hide')}
              </button>
            </Card>
          )}
          <FlatList
            list={displayedCollections}
            renderItem={(token: EvmErc721Token | EvmErc1155Token) => (
              <EvmWalletNftPreviewComponent
                token={token}
                onClick={() =>
                  onClickOnNftPreview(token, EvmScreen.EVM_NFT_COLLECTION_PAGE)
                }
                key={`${token.tokenInfo.contractAddress}`}
              />
            )}
            renderWhenEmpty={() => {
              if (emptyCardState.ready && emptyCardState.showCard) {
                return <></>;
              }
              return (
                <div className="no-nfts-found">
                  <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
                  <span className="text">
                    {chrome.i18n.getMessage('evm_no_nfts_found')}
                  </span>
                </div>
              );
            }}
            renderOnScroll
          />
        </>
      )}

      {activeAccount.nfts.loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const connector = connect(null, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmWalletNftGalleryComponent = connector(EvmWalletNftGallery);
