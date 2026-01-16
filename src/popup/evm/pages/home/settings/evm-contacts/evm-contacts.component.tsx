import { Card } from '@common-ui/card/card.component';
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
import { v4 } from 'uuid';

const Contacts = ({ chain, setTitleContainerProperties }: PropsType) => {
  const [chainOptions, setChainOptions] = useState<OptionItem[]>();
  const [selectedChain, setSelectedChain] = useState<EvmChain>(chain);

  const [walletAddresses, setWalletAddresses] = useState<FavoriteAddress[]>([]);
  const [contractAddresses, setContractAddresses] = useState<FavoriteAddress[]>(
    [],
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
      console.log('addressDetails', addressDetails);
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

  const createNewFavoriteAddress = async (item: FavoriteAddress) => {
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

  return (
    <div className="evm-contacts-page">
      <Card className="evm-contacts-card">
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

        <div className="edit-contacts-panel">
          {walletAddresses && walletAddresses.length > 0 && (
            <>
              <LabelComponent value="evm_wallets" />
              {walletAddresses.map((savedAddress, index) => (
                <EditContactComponent
                  key={`${savedAddress.address}-${index}`}
                  shortAddress={true}
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
                  chainType={ChainType.EVM}
                />
              ))}
            </>
          )}
          {contractAddresses && contractAddresses.length > 0 && (
            <>
              <LabelComponent value="evm_menu_advanced_smart_contracts" />
              {contractAddresses.map((savedAddress, index) => (
                <EditContactComponent
                  key={`${savedAddress.address}-${index}`}
                  shortAddress={true}
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
                  chainType={ChainType.EVM}
                />
              ))}
            </>
          )}
        </div>
      </Card>
      {isPopupOpen && (
        <EditContactPopupComponent
          isNew={true}
          favoriteAddress={newFavoriteAddress}
          onSaveClicked={(item) => createNewFavoriteAddress(item)}
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
