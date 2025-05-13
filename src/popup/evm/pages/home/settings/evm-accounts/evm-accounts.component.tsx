import { ContextualMenu } from '@interfaces/contextual-menu.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountsContextualMenu } from '@popup/evm/pages/home/settings/evm-accounts/evm-accounts.contextual-menu';
import {
  EditAccountParams,
  EvmEditAccountPopup,
} from '@popup/evm/pages/home/settings/evm-accounts/evm-edit-account-popup/evm-edit-account-popup.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
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

const EvmAccounts = ({
  accounts,
  mk,
  setTitleContainerProperties,
  setInfoMessage,
  navigateTo,
  setEvmAccounts,
}: PropsType) => {
  const [selectedSeed, setSelectedSeed] = useState<OptionItem>();
  const [seedsOptions, setSeedsOptions] = useState<OptionItem[]>();

  const [editParams, setEditParams] = useState<EditAccountParams>();

  const [menu, setMenu] = useState<ContextualMenu>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_seeds_and_accounts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, []);

  useEffect(() => {
    initializeOptions();
  }, [accounts]);

  useEffect(() => {
    initializeMenu();
  }, [selectedSeed]);

  const initializeMenu = () => {
    if (selectedSeed)
      setMenu(
        EvmAccountsContextualMenu({
          activeSeedName: selectedSeed.label,
          onEditClicked: handleEditSeedClick,
          onDeleteClicked: handleDeleteSeedClick,
          onCreateClicked: handleCreateSeedClick,
          onImportClicked: handleImportSeedClick,
        }),
      );
  };

  const initializeOptions = () => {
    const options: OptionItem[] = [];
    for (const account of accounts) {
      if (!options.some((option) => option.value === account.seedId)) {
        options.push({
          value: account.seedId,
          label:
            account.seedNickname ||
            `${chrome.i18n.getMessage('common_seed')} #${account.seedId}`,
        });
      }
    }

    setSeedsOptions(options);
    setSelectedSeed(options[0]);
  };

  const onCopyAddress = (account: EvmAccount) => {
    navigator.clipboard.writeText(account.wallet.address);
    setInfoMessage('popup_html_text_copied', [account.wallet.address]);
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
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));

    setEditParams(undefined);
  };

  const handleCreateSeedClick = () => {
    navigateTo(EvmScreen.CREATE_EVM_WALLET);
  };
  const handleImportSeedClick = () => {
    navigateTo(EvmScreen.IMPORT_EVM_WALLET);
  };

  const handleDeleteSeedClick = async () => {
    const seed = getCurrentSeed();
    if (!seed) return;
    await EvmWalletUtils.deleteSeed(seed.seedId, mk);
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
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
    const seed = accounts.find(
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
      setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
      setEditParams(undefined);
    }
  };

  const handleOnEditAddress = async (account: EvmAccount) => {
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
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
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
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

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
      <div className="accounts-panel">
        {selectedSeed &&
          accounts
            .filter((account) => account.seedId === selectedSeed.value)
            .map((account: EvmAccount) => (
              <div
                className={`account-panel ${account.hide ? 'hidden' : ''}`}
                key={`${account.seedId}-${account.id}`}>
                <EvmAccountDisplayComponent
                  account={account}
                  editable
                  copiable
                  onCopy={onCopyAddress}
                  onHideOrShow={handleHideOrShowAddress}
                  onEdit={handleOnEditAddress}
                  fullAddress
                />
              </div>
            ))}
      </div>
      <div className="button-panel">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          height="small"
          label="evm_add_wallet_address_button"
          onClick={handleAddAddressClick}
        />
      </div>
      {editParams && <EvmEditAccountPopup editParams={editParams} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    mk: state.mk,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setInfoMessage,
  navigateTo,
  setEvmAccounts,
});

type PropsType = ConnectedProps<typeof connector>;

export const EvmAccountsComponent = connector(EvmAccounts);
