import ButtonComponent from '@common-ui/button/button.component';
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
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmCustomTokensPage = ({
  chain,
  activeAccount,
  setTitleContainerProperties,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [customTokens, setCustomTokens] = useState<EvmCustomToken[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);

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

  const saveCustomToken = async (form: EvmCustomErc20FormData) => {
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
    setShowAddPopup(false);
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
        <ButtonComponent
          label="evm_add_custom_token"
          onClick={() => setShowAddPopup(true)}
          dataTestId="btn-add-custom-token-page"
        />
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
              const label = meta?.symbol?.length
                ? meta.symbol
                : EvmFormatUtils.formatAddress(token.address);
              const sub = meta?.name?.length
                ? meta.name
                : EvmFormatUtils.formatAddress(token.address);
              return (
                <li key={token.address} className="evm-custom-tokens-list__item">
                  <div className="evm-custom-tokens-list__line">
                    <span className="evm-custom-tokens-list__symbol">{label}</span>
                    <span className="evm-custom-tokens-list__name">{sub}</span>
                  </div>
                  <span className="evm-custom-tokens-list__address">
                    {EvmFormatUtils.formatAddress(token.address)}
                  </span>
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
          onClose={() => setShowAddPopup(false)}
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
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmCustomTokensPageComponent = connector(EvmCustomTokensPage);
