import CheckboxComponent from '@common-ui/checkbox/checkbox/checkbox.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { AddCustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/add-custom-evm-chain-form.component';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Badge, BadgeType } from 'src/common-ui/badge/badge.component';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface ChainSelectorProps {
  hideTitle?: boolean;
}

const ChainSelector = ({
  chain,
  activeAccount,
  setChain,
  openModal,
  closeModal,
  hideTitle,
}: PropsFromRedux & ChainSelectorProps) => {
  const [setupChains, setSetupChains] = useState<Chain[]>([]);
  const [defaultChains, setDefaultChains] = useState<Chain[]>([]);
  const [customChains, setCustomChains] = useState<EvmChain[]>([]);
  const [showTestnets, setShowTestnets] = useState(false);
  const [search, setSearch] = useState('');

  const init = useCallback(async () => {
    const [setup, defaults, custom] = await Promise.all([
      ChainUtils.getSetupChains(),
      ChainUtils.getDefaultChains(),
      ChainUtils.getCustomChains(),
    ]);
    setSetupChains(setup ?? []);
    setDefaultChains(defaults ?? []);
    setCustomChains(custom ?? []);
  }, []);

  useEffect(() => {
    void init();
  }, [chain, init]);

  const selectChain = async (selectedChain: Chain) => {
    if (
      activeAccount?.address &&
      selectedChain.type === ChainType.EVM &&
      !(selectedChain as EvmChain).isCustom
    ) {
      await EvmLightNodeUtils.registerAddress(
        selectedChain.chainId,
        activeAccount.address,
        false,
      );
    }
    setChain(selectedChain);
  };

  const onCloseClicked = async () => {
    const previousChain = ChainUtils.getPreviousChain();
    if (previousChain) setChain(previousChain);
    else if (setupChains.length > 0) setChain(setupChains[0]);
  };

  const searchValue = search.trim().toLowerCase();
  const setupChainIds = new Set(
    setupChains.map((setupChain) => setupChain.chainId.toLowerCase()),
  );

  if (chain?.chainId) {
    setupChainIds.add(chain.chainId.toLowerCase());
  }

  const filterChains = (chainToFilter: Chain) => {
    if (!searchValue) return true;
    return (
      chainToFilter.chainId.toLowerCase().includes(searchValue) ||
      chainToFilter.name.toLowerCase().includes(searchValue) ||
      (chainToFilter.type === ChainType.EVM &&
        (chainToFilter as EvmChain).mainToken
          .toLowerCase()
          .includes(searchValue))
    );
  };

  const builtInEvmChains = defaultChains.filter(
    (defaultChain) =>
      defaultChain.type === ChainType.EVM && !defaultChain.isCustom,
  );
  const popularChains = builtInEvmChains
    .filter((defaultChain) => !defaultChain.testnet)
    .filter(filterChains);
  const testnetChains = builtInEvmChains
    .filter((defaultChain) => !!defaultChain.testnet)
    .filter(filterChains);
  const filteredCustomChains = customChains.filter(filterChains);
  const shouldShowTestnets =
    showTestnets || (!!searchValue && testnetChains.length > 0);
  const hasFilteredChainResults =
    popularChains.length > 0 ||
    (shouldShowTestnets && testnetChains.length > 0) ||
    filteredCustomChains.length > 0;

  const isChainEnabled = (chainToCheck: Chain) =>
    setupChainIds.has(chainToCheck.chainId.toLowerCase());

  const openAddModal = () => {
    openModal({
      title: 'evm_custom_chains_modal_title',
      closeOnOverlayClick: true,
      showCloseButton: true,
      children: (
        <AddCustomEvmChainForm
          key="add-custom-chain"
          onCancel={() => closeModal()}
          onSuccess={async () => {
            closeModal();
            await init();
          }}
        />
      ),
    });
  };

  const openEditModal = (customChain: EvmChain) => {
    openModal({
      title: 'evm_custom_chains_modal_title_edit',
      closeOnOverlayClick: true,
      showCloseButton: true,
      children: (
        <AddCustomEvmChainForm
          key={`edit-custom-chain-${customChain.chainId}`}
          chainToEdit={customChain}
          onCancel={() => closeModal()}
          onSuccess={async () => {
            closeModal();
            await init();
          }}
        />
      ),
    });
  };

  const toggleBuiltInChain = async (selectedChain: Chain) => {
    const enabled = isChainEnabled(selectedChain);
    if (enabled) {
      await selectChain(selectedChain);
      return;
    }

    await ChainUtils.addChainToSetupChains(selectedChain);
    await init();
    await selectChain(selectedChain);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    callback: () => void,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const renderBuiltInChainCard = (builtInChain: Chain) => {
    const enabled = isChainEnabled(builtInChain);
    return (
      <div
        key={`chain-${builtInChain.chainId}`}
        className={`chain-card chain-card--built-in ${
          enabled ? 'chain-card--enabled' : 'chain-card--disabled'
        }`}
        role="button"
        tabIndex={0}
        onClick={() => void toggleBuiltInChain(builtInChain)}
        onKeyDown={(event) =>
          handleCardKeyDown(event, () => void toggleBuiltInChain(builtInChain))
        }>
        <ChainLogo
          chainName={builtInChain.name}
          logoUri={builtInChain.logo}
          className="chain-card__logo"
        />
        <div className="chain-name">{builtInChain.name}</div>
        {enabled && (
          <SVGIcon icon={SVGIcons.SELECT_ACTIVE} className="check-icon" />
        )}
        <div className="chain-card__meta-row">
          <div className="chain-card__badge">
            <Badge
              small
              badgeType={
                builtInChain.testnet ? BadgeType.TESTNET : BadgeType.MAINNET
              }
              inverted
            />
          </div>
          {!enabled && (
            <SVGIcon icon={SVGIcons.SELECT_ADD} className="add-icon" />
          )}
        </div>
      </div>
    );
  };

  const renderCustomChainCard = (customChain: EvmChain) => (
    <div
      key={`custom-chain-${customChain.chainId}`}
      className="chain-card chain-card--custom">
      <ChainLogo
        chainName={customChain.name}
        logoUri={customChain.logo}
        className="chain-card__logo"
      />
      <button
        type="button"
        className="custom-chain-settings-icon"
        aria-label={chrome.i18n.getMessage(
          'evm_custom_chains_modal_title_edit',
        )}
        onClick={() => openEditModal(customChain)}>
        <SVGIcon icon={SVGIcons.WALLET_SETTINGS} svgViewBox="10 10 24 24" />
      </button>
      <div className="chain-name">{customChain.name}</div>
      <div className="chain-card__meta-row">
        <Badge
          small
          badgeType={customChain.testnet ? BadgeType.TESTNET : BadgeType.MAINNET}
          inverted
        />
      </div>
    </div>
  );

  return (
    <>
      {!hideTitle && (
        <PageTitleComponent
          title="html_popup_manage_chains"
          isBackButtonEnabled={setupChains.length > 0}
          isCloseButtonDisabled
          onBackAdditional={onCloseClicked}></PageTitleComponent>
      )}
      <div
        className={`chain-selector-page ${
          hideTitle ? 'chain-selector-page--embedded' : ''
        }`}>
        <div className="search-container">
          <InputComponent
            classname="search-input"
            value={search}
            onChange={setSearch}
            placeholder="html_popup_search_chains"
            type={InputType.TEXT}
          />
          <CheckboxComponent
            checked={showTestnets}
            onChange={setShowTestnets}
            title="popup_html_show_testnets"
          />
        </div>

        <div className="lists-container">
          {!!searchValue && !hasFilteredChainResults && (
            <p className="chain-selector-empty">
              {chrome.i18n.getMessage('html_popup_manage_chains_empty_results')}
            </p>
          )}
          {popularChains.length > 0 && (
            <div className="chain-cards-container">
              <div className="chain-cards-container-title">
                {chrome.i18n.getMessage('html_popup_popular_chains')}
              </div>
              <div className="chain-cards-container-list">
                {popularChains.map(renderBuiltInChainCard)}
              </div>
            </div>
          )}
          {shouldShowTestnets && testnetChains.length > 0 && (
            <div className="chain-cards-container">
              <div className="chain-cards-container-title">
                {chrome.i18n.getMessage('html_popup_testnet_chains')}
              </div>
              <div className="chain-cards-container-list">
                {testnetChains.map(renderBuiltInChainCard)}
              </div>
            </div>
          )}
          <div className="chain-cards-container">
            <div className="chain-cards-container-title">
              {chrome.i18n.getMessage('html_popup_custom_chains')}
            </div>
            <div className="chain-cards-container-list">
              {filteredCustomChains.map(renderCustomChainCard)}
              <div
                key="add-custom-chain"
                className="chain-card add-custom-chain"
                role="button"
                tabIndex={0}
                onClick={openAddModal}
                onKeyDown={(event) => handleCardKeyDown(event, openAddModal)}>
                <SVGIcon icon={SVGIcons.SELECT_ADD} />
                <div className="chain-name">
                  {chrome.i18n.getMessage('evm_custom_chains_add')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm?.activeAccount,
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  setChain,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainSelectorPageComponent = connector(ChainSelector);
