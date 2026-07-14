import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import type { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmCustomToken } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAddCustomAssetPopup,
  EvmCustomErc20FormData,
  EvmCustomNftFormData,
} from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-add-custom-asset-popup.component';
import { EvmKnownTokenList } from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-known-token-list.component';
import { EvmTokenListItemComponent } from '@popup/evm/pages/home/evm-token-list-item/evm-token-list-item.component';
import { EvmAutoDetectedTokenVisibilityUtils } from '@popup/evm/utils/evm-auto-detected-token-visibility.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import type { DiscoveredErc20Token } from '@popup/evm/utils/evm-light-node.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';

const normalizeTokenAddress = (address: string) =>
  address.trim().toLowerCase();

const parseRawTokenBalance = (balance?: string) => {
  const normalizedBalance = balance?.trim();
  return normalizedBalance && /^\d+$/.test(normalizedBalance)
    ? BigInt(normalizedBalance)
    : BigInt(0);
};

const getActiveErc20TokenBalancesByAddress = (
  tokens: NativeAndErc20Token[],
) => {
  const tokenBalancesByAddress = new Map<string, NativeAndErc20Token>();

  tokens.forEach((token) => {
    if (token.tokenInfo.type !== EVMSmartContractType.ERC20) {
      return;
    }

    tokenBalancesByAddress.set(
      normalizeTokenAddress(token.tokenInfo.contractAddress),
      token,
    );
  });

  return tokenBalancesByAddress;
};

const getSortableAutoDetectedTokenBalance = (
  token: DiscoveredErc20Token,
  activeTokenBalancesByAddress: Map<string, NativeAndErc20Token>,
): NativeAndErc20Token => {
  const activeTokenBalance = activeTokenBalancesByAddress.get(
    normalizeTokenAddress(token.contractAddress),
  );

  if (activeTokenBalance) {
    return {
      ...activeTokenBalance,
      tokenInfo: token,
    };
  }

  const formattedBalance = token.formattedBalance ?? '0';
  return {
    formattedBalance,
    shortFormattedBalance: formattedBalance,
    balance: parseRawTokenBalance(token.balance),
    balanceInteger: Number(formattedBalance) || 0,
    tokenInfo: token,
  };
};

const getVisibleAutoDetectedTokens = async (
  tokens: DiscoveredErc20Token[],
  activeTokens: NativeAndErc20Token[],
) => {
  const activeTokenBalancesByAddress =
    getActiveErc20TokenBalancesByAddress(activeTokens);
  const sortableTokenBalances = tokens.map((token) =>
    getSortableAutoDetectedTokenBalance(token, activeTokenBalancesByAddress),
  );
  const filteredTokenBalances =
    (await EvmTokensUtils.filterTokensBasedOnSettings(
      sortableTokenBalances,
    )) as NativeAndErc20Token[];

  return EvmTokensUtils.sortTokens(filteredTokenBalances).map(
    (tokenBalance) => tokenBalance.tokenInfo as DiscoveredErc20Token,
  );
};

const EvmCustomTokensPage = ({
  chain,
  activeAccount,
  setTitleContainerProperties,
  loadEvmActiveAccount,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const [customTokens, setCustomTokens] = useState<EvmCustomToken[]>([]);
  const [autoDetectedTokens, setAutoDetectedTokens] = useState<
    DiscoveredErc20Token[]
  >([]);
  const [
    hiddenAutoDetectedTokenAddresses,
    setHiddenAutoDetectedTokenAddresses,
  ] = useState<string[]>([]);
  const [isLoadingAutoDetectedTokens, setIsLoadingAutoDetectedTokens] =
    useState(false);
  const [autoDetectedTokensError, setAutoDetectedTokensError] = useState<
    string | null
  >(null);
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

  const loadAutoDetectedTokens = useCallback(async () => {
    if (chain.isCustom === true) {
      setAutoDetectedTokens([]);
      setHiddenAutoDetectedTokenAddresses([]);
      setAutoDetectedTokensError(null);
      setIsLoadingAutoDetectedTokens(false);
      return;
    }

    setIsLoadingAutoDetectedTokens(true);
    setAutoDetectedTokensError(null);

    try {
      const [discoveredTokens, hiddenTokens] = await Promise.all([
        EvmLightNodeUtils.getDiscoveredTokens(
          chain.chainId,
          activeAccount.wallet.address,
        ),
        EvmAutoDetectedTokenVisibilityUtils.getHiddenAutoDetectedTokenAddresses(
          chain.chainId,
        ),
      ]);

      const discoveredErc20Tokens = discoveredTokens.tokens.filter(
        (token): token is DiscoveredErc20Token =>
          token.type === EVMSmartContractType.ERC20,
      );

      setAutoDetectedTokens(
        await getVisibleAutoDetectedTokens(
          discoveredErc20Tokens,
          activeAccount.nativeAndErc20Tokens.value,
        ),
      );
      setHiddenAutoDetectedTokenAddresses(hiddenTokens);
    } catch {
      setAutoDetectedTokens([]);
      setAutoDetectedTokensError(
        I18nUtils.getMessage('evm_auto_detected_tokens_error_loading'),
      );
    } finally {
      setIsLoadingAutoDetectedTokens(false);
    }
  }, [
    activeAccount.nativeAndErc20Tokens.value,
    activeAccount.wallet.address,
    chain,
  ]);

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

  useEffect(() => {
    void loadAutoDetectedTokens();
  }, [loadAutoDetectedTokens]);

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
            {I18nUtils.getMessage('evm_custom_tokens_delete_confirm', [
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

  const customTokenAddresses = customTokens.map((token) => token.address);
  const knownTokenExistingAddresses = [
    ...customTokenAddresses,
    ...autoDetectedTokens.map((token) => token.contractAddress),
  ];
  const hiddenAutoDetectedTokenAddressSet = new Set(
    hiddenAutoDetectedTokenAddresses.map((address) =>
      address.trim().toLowerCase(),
    ),
  );

  const toggleAutoDetectedTokenVisibility = async (
    token: DiscoveredErc20Token,
  ) => {
    const normalizedAddress = token.contractAddress.trim().toLowerCase();
    if (!normalizedAddress) {
      return;
    }

    if (hiddenAutoDetectedTokenAddressSet.has(normalizedAddress)) {
      await EvmAutoDetectedTokenVisibilityUtils.restoreAutoDetectedToken(
        chain.chainId,
        token.contractAddress,
      );
      setHiddenAutoDetectedTokenAddresses((current) =>
        current
          .map((address) => address.trim().toLowerCase())
          .filter((address) => address !== normalizedAddress),
      );
      return;
    }

    await EvmAutoDetectedTokenVisibilityUtils.hideAutoDetectedToken(
      chain.chainId,
      token.contractAddress,
    );
    setHiddenAutoDetectedTokenAddresses((current) =>
      Array.from(
        new Set([
          ...current.map((address) => address.trim().toLowerCase()),
          normalizedAddress,
        ]),
      ),
    );
  };

  return (
    <div className="evm-custom-tokens-page">
      <Card className="evm-custom-tokens-card">
        <p className="evm-custom-tokens-caption">
          {I18nUtils.getMessage('evm_custom_tokens_page_caption')}
        </p>

        {chain.isCustom !== true && (
          <div className="evm-custom-tokens-add-section">
            <div className="evm-custom-tokens-section-title">
              {I18nUtils.getMessage('evm_auto_detected_tokens_section_title')}
            </div>

            {isLoadingAutoDetectedTokens && (
              <div className="popup-note">
                {I18nUtils.getMessage('evm_auto_detected_tokens_loading')}
              </div>
            )}

            {!isLoadingAutoDetectedTokens && autoDetectedTokensError && (
              <div className="error-message">{autoDetectedTokensError}</div>
            )}

            {!isLoadingAutoDetectedTokens &&
              !autoDetectedTokensError &&
              autoDetectedTokens.length === 0 && (
                <div className="popup-note">
                  {I18nUtils.getMessage('evm_auto_detected_tokens_empty')}
                </div>
              )}

            {!isLoadingAutoDetectedTokens &&
              !autoDetectedTokensError &&
              autoDetectedTokens.length > 0 && (
                <div className="known-token-items">
                  {autoDetectedTokens.map((token) => {
                    const normalizedAddress = token.contractAddress
                      .trim()
                      .toLowerCase();
                    const isHidden =
                      hiddenAutoDetectedTokenAddressSet.has(normalizedAddress);
                    return (
                      <EvmTokenListItemComponent
                        key={`${token.chainId}-${token.contractAddress}`}
                        address={token.contractAddress}
                        logo={token.logo ?? ''}
                        name={token.name ?? ''}
                        symbol={token.symbol ?? ''}
                        dataTestId={`auto-detected-token-item-${token.contractAddress}`}
                        action={
                          <button
                            type="button"
                            className="known-token-visibility-button"
                            aria-label={I18nUtils.getMessage(
                              isHidden
                                ? 'evm_auto_detected_tokens_restore'
                                : 'evm_auto_detected_tokens_hide',
                            )}
                            title={I18nUtils.getMessage(
                              isHidden
                                ? 'evm_auto_detected_tokens_restore'
                                : 'evm_auto_detected_tokens_hide',
                            )}
                            data-testid={`auto-detected-token-toggle-${token.contractAddress}`}
                            onClick={() =>
                              void toggleAutoDetectedTokenVisibility(token)
                            }>
                            <SVGIcon
                              icon={
                                isHidden
                                  ? SVGIcons.INPUT_HIDE
                                  : SVGIcons.INPUT_SHOW
                              }
                            />
                          </button>
                        }
                      />
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {customTokens.length === 0 ? (
          <p className="evm-custom-tokens-empty">
            {I18nUtils.getMessage('evm_custom_tokens_page_empty')}
          </p>
        ) : (
          <ul className="evm-custom-tokens-list">
            {customTokens.map((token) => {
              const meta =
                token.metadata?.type === EVMSmartContractType.ERC20
                  ? token.metadata
                  : undefined;
              return (
                <EvmTokenListItemComponent
                  key={token.address}
                  container="li"
                  className="evm-custom-tokens-list__item"
                  address={token.address}
                  logo={meta?.logo ?? ''}
                  name={meta?.name ?? ''}
                  symbol={meta?.symbol ?? ''}
                  contentClassName="evm-custom-tokens-list__item-main evm-custom-tokens-list__item-main--clickable known-token-row-main"
                  contentProps={{
                    role: 'button',
                    tabIndex: 0,
                    onClick: () => {
                      setEditingToken(token);
                      setShowAddPopup(true);
                    },
                    onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingToken(token);
                        setShowAddPopup(true);
                      }
                    },
                  }}
                  action={
                    <button
                      type="button"
                      className="evm-custom-tokens-list__delete"
                      data-testid={`btn-delete-custom-token-${token.address}`}
                      title={I18nUtils.getMessage('evm_custom_tokens_delete')}
                      aria-label={I18nUtils.getMessage(
                        'evm_custom_tokens_delete',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteTokenConfirmModal(token);
                      }}>
                      <SVGIcon
                        icon={SVGIcons.GLOBAL_DELETE}
                        className="svg-icon"
                      />
                    </button>
                  }
                />
              );
            })}
          </ul>
        )}

        <div className="evm-custom-tokens-add-section">
          <div className="evm-custom-tokens-section-title">
            {I18nUtils.getMessage('evm_custom_tokens_add_section_title')}
          </div>
          <EvmKnownTokenList
            chain={chain}
            existingAddresses={knownTokenExistingAddresses}
            onSave={saveCustomToken}
          />
        </div>
      </Card>
      <div className="evm-custom-tokens-manual-action">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          label="evm_add_custom_token_manually"
          dataTestId="btn-add-custom-token-page"
          onClick={() => {
            setEditingToken(null);
            setShowAddPopup(true);
          }}
        />
      </div>
      {showAddPopup && (
        <EvmAddCustomAssetPopup
          chain={chain}
          mode="erc20"
          walletAddress={activeAccount.wallet.address}
          existingAddresses={customTokenAddresses}
          tokenToEdit={editingToken}
          onClose={closeTokenPopup}
          onSave={
            saveCustomToken as (
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
  loadEvmActiveAccount,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomTokensPageComponent = connector(EvmCustomTokensPage);
