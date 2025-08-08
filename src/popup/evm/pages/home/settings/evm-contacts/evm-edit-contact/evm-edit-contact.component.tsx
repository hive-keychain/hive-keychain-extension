import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { EvmFavoriteAddress } from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmEditContactPopupComponent } from '@popup/evm/pages/home/settings/evm-contacts/evm-edit-contact-popup/evm-edit-contact-popup.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React, { useState } from 'react';

interface Props {
  favoriteAddress: EvmFavoriteAddress;
  onSaveClicked: (newAddressSaved: EvmFavoriteAddress) => void;
  onDeleteClicked: (favoriteAddress: EvmFavoriteAddress) => void;
}

export const EvmEditContactComponent = ({
  favoriteAddress,
  onSaveClicked,
  onDeleteClicked,
}: Props) => {
  const [contactLabel, setContactLabel] = useState(favoriteAddress.label);
  const [contactAddress, setContactAddress] = useState(favoriteAddress.address);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const save = async () => {
    onSaveClicked({
      ...favoriteAddress,
      label: contactLabel,
      address: contactAddress,
    });
    setIsPopupOpen(false);
  };
  const closePopup = async () => {
    setIsPopupOpen(false);
    setContactLabel(favoriteAddress.label);
    setContactAddress(favoriteAddress.address);
  };

  const openEditContactModal = () => {
    setIsPopupOpen(true);
  };

  const deleteContact = () => {
    onDeleteClicked(favoriteAddress);
    setIsPopupOpen(false);
  };

  return (
    <div className={`edit-contact-item `}>
      <div
        className="contact-label-panel"
        onClick={() => openEditContactModal()}>
        <div className="contact-label">
          <EvmAccountImage address={favoriteAddress.address} />
          {favoriteAddress.label && favoriteAddress.label.length > 0
            ? favoriteAddress.label
            : chrome.i18n.getMessage('evm_contact_no_label')}
          <div className="hint">
            {EvmFormatUtils.formatAddress(
              favoriteAddress.address.toLowerCase(),
            )}
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <EvmEditContactPopupComponent
          favoriteAddress={favoriteAddress}
          onSaveClicked={save}
          onDeleteClicked={deleteContact}
          closePopup={closePopup}
        />
      )}
    </div>
  );
};
