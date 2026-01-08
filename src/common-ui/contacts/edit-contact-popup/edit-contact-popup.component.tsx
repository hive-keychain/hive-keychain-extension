import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import { UsernameAvatar } from '@common-ui/username-with-avatar/username-with-avatar';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React, { useState } from 'react';

interface Props {
  isNew?: boolean;
  favoriteAddress: FavoriteAddress;
  onSaveClicked: (newAddressSaved: FavoriteAddress) => void;
  onDeleteClicked?: (favoriteAddress: FavoriteAddress) => void;
  closePopup: () => void;
  chainType: ChainType;
}

export const EditContactPopupComponent = ({
  isNew,
  favoriteAddress,
  onSaveClicked,
  onDeleteClicked,
  closePopup,
  chainType,
}: Props) => {
  const [contactLabel, setContactLabel] = useState(favoriteAddress.label);
  const [contactAddress, setContactAddress] = useState(favoriteAddress.address);

  const save = () => {
    onSaveClicked({
      id: favoriteAddress.id,
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
          label={
            chainType === ChainType.HIVE
              ? 'popup_html_accounts'
              : 'evm_contact_address'
          }
          value={contactAddress}
          onChange={setContactAddress}
          useChips={false}
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
