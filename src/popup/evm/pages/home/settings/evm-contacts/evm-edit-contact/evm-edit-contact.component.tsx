import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import { EvmFavoriteAddress } from '@popup/evm/interfaces/evm-addresses.interface';
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
  const cancel = async () => {
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
        <PopupContainer onClickOutside={() => setIsPopupOpen(false)}>
          <div className="edit-contact-popup">
            <div className="top-row">
              <div className="initial-contact-label">
                <EvmAccountImage address={favoriteAddress.address} />
                {favoriteAddress.label && favoriteAddress.label.length > 0
                  ? favoriteAddress.label
                  : chrome.i18n.getMessage('evm_contact_no_label')}
              </div>
              <div
                className="delete-contact-link"
                onClick={() => deleteContact()}>
                {chrome.i18n.getMessage('evm_delete_contact_link')}
              </div>
            </div>

            <InputComponent
              label="evm_contact_label"
              value={contactLabel}
              type={InputType.TEXT}
              onChange={setContactLabel}
            />
            <TextAreaComponent
              label="evm_contact_address"
              value={contactAddress}
              onChange={setContactAddress}
            />

            <div className="action-buttons">
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label={'popup_html_operation_button_save'}
                onClick={() => save()}
                height="small"
              />
              <ButtonComponent
                type={ButtonType.ALTERNATIVE}
                onClick={() => cancel()}
                label={'popup_html_button_label_cancel'}
                height="small"
              />
            </div>
          </div>
        </PopupContainer>
      )}
    </div>
  );
};
