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

  const handleAddClick = () => {
    openModal({
      title: 'evm_custom_chains_modal_title',
      children: (
        <AddCustomEvmChainForm
          onCancel={() => closeModal()}
          onSuccess={async () => {
            closeModal();
            await loadChains();
          }}
        />
      ),
    });
  };

  return (
    <div className="evm-custom-chains-page">
      <Card className="evm-custom-chains-card">
        <p className="evm-custom-chains-caption">
          {chrome.i18n.getMessage('evm_custom_chains_caption')}
        </p>
        <ButtonComponent
          label="evm_custom_chains_add"
          onClick={handleAddClick}
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
                {c.logo?.length > 0 && (
                  <img
                    className="evm-custom-chains-list__logo"
                    src={c.logo}
                    alt=""
                  />
                )}
                <div className="evm-custom-chains-list__text">
                  <div className="evm-custom-chains-list__name">{c.name}</div>
                  <div className="evm-custom-chains-list__meta">
                    <span>{c.chainId}</span>
                    {c.testnet && (
                      <span className="evm-custom-chains-list__testnet">
                        {chrome.i18n.getMessage('common_testnet')}
                      </span>
                    )}
                  </div>
                  {c.rpcs && c.rpcs.length > 0 && (
                    <div className="evm-custom-chains-list__rpc-list">
                      {c.rpcs.map((rpc) => (
                        <div
                          key={rpc.url}
                          className="evm-custom-chains-list__rpc">
                          {rpc.url}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
