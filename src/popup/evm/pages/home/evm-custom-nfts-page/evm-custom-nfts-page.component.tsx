import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import { loadEvmActiveAccountNfts } from '@popup/evm/actions/active-account.actions';
import { EvmCustomNft } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAddCustomAssetPopup,
  EvmCustomErc20FormData,
  EvmCustomNftFormData,
} from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-add-custom-asset-popup.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const EvmCustomNftsPage = ({
  chain,
  activeAccount,
  setTitleContainerProperties,
  loadEvmActiveAccountNfts,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const [customNfts, setCustomNfts] = useState<EvmCustomNft[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingNft, setEditingNft] = useState<EvmCustomNft | null>(null);

  const loadNfts = useCallback(async () => {
    const nfts = await EvmTokensUtils.getCustomNfts(
      chain,
      activeAccount.wallet.address,
    );
    setCustomNfts(nfts);
  }, [chain, activeAccount.wallet.address]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_custom_nfts_page_title',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  useEffect(() => {
    void loadNfts();
  }, [loadNfts]);

  const refreshNfts = async () => {
    await loadEvmActiveAccountNfts(chain, activeAccount.wallet);
    await loadNfts();
  };

  const openDeleteNftConfirmModal = (nft: EvmCustomNft) => {
    openModal({
      title: 'evm_custom_nfts_delete',
      children: (
        <div className="evm-delete-confirm-modal">
          <p className="evm-delete-confirm-modal__message">
            {chrome.i18n.getMessage('evm_custom_nfts_delete_confirm', [
              EvmFormatUtils.formatAddress(nft.address),
            ])}
          </p>
          <div className="evm-delete-confirm-modal__actions">
            <ButtonComponent
              dataTestId="evm-custom-nft-delete-cancel"
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={() => closeModal()}
              height="small"
            />
            <ButtonComponent
              dataTestId="evm-custom-nft-delete-confirm"
              label="popup_html_confirm"
              type={ButtonType.IMPORTANT}
              height="small"
              onClick={async () => {
                closeModal();
                try {
                  await EvmTokensUtils.removeCustomNft(
                    chain,
                    activeAccount.wallet.address,
                    nft.address,
                    nft.type,
                  );
                } finally {
                  await refreshNfts();
                }
              }}
            />
          </div>
        </div>
      ),
    });
  };

  const closeNftPopup = () => {
    setShowAddPopup(false);
    setEditingNft(null);
  };

  const saveCustomNft = async (form: EvmCustomNftFormData) => {
    if (editingNft) {
      await EvmTokensUtils.updateCustomNft(
        chain,
        activeAccount.wallet.address,
        editingNft.address,
        editingNft.type,
        form.tokenIds,
      );
    } else {
      await EvmTokensUtils.addCustomNft(chain, activeAccount.wallet.address, {
        address: form.contractAddress,
        type: form.type,
        tokenIds: form.tokenIds,
      });
    }
    closeNftPopup();
    await refreshNfts();
  };

  return (
    <div className="evm-custom-tokens-page evm-custom-nfts-page">
      <Card className="evm-custom-tokens-card">
        <p className="evm-custom-tokens-caption">
          {chrome.i18n.getMessage('evm_custom_nfts_page_caption')}
        </p>
        <div
          className="add-custom-token-link"
          data-testid="btn-add-custom-nft-page"
          onClick={() => {
            setEditingNft(null);
            setShowAddPopup(true);
          }}>
          {chrome.i18n.getMessage('evm_add_custom_nft')}
        </div>
        {customNfts.length === 0 ? (
          <p className="evm-custom-tokens-empty">
            {chrome.i18n.getMessage('evm_custom_nfts_page_empty')}
          </p>
        ) : (
          <ul className="evm-custom-tokens-list">
            {customNfts.map((nft) => {
              const typeLabel =
                nft.type === EVMSmartContractType.ERC1155 ? 'ERC1155' : 'ERC721';
              return (
                <li key={nft.address} className="evm-custom-tokens-list__item">
                  <div
                    className="evm-custom-tokens-list__item-main evm-custom-tokens-list__item-main--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setEditingNft(nft);
                      setShowAddPopup(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingNft(nft);
                        setShowAddPopup(true);
                      }
                    }}>
                    <div className="evm-custom-nfts-list__line-group">
                      <div className="evm-custom-tokens-list__line">
                        <span className="evm-custom-tokens-list__name">
                          {EvmFormatUtils.formatAddress(nft.address)}
                        </span>
                        <span className="evm-custom-tokens-list__contract-address">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="evm-custom-nfts-list__meta">
                        {chrome.i18n.getMessage('evm_custom_nfts_token_count', [
                          String(nft.tokenIds.length),
                        ])}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="evm-custom-tokens-list__delete"
                    data-testid={`btn-delete-custom-nft-${nft.address}`}
                    title={chrome.i18n.getMessage('evm_custom_nfts_delete')}
                    aria-label={chrome.i18n.getMessage('evm_custom_nfts_delete')}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteNftConfirmModal(nft);
                    }}>
                    <SVGIcon icon={SVGIcons.GLOBAL_DELETE} className="svg-icon" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {showAddPopup && (
        <EvmAddCustomAssetPopup
          chain={chain}
          mode="nft"
          walletAddress={activeAccount.wallet.address}
          existingAddresses={activeAccount.nfts.value.map(
            (collection) => collection.tokenInfo.contractAddress,
          )}
          tokenToEdit={editingNft}
          onClose={closeNftPopup}
          onSave={
            saveCustomNft as (
              form: EvmCustomErc20FormData | EvmCustomNftFormData,
            ) => Promise<void>
          }
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  chain: state.chain as EvmChain,
  activeAccount: state.evm.activeAccount,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  loadEvmActiveAccountNfts,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomNftsPageComponent = connector(EvmCustomNftsPage);
