import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmCustomToken } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import {
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAddCustomAssetPopup,
  EvmCustomErc20FormData,
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

const EvmCustomTokensPage = ({
  chain,
  activeAccount,
  setTitleContainerProperties,
  loadEvmActiveAccount,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const [customTokens, setCustomTokens] = useState<EvmCustomToken[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingToken, setEditingToken] = useState<EvmCustomToken | null>(null);

  const loadTokens = useCallback(async () => {
    const tokens = await EvmTokensUtils.getCustomTokens(
      chain,
      activeAccount.wallet.address,
    );
    setCustomTokens(
      tokens.filter((t) => t.type === EVMSmartContractType.ERC20),
    );
  }, [chain, activeAccount.wallet.address]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_custom_tokens_page_title',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  const openDeleteTokenConfirmModal = (token: EvmCustomToken) => {
    const meta =
      token.metadata?.type === EVMSmartContractType.ERC20
        ? token.metadata
        : undefined;
    const label = meta?.symbol?.length
      ? meta.symbol
      : meta?.name?.length
        ? meta.name
        : EvmFormatUtils.formatAddress(token.address);
    openModal({
      title: 'evm_custom_tokens_delete',
      children: (
        <div className="evm-delete-confirm-modal">
          <p className="evm-delete-confirm-modal__message">
            {chrome.i18n.getMessage('evm_custom_tokens_delete_confirm', [
              label,
            ])}
          </p>
          <div className="evm-delete-confirm-modal__actions">
            <ButtonComponent
              dataTestId="evm-custom-token-delete-cancel"
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={() => closeModal()}
              height="small"
            />
            <ButtonComponent
              dataTestId="evm-custom-token-delete-confirm"
              label="popup_html_confirm"
              type={ButtonType.IMPORTANT}
              height="small"
              onClick={async () => {
                closeModal();
                try {
                  await EvmTokensUtils.removeCustomToken(
                    chain,
                    activeAccount.wallet.address,
                    token.address,
                    EVMSmartContractType.ERC20,
                  );
                  await loadEvmActiveAccount(chain, activeAccount.wallet);
                  await loadTokens();
                } catch {
                  await loadTokens();
                }
              }}
            />
          </div>
        </div>
      ),
    });
  };

  const closeTokenPopup = () => {
    setShowAddPopup(false);
    setEditingToken(null);
  };

  const saveCustomToken = async (form: EvmCustomErc20FormData) => {
    if (editingToken) {
      await EvmTokensUtils.updateCustomToken(
        chain,
        activeAccount.wallet.address,
        editingToken.address,
        EVMSmartContractType.ERC20,
        {
          type: EVMSmartContractType.ERC20,
          name: form.name,
          symbol: form.symbol,
          decimals: form.decimals,
          logo: form.logo,
        },
      );
    } else {
      await EvmTokensUtils.addCustomToken(chain, activeAccount.wallet.address, {
        address: form.contractAddress,
        type: EVMSmartContractType.ERC20,
        metadata: {
          type: EVMSmartContractType.ERC20,
          name: form.name,
          symbol: form.symbol,
          decimals: form.decimals,
          logo: form.logo,
        },
      });
    }
    closeTokenPopup();
    await loadEvmActiveAccount(chain, activeAccount.wallet);
    await loadTokens();
  };

  const erc20AddressesFromBalances =
    activeAccount.nativeAndErc20Tokens.value
      .filter(
        (t): t is typeof t & { tokenInfo: EvmSmartContractInfoErc20 } =>
          t.tokenInfo.type === EVMSmartContractType.ERC20,
      )
      .map((t) => t.tokenInfo.contractAddress) ?? [];

  return (
    <div className="evm-custom-tokens-page">
      <Card className="evm-custom-tokens-card">
        <p className="evm-custom-tokens-caption">
          {chrome.i18n.getMessage('evm_custom_tokens_page_caption')}
        </p>
        <div
          className="add-custom-token-link"
          data-testid="btn-add-custom-token-page"
          onClick={() => {
            setEditingToken(null);
            setShowAddPopup(true);
          }}>
          {chrome.i18n.getMessage('evm_add_custom_token')}
        </div>
        {customTokens.length === 0 ? (
          <p className="evm-custom-tokens-empty">
            {chrome.i18n.getMessage('evm_custom_tokens_page_empty')}
          </p>
        ) : (
          <ul className="evm-custom-tokens-list">
            {customTokens.map((token) => {
              const meta =
                token.metadata?.type === EVMSmartContractType.ERC20
                  ? token.metadata
                  : undefined;
              const displayName = meta?.symbol?.length
                ? meta.symbol
                : meta?.name?.length
                  ? meta.name
                  : EvmFormatUtils.formatAddress(token.address);
              return (
                <li key={token.address} className="evm-custom-tokens-list__item">
                  <div
                    className="evm-custom-tokens-list__item-main evm-custom-tokens-list__item-main--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setEditingToken(token);
                      setShowAddPopup(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingToken(token);
                        setShowAddPopup(true);
                      }
                    }}>
                    {meta?.logo != null && meta.logo.length > 0 && (
                      <img
                        className="evm-custom-tokens-list__logo"
                        src={meta.logo}
                        alt=""
                      />
                    )}
                    <div className="evm-custom-tokens-list__line">
                      <span className="evm-custom-tokens-list__name">
                        {displayName}
                      </span>
                      <span className="evm-custom-tokens-list__contract-address">
                        ({EvmFormatUtils.formatAddress(token.address)})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="evm-custom-tokens-list__delete"
                    data-testid={`btn-delete-custom-token-${token.address}`}
                    title={chrome.i18n.getMessage('evm_custom_tokens_delete')}
                    aria-label={chrome.i18n.getMessage('evm_custom_tokens_delete')}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteTokenConfirmModal(token);
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
          mode="erc20"
          walletAddress={activeAccount.wallet.address}
          existingAddresses={erc20AddressesFromBalances}
          tokenToEdit={editingToken}
          onClose={closeTokenPopup}
          onSave={saveCustomToken}
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
  loadEvmActiveAccount,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomTokensPageComponent = connector(EvmCustomTokensPage);
