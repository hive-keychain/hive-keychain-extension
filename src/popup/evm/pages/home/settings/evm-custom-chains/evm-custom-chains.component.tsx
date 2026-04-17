import ButtonComponent from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import { AddCustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/add-custom-evm-chain-form.component';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const EvmCustomChains = ({
  setTitleContainerProperties,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const [customChains, setCustomChains] = useState<EvmChain[]>([]);

  const loadChains = useCallback(async () => {
    setCustomChains(await ChainUtils.getCustomChains());
  }, []);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_custom_chains',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    loadChains();
  }, [loadChains, setTitleContainerProperties]);

  const openAddModal = () => {
    openModal({
      title: 'evm_custom_chains_modal_title',
      children: (
        <AddCustomEvmChainForm
          key="add-custom-chain"
          onCancel={() => closeModal()}
          onSuccess={async () => {
            closeModal();
            await loadChains();
          }}
        />
      ),
    });
  };

  const openEditModal = (chain: EvmChain) => {
    openModal({
      title: 'evm_custom_chains_modal_title_edit',
      children: (
        <AddCustomEvmChainForm
          key={`edit-custom-chain-${chain.chainId}`}
          chainToEdit={chain}
          onCancel={() => closeModal()}
          onSuccess={async () => {
            closeModal();
            await loadChains();
          }}
        />
      ),
    });
  };

  const confirmDeleteCustomChain = async (chain: EvmChain) => {
    const confirmed = window.confirm(
      chrome.i18n.getMessage('evm_custom_chains_delete_confirm', [chain.name]),
    );
    if (!confirmed) return;
    try {
      await ChainUtils.removeCustomChain(chain.chainId);
      await loadChains();
    } catch {
      // Storage race or list out of sync; refresh list
      await loadChains();
    }
  };

  return (
    <div className="evm-custom-chains-page">
      <Card className="evm-custom-chains-card">
        <p className="evm-custom-chains-caption">
          {chrome.i18n.getMessage('evm_custom_chains_caption')}
        </p>
        <ButtonComponent
          label="evm_custom_chains_add"
          onClick={openAddModal}
          dataTestId="btn-add-custom-chain"
        />
        {customChains.length === 0 ? (
          <p className="evm-custom-chains-empty">
            {chrome.i18n.getMessage('evm_custom_chains_empty')}
          </p>
        ) : (
          <ul className="evm-custom-chains-list">
            {customChains.map((c) => (
              <li key={c.chainId} className="evm-custom-chains-list__item">
                <div
                  className="evm-custom-chains-list__item-main evm-custom-chains-list__item-main--clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openEditModal(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEditModal(c);
                    }
                  }}>
                  {c.logo?.length > 0 && (
                    <img
                      className="evm-custom-chains-list__logo"
                      src={c.logo}
                      alt=""
                    />
                  )}
                  <div className="evm-custom-chains-list__line">
                    <span className="evm-custom-chains-list__name">{c.name}</span>
                    <span className="evm-custom-chains-list__chain-id">
                      ({c.chainId})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="evm-custom-chains-list__delete"
                  data-testid={`btn-delete-custom-chain-${c.chainId}`}
                  title={chrome.i18n.getMessage('evm_custom_chains_delete')}
                  aria-label={chrome.i18n.getMessage('evm_custom_chains_delete')}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteCustomChain(c);
                  }}>
                  <SVGIcon icon={SVGIcons.GLOBAL_DELETE} className="svg-icon" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const mapStateToProps = (_state: RootState) => ({});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomChainsComponent = connector(EvmCustomChains);
