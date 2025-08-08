import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import { EvmFavoriteAddress } from '@popup/evm/interfaces/evm-addresses.interface';
import React, { useState } from 'react';

interface Props {
  isNew?: boolean;
  favoriteAddress: EvmFavoriteAddress;
  onSaveClicked: (newAddressSaved: EvmFavoriteAddress) => void;
  onDeleteClicked?: (favoriteAddress: EvmFavoriteAddress) => void;
  closePopup: () => void;
}

export const EvmEditContactPopupComponent = ({
  isNew,
  favoriteAddress,
  onSaveClicked,
  onDeleteClicked,
  closePopup,
}: Props) => {
  const [contactLabel, setContactLabel] = useState(favoriteAddress.label);
  const [contactAddress, setContactAddress] = useState(favoriteAddress.address);

  const save = () => {
    onSaveClicked({
      ...favoriteAddress,
      label: contactLabel,
      address: contactAddress,
    });
  };

  return (
    <PopupContainer onClickOutside={() => closePopup()}>
      <div className="edit-contact-popup">
        <div className="top-row">
          <div className="initial-contact-label">
            {isNew && chrome.i18n.getMessage('evm_contact_new_contact')}
            {!isNew && (
              <>
                <EvmAccountImage address={favoriteAddress.address} />
                {favoriteAddress.label && favoriteAddress.label.length > 0
                  ? favoriteAddress.label
                  : chrome.i18n.getMessage('evm_contact_no_label')}
              </>
            )}
          </div>
          {onDeleteClicked && (
            <div
              className="delete-contact-link"
              onClick={() => onDeleteClicked(favoriteAddress)}>
              {chrome.i18n.getMessage('evm_delete_contact_link')}
            </div>
          )}
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
            onClick={() => closePopup()}
            label={'popup_html_button_label_cancel'}
            height="small"
          />
        </div>
      </div>
    </PopupContainer>
  );
};
