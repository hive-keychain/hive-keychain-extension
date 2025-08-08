import { Card } from '@common-ui/card/card.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { LabelComponent } from '@common-ui/label/label.component';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import {
  EvmAddressType,
  EvmFavoriteAddress,
  EvmWhitelistedAddresses,
} from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmEditContactPopupComponent } from '@popup/evm/pages/home/settings/evm-contacts/evm-edit-contact-popup/evm-edit-contact-popup.component';
import { EvmEditContactComponent } from '@popup/evm/pages/home/settings/evm-contacts/evm-edit-contact/evm-edit-contact.component';
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
import { v4 } from 'uuid';

const EvmContacts = ({ chain, setTitleContainerProperties }: PropsType) => {
  const [chainOptions, setChainOptions] = useState<OptionItem[]>();
  const [selectedChain, setSelectedChain] = useState<EvmChain>(chain);
  const [addresses, setAddresses] = useState<EvmWhitelistedAddresses>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newFavoriteAddress, setNewFavoriteAddress] =
    useState<EvmFavoriteAddress>({
      address: '',
      label: '',
      id: v4(),
    });

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

    setAddresses(savedAddresses);
  };

  const updateSelectedChain = (newChain: EvmChain) => {
    setSelectedChain(newChain);
    initAddresses(newChain);
  };

  const updateWhitelistedAddresses = async (
    updatedFavoriteAddress: EvmFavoriteAddress,
    type: EvmAddressType,
  ) => {
    await EvmAddressesUtils.updateAddress(
      selectedChain.chainId,
      updatedFavoriteAddress,
      type,
    );
    initAddresses(selectedChain);
  };

  const createNewFavoriteAddress = async (item: EvmFavoriteAddress) => {
    await EvmAddressesUtils.saveWalletAddress(
      selectedChain.chainId,
      item.address,
      item.label,
      newFavoriteAddress.id,
    );
    resetNewFavoriteAddress();
    initAddresses(selectedChain);
  };

  const resetNewFavoriteAddress = () => {
    setNewFavoriteAddress({
      address: '',
      label: '',
      id: v4(),
    });
    setIsPopupOpen(false);
  };

  const deleteWhitelistedAddresses = async (
    deletedFavoriteAddress: EvmFavoriteAddress,
    type: EvmAddressType,
  ) => {
    await EvmAddressesUtils.deleteAddress(
      selectedChain.chainId,
      deletedFavoriteAddress.id,
      type,
    );
    initAddresses(selectedChain);
  };

  return (
    <div className="evm-contacts-page">
      <Card>
        {chainOptions && selectedChain && (
          <ComplexeCustomSelect
            options={chainOptions}
            selectedItem={{
              label: selectedChain.name,
              value: selectedChain,
              img: selectedChain.logo,
            }}
            setSelectedItem={(item) => updateSelectedChain(item.value)}
            additionalClassname="chain-custom-select"
          />
        )}

        <div className="add-contact-link" onClick={() => setIsPopupOpen(true)}>
          {chrome.i18n.getMessage('evm_add_contact_link')}
        </div>

        {addresses && (
          <div className="edit-contacts-panel">
            {addresses[EvmAddressType.WALLET_ADDRESS] &&
              addresses[EvmAddressType.WALLET_ADDRESS].length > 0 && (
                <>
                  <LabelComponent value="evm_wallets" />
                  {addresses[EvmAddressType.WALLET_ADDRESS].map(
                    (savedAddress, index) => (
                      <EvmEditContactComponent
                        key={`${savedAddress.address}-${index}`}
                        favoriteAddress={savedAddress}
                        onSaveClicked={(item) =>
                          updateWhitelistedAddresses(
                            item,
                            EvmAddressType.WALLET_ADDRESS,
                          )
                        }
                        onDeleteClicked={(item) =>
                          deleteWhitelistedAddresses(
                            item,
                            EvmAddressType.WALLET_ADDRESS,
                          )
                        }
                      />
                    ),
                  )}
                </>
              )}
            {addresses[EvmAddressType.SMART_CONTRACT] &&
              addresses[EvmAddressType.SMART_CONTRACT].length > 0 && (
                <>
                  <LabelComponent value="evm_menu_advanced_smart_contracts" />
                  {addresses[EvmAddressType.SMART_CONTRACT].map(
                    (savedAddress, index) => (
                      <EvmEditContactComponent
                        key={`${savedAddress.address}-${index}`}
                        favoriteAddress={savedAddress}
                        onSaveClicked={(item) =>
                          updateWhitelistedAddresses(
                            item,
                            EvmAddressType.SMART_CONTRACT,
                          )
                        }
                        onDeleteClicked={(item) =>
                          deleteWhitelistedAddresses(
                            item,
                            EvmAddressType.SMART_CONTRACT,
                          )
                        }
                      />
                    ),
                  )}
                </>
              )}
          </div>
        )}
      </Card>
      {isPopupOpen && (
        <EvmEditContactPopupComponent
          isNew={true}
          favoriteAddress={newFavoriteAddress}
          onSaveClicked={(item) => createNewFavoriteAddress(item)}
          closePopup={() => resetNewFavoriteAddress()}
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

export const EvmContactsComponent = connector(EvmContacts);
