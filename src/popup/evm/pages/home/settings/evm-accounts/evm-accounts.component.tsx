import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import {
  EvmAccount,
  EvmAccountOrPublic,
  EvmAccountSource,
} from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountsContextualMenu } from '@popup/evm/pages/home/settings/evm-accounts/evm-accounts.contextual-menu';
import { getEvmAccountsDefaultSeedOption } from '@popup/evm/pages/home/settings/evm-accounts/evm-accounts-selection.utils';
import {
  EditAccountParams,
  EvmEditAccountPopup,
} from '@popup/evm/pages/home/settings/evm-accounts/evm-edit-account-popup/evm-edit-account-popup.component';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ContextualMenuComponent } from 'src/common-ui/contextual-menu/contextual-menu.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

const EvmAccounts = ({
  accounts,
  mk,
  chain,
  setTitleContainerProperties,
  setEvmAccounts,
  loadEvmActiveAccount,
  evmAccountsNavigationParams,
  evmAccountsRestoreParams,
}: PropsType) => {
  const [selectedSeed, setSelectedSeed] = useState<OptionItem>();
  const [seedsOptions, setSeedsOptions] = useState<OptionItem[]>();

  const [editParams, setEditParams] = useState<EditAccountParams>();
  const [accountToDelete, setAccountToDelete] = useState<EvmAccount>();

  const [localAccounts, setLocalAccounts] = useState<EvmAccount[]>(accounts);

  const accountListDiv = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    setTitleContainerProperties({
      title: 'evm_seeds_and_accounts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
      onCloseAdditional: async () => {
        await onLeavePage();
      },
      onBackAdditional: async () => {
        await onLeavePage();
      },
    });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    initializeOptions();
    setLocalAccounts(accounts);
  }, []);

  const onLeavePage = async () => {
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    setEvmAccounts(accounts);
    const newActiveAccount =
      await EvmActiveAccountUtils.getSavedActiveAccountWallet(chain, accounts);
    loadEvmActiveAccount(chain, newActiveAccount);
  };

  const isCurrentSourceLedger = () => {
    const currentSeed = getCurrentSeed();
    return currentSeed?.source === EvmAccountSource.LEDGER;
  };

  const isCurrentSourceImported = () => {
    const currentSeed = getCurrentSeed();
    return currentSeed?.source === EvmAccountSource.IMPORTED;
  };

  const isCurrentSourceSeed = () => {
    const currentSeed = getCurrentSeed();
    return currentSeed?.source === EvmAccountSource.SEED;
  };

  const getSeedOptionLabel = (account: EvmAccount) => {
    if (account.source === EvmAccountSource.IMPORTED) {
      return chrome.i18n.getMessage('evm_imported_seed');
    }

    return (
      account.seedNickname ||
      `${chrome.i18n.getMessage('common_seed')} #${account.seedId}`
    );
  };

  const buildSeedOptions = (accounts: EvmAccount[]) => {
    const options: OptionItem[] = [];
    for (const account of accounts) {
      if (!options.some((option) => option.value === account.seedId)) {
        options.push({
          value: account.seedId,
          label: getSeedOptionLabel(account),
        });
      }
    }

    return options;
  };

  const initializeOptions = () => {
    const options = buildSeedOptions(accounts);
    setSeedsOptions(options);
    setSelectedSeed(
      getEvmAccountsDefaultSeedOption(
        accounts,
        options,
        evmAccountsNavigationParams,
        evmAccountsRestoreParams,
      ),
    );
  };

  const onCopyAddress = (account: EvmAccountOrPublic) => {
    void copyTextWithToast(
      EvmAccountUtils.getEvmAccountAddress(account),
      COPY_GENERIC_MESSAGE_KEY,
    );
  };

  const handleAddAddressClick = () => {
    setEditParams({
      initialValue: '',
      onSubmit: (newNickname: string) => handleConfirmAddAddress(newNickname),
      onCancel: closePopup,
      title: 'evm_add_nickname_to_address_popup_title',
      caption: 'evm_add_nickname_to_address_popup_caption',
    });
  };

  const handleConfirmAddAddress = async (addressNickname: string) => {
    await EvmWalletUtils.addAddressToSeed(
      selectedSeed?.value,
      mk,
      addressNickname,
    );
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    const account = accounts.find(
      (account) => account.seedId === selectedSeed!.value,
    );
    if (!isMountedRef.current) return;

    // setEvmAccounts(accounts);
    setLocalAccounts(accounts);
    setEditParams(undefined);
    if (!account) return;

    await EvmLightNodeUtils.registerAddress(
      chain.chainId,
      account.wallet.address,
      false,
    );
    if (accountListDiv.current) {
      (accountListDiv.current as HTMLDivElement).scrollTo({
        top: (accountListDiv.current as HTMLDivElement).scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleCopySeedClick = () => {
    setEditParams({
      initialValue: '',
      onSubmit: handleConfirmCopySeedClick,
      onCancel: closePopup,
      title: 'html_popup_evm_create_wallet_copy_mnemonic',
      caption: 'evm_copy_seed_phrase_password_caption',
      inputLabel: 'popup_html_master_password',
      inputPlaceholder: 'popup_html_master_password',
      inputType: InputType.PASSWORD,
      confirmLabel: 'popup_html_submit',
      onInputChange: () =>
        setEditParams((currentParams) =>
          currentParams
            ? {
                ...currentParams,
                errorMessage: undefined,
              }
            : currentParams,
        ),
    });
  };

  const handleConfirmCopySeedClick = async (password: string) => {
    if (password !== mk) {
      setEditParams((currentParams) =>
        currentParams
          ? {
              ...currentParams,
              errorMessage: 'wrong_password',
            }
          : currentParams,
      );
      return;
    }

    const seed = (await EvmWalletUtils.getAccountsFromLocalStorage(mk)).find(
      (account) => account.id === selectedSeed?.value,
    );
    if (!seed || !('seed' in seed) || !seed.seed) return;

    closePopup();
    await copyTextWithToast(
      seed.seed,
      'html_popup_evm_create_wallet_copied_mnemonic',
    );
  };

  const handleDeleteSeedClick = async () => {
    const seed = getCurrentSeed();
    if (!seed) return;

    const selectedSeedIndex =
      seedsOptions?.findIndex((option) => option.value === seed.seedId) ?? 0;

    await EvmWalletUtils.deleteSeed(seed.seedId, localAccounts, mk);
    const updatedAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    if (!isMountedRef.current) return;

    const updatedSeedOptions = buildSeedOptions(updatedAccounts);
    const nextSelectedSeed =
      updatedSeedOptions[selectedSeedIndex] ??
      updatedSeedOptions[selectedSeedIndex - 1] ??
      updatedSeedOptions[0];

    setLocalAccounts(updatedAccounts);
    setSeedsOptions(updatedSeedOptions);
    setSelectedSeed(nextSelectedSeed);
    setEvmAccounts(updatedAccounts);

    const nextActiveAccount =
      updatedAccounts.find(
        (account) => account.seedId === nextSelectedSeed?.value && !account.hide,
      ) ??
      updatedAccounts.find((account) => !account.hide) ??
      updatedAccounts[0];

    if (nextActiveAccount) {
      await loadEvmActiveAccount(chain, nextActiveAccount.wallet);
    }
  };

  const handleDeleteAddress = (account: EvmAccountOrPublic) => {
    if ('wallet' in account) {
      setAccountToDelete(account);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!accountToDelete) return;
    const deletedAccount = accountToDelete;
    setAccountToDelete(undefined);

    const selectedSeedIndex =
      seedsOptions?.findIndex(
        (option) => option.value === deletedAccount.seedId,
      ) ?? 0;

    await EvmWalletUtils.deleteAddress(
      deletedAccount.seedId,
      deletedAccount.id,
      localAccounts,
      mk,
    );
    const updatedAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    if (!isMountedRef.current) return;

    const updatedSeedOptions = buildSeedOptions(updatedAccounts);
    const nextSelectedSeed =
      updatedSeedOptions.find(
        (option) => option.value === deletedAccount.seedId,
      ) ??
      updatedSeedOptions[selectedSeedIndex] ??
      updatedSeedOptions[selectedSeedIndex - 1] ??
      updatedSeedOptions[0];

    setLocalAccounts(updatedAccounts);
    setSeedsOptions(updatedSeedOptions);
    setSelectedSeed(nextSelectedSeed);
    setEvmAccounts(updatedAccounts);

    const nextActiveAccount =
      updatedAccounts.find(
        (account) => account.seedId === nextSelectedSeed?.value && !account.hide,
      ) ??
      updatedAccounts.find((account) => !account.hide) ??
      updatedAccounts[0];

    if (nextActiveAccount) {
      await loadEvmActiveAccount(chain, nextActiveAccount.wallet);
    }
  };

  const handleEditSeedClick = () => {
    const seed = getCurrentSeed();
    if (!seed) return;

    setEditParams({
      initialValue: seed.seedNickname ?? '',
      onSubmit: (newAddressNickname: string) =>
        handleConfirmEditSeedClick(newAddressNickname),
      onCancel: closePopup,
      title: 'evm_edit_seed_nickname',
    });
  };

  const getCurrentSeed = () => {
    if (!selectedSeed) return;
    const seed = localAccounts.find(
      (account) => account.seedId === selectedSeed.value,
    );
    return seed;
  };
  const handleConfirmEditSeedClick = async (seedNickname: string) => {
    if (selectedSeed) {
      await EvmWalletUtils.updateSeedNickname(
        selectedSeed.value,
        seedNickname,
        mk,
      );
      const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
      if (!isMountedRef.current) return;

      setLocalAccounts(accounts);
      setEditParams(undefined);
    }
  };

  const handleOnEditAddress = async (account: EvmAccountOrPublic) => {
    if (!('wallet' in account)) return;
    setEditParams({
      initialValue: account.nickname ?? '',
      onSubmit: (newAddressNickname: string) =>
        saveNewAddressName(account.seedId, account.id, newAddressNickname),
      onCancel: closePopup,
      title: 'evm_edit_address_name',
    });
  };

  const saveNewAddressName = async (
    seedId: number,
    addressId: number,
    newAddressNickname: string,
  ) => {
    await EvmWalletUtils.updateAddressName(
      seedId,
      addressId,
      newAddressNickname,
      mk,
    );
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    if (!isMountedRef.current) return;

    setLocalAccounts(accounts);
    setEditParams(undefined);
  };

  const closePopup = () => {
    setEditParams(undefined);
  };

  const handleHideOrShowAddress = async (
    seedId: number,
    addressId: number,
    hide: boolean,
  ) => {
    await EvmWalletUtils.hideOrShowAddress(seedId, mk, addressId, hide);
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    if (!isMountedRef.current) return;

    setLocalAccounts(accounts);
  };

  const menu = selectedSeed
    ? EvmAccountsContextualMenu({
        onEditClicked: handleEditSeedClick,
        onDeleteClicked: handleDeleteSeedClick,
        onCopyClicked: handleCopySeedClick,
        isLedgerSource: isCurrentSourceLedger(),
        isImportedSource: isCurrentSourceImported(),
      })
    : undefined;

  return (
    <div className="evm-accounts-page">
      {seedsOptions && selectedSeed && (
        <div className="seeds">
          <ComplexeCustomSelect
            options={seedsOptions}
            selectedItem={selectedSeed}
            setSelectedItem={setSelectedSeed}
            background="white"
            additionalClassname="seeds-dropdown"
          />
          {menu && <ContextualMenuComponent menu={menu} />}
        </div>
      )}
      <div className="accounts-panel" ref={accountListDiv}>
        {selectedSeed &&
          localAccounts &&
          localAccounts
            .filter((account) => account.seedId === selectedSeed.value)
            .map((account: EvmAccount) => (
              <div
                className={`account-panel ${account.hide ? 'hidden' : ''}`}
                key={`${account.seedId}-${account.id}`}>
                <EvmAccountDisplayComponent
                  account={account}
                  editable
                  hideable={account.source === EvmAccountSource.SEED}
                  deletable={account.source !== EvmAccountSource.SEED}
                  copiable
                  onCopy={onCopyAddress}
                  onHideOrShow={handleHideOrShowAddress}
                  onDelete={handleDeleteAddress}
                  onEdit={handleOnEditAddress}
                  fullAddress
                />
              </div>
            ))}
      </div>
      <div className="button-panel">
        {isCurrentSourceSeed() && (
          <ButtonComponent
            type={ButtonType.ALTERNATIVE}
            height="small"
            label="evm_add_wallet_address_button"
            onClick={handleAddAddressClick}
          />
        )}
      </div>
      {editParams && <EvmEditAccountPopup editParams={editParams} />}
      {accountToDelete && (
        <PopupContainer className="seed-nickname-popup">
          <div className="popup-title">
            {chrome.i18n.getMessage('evm_delete_seed_button')}
          </div>
          <div className="caption">
            {chrome.i18n.getMessage('evm_delete_account_confirmation_message')}
          </div>
          <div className="popup-footer">
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={() => setAccountToDelete(undefined)}
              height="small"
            />
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              label="popup_html_confirm"
              onClick={handleConfirmDeleteAddress}
              height="small"
            />
          </div>
        </PopupContainer>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    accounts: state.evm.accounts,
    mk: state.mk,
    chain: state.chain as EvmChain,
    evmAccountsNavigationParams: state.navigation.stack[0]?.params,
    evmAccountsRestoreParams: state.navigation.stack[0]?.previousParams,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setEvmAccounts,
  loadEvmActiveAccount,
});

type PropsType = ConnectedProps<typeof connector>;

export const EvmAccountsComponent = connector(EvmAccounts);
