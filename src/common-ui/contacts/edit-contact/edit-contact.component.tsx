import { EditContactPopupComponent } from '@common-ui/contacts/edit-contact-popup/edit-contact-popup.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { UsernameAvatar } from '@common-ui/username-with-avatar/username-with-avatar';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React, { useState } from 'react';

interface Props {
  favoriteAddress: FavoriteAddress;
  shortAddress: boolean;
  onSaveClicked: (newAddressSaved: FavoriteAddress) => void;
  onDeleteClicked: (favoriteAddress: FavoriteAddress) => void;
  chainType: ChainType;
}

export const EditContactComponent = ({
  favoriteAddress,
  shortAddress = true,
  onSaveClicked,
  onDeleteClicked,
  chainType,
}: Props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const save = async (item: FavoriteAddress) => {
    onSaveClicked({
      ...item,
      label: item.label,
      address: item.address,
    });
    setIsPopupOpen(false);
  };
  const closePopup = async () => {
    setIsPopupOpen(false);
  };

  const openEditContactModal = () => {
    setIsPopupOpen(true);
  };

  const deleteContact = (item: FavoriteAddress) => {
    onDeleteClicked(item);
    setIsPopupOpen(false);
  };

  return (
    <div className={`edit-contact-item `}>
      <div
        className="contact-label-panel"
        onClick={() => openEditContactModal()}>
        <div className="contact-label">
          {chainType === ChainType.EVM && (
            <EvmAccountImage address={favoriteAddress.address} />
          )}
          {chainType === ChainType.HIVE && (
            <UsernameAvatar
              username={favoriteAddress.address}
              className="user-picture"
            />
          )}
          {favoriteAddress.label && favoriteAddress.label.length > 0
            ? favoriteAddress.label
            : chrome.i18n.getMessage('evm_contact_no_label')}
          <div className="hint">
            {shortAddress
              ? EvmFormatUtils.formatAddress(
                  favoriteAddress.address.toLowerCase(),
                )
              : chainType === ChainType.HIVE
              ? `@${favoriteAddress.address}`
              : favoriteAddress.address}
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <EditContactPopupComponent
          favoriteAddress={favoriteAddress}
          onSaveClicked={(item) => save(item)}
          onDeleteClicked={(item) => deleteContact(item)}
          closePopup={closePopup}
          chainType={chainType}
        />
      )}
    </div>
  );
};
