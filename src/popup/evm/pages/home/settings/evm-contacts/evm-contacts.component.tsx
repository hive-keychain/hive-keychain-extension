import { EditContactPopupComponent } from '@common-ui/contacts/edit-contact-popup/edit-contact-popup.component';
import { EditContactComponent } from '@common-ui/contacts/edit-contact/edit-contact.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { LabelComponent } from '@common-ui/label/label.component';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { openModal } from '@popup/multichain/actions/modal.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { v4 } from 'uuid';

const Contacts = ({ chain, setTitleContainerProperties }: PropsType) => {
  const [chainOptions, setChainOptions] = useState<OptionItem[]>();
  const [selectedChain, setSelectedChain] = useState<EvmChain>(chain);

  const [walletAddresses, setWalletAddresses] = useState<FavoriteAddress[]>([]);
  const [contractAddresses, setContractAddresses] = useState<FavoriteAddress[]>(
    [],
  );

  const [addingAddressType, setAddingAddressType] =
    useState<EvmAddressType | null>(null);
  const [newFavoriteAddress, setNewFavoriteAddress] = useState<FavoriteAddress>(
    {
      address: '',
      label: '',
      id: v4(),
    },
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_contacts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    init();
  }, []);

  const init = async () => {
    const allSetupChains = await ChainUtils.getSetupChains();
    let optionItems: OptionItem[] = allSetupChains
      .filter((c) => c.type === ChainType.EVM)
      .map((c) => {
        return { label: c.name, value: c, img: c.logo };
      });
    setChainOptions(optionItems);

    initAddresses(chain);
  };

  const initAddresses = async (newChain: EvmChain) => {
    const savedAddresses = await EvmAddressesUtils.getWhitelistedAddresses(
      newChain.chainId,
    );

    const addresses = [];
    for (const walletAdd of savedAddresses[EvmAddressType.WALLET_ADDRESS]) {
      const addressDetails = await EvmAddressesUtils.getAddressDetails(
        walletAdd.address,
        newChain.chainId,
      );
      walletAdd.avatar = addressDetails.avatar;
      addresses.push(walletAdd);
    }

    setWalletAddresses(addresses);
    setContractAddresses(savedAddresses[EvmAddressType.SMART_CONTRACT]);
  };

  const updateSelectedChain = (newChain: EvmChain) => {
    setSelectedChain(newChain);
    initAddresses(newChain);
  };

  const updateWhitelistedAddresses = async (
    updatedFavoriteAddress: FavoriteAddress,
    type: EvmAddressType,
  ) => {
    await EvmAddressesUtils.updateAddress(
      selectedChain.chainId,
      updatedFavoriteAddress,
      type,
    );
    initAddresses(selectedChain);
  };

  const createNewFavoriteAddress = async (
    item: FavoriteAddress,
    type: EvmAddressType,
  ) => {
    if (type === EvmAddressType.WALLET_ADDRESS) {
      await EvmAddressesUtils.saveWalletAddress(
        selectedChain.chainId,
        item.address,
        item.label,
        newFavoriteAddress.id,
      );
    } else {
      await EvmAddressesUtils.saveContractAddress(
        item.address,
        selectedChain.chainId,
        item.label,
        newFavoriteAddress.id,
      );
    }
    resetNewFavoriteAddress();
    initAddresses(selectedChain);
  };

  const resetNewFavoriteAddress = () => {
    setNewFavoriteAddress({
      address: '',
      label: '',
      id: v4(),
    });
    setAddingAddressType(null);
  };

  const openAddAddressPopup = (type: EvmAddressType) => {
    setNewFavoriteAddress({
      address: '',
      label: '',
      id: v4(),
    });
    setAddingAddressType(type);
  };

  const deleteWhitelistedAddresses = async (
    deletedFavoriteAddress: FavoriteAddress,
    type: EvmAddressType,
  ) => {
    await EvmAddressesUtils.deleteAddress(
      selectedChain.chainId,
      deletedFavoriteAddress.id,
      type,
    );
    initAddresses(selectedChain);
  };

  const renderAddLink = (type: EvmAddressType) => (
    <div className="add-contact-link" onClick={() => openAddAddressPopup(type)}>
      <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE} className="add-icon" />
      {chrome.i18n.getMessage('evm_addresses_add')}
    </div>
  );

  const renderAddressCategory = (
    titleKey: string,
    type: EvmAddressType,
    addresses: FavoriteAddress[],
  ) => (
    <div className="contact-category">
      <div className="category-header">
        <LabelComponent value={titleKey} className="category-title" />
        {renderAddLink(type)}
      </div>
      <div className="addresses-list-items">
        {addresses.map((savedAddress, index) => (
          <EditContactComponent
            key={`${savedAddress.address}-${index}`}
            shortAddress={true}
            favoriteAddress={savedAddress}
            maxLabelLength={12}
            onSaveClicked={(item) => updateWhitelistedAddresses(item, type)}
            onDeleteClicked={(item) => deleteWhitelistedAddresses(item, type)}
            chainType={ChainType.EVM}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="evm-contacts-page contacts-settings-page">
      {chainOptions && selectedChain && (
        <div className="chain-select-panel">
          <ComplexeCustomSelect
            options={chainOptions}
            selectedItem={{
              label: selectedChain.name,
              value: selectedChain,
              img: selectedChain.logo,
            }}
            setSelectedItem={(item) => updateSelectedChain(item.value)}
            background="white"
            generateImageIfNull
          />
        </div>
      )}

      <div className="addresses-list">
        {renderAddressCategory(
          'evm_contacts_section',
          EvmAddressType.WALLET_ADDRESS,
          walletAddresses,
        )}
        {renderAddressCategory(
          'evm_menu_advanced_smart_contracts',
          EvmAddressType.SMART_CONTRACT,
          contractAddresses,
        )}
      </div>

      {addingAddressType && (
        <EditContactPopupComponent
          isNew={true}
          favoriteAddress={newFavoriteAddress}
          onSaveClicked={(item) =>
            createNewFavoriteAddress(item, addingAddressType)
          }
          closePopup={() => resetNewFavoriteAddress()}
          chainType={ChainType.EVM}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    mk: state.mk,
    chain: state.chain as EvmChain,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setInfoMessage,
  navigateTo,
  setEvmAccounts,
  openModal,
});

type PropsType = ConnectedProps<typeof connector>;

export const EvmContactsComponent = connector(Contacts);
