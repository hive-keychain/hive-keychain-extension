import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import {
  HIVE_CONTACT_FALLBACK_IMAGE,
  UsernameAvatar,
} from '@common-ui/username-with-avatar/username-with-avatar';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import React, { useState } from 'react';

interface Props {
  isNew?: boolean;
  favoriteAddress: FavoriteAddress;
  onSaveClicked: (newAddressSaved: FavoriteAddress) => void;
  closePopup: () => void;
  chainType: ChainType;
}

export const EditContactPopupComponent = ({
  isNew,
  favoriteAddress,
  onSaveClicked,
  closePopup,
  chainType,
}: Props) => {
  const [contactLabel, setContactLabel] = useState(favoriteAddress.label);
  const [contactAddress, setContactAddress] = useState(favoriteAddress.address);
  const [addressError, setAddressError] = useState<string | undefined>();

  const save = () => {
    if (chainType === ChainType.EVM) {
      const trimmedAddress = contactAddress.trim();
      if (!trimmedAddress || !ethers.isAddress(trimmedAddress)) {
        setAddressError(
          chrome.i18n.getMessage('evm_contact_address_invalid'),
        );
        return;
      }

      onSaveClicked({
        id: favoriteAddress.id,
        label: contactLabel,
        address: ethers.getAddress(trimmedAddress),
      });
      return;
    }

    onSaveClicked({
      id: favoriteAddress.id,
      label: contactLabel,
      address: contactAddress,
    });
  };

  const updateContactAddress = (value: string) => {
    setContactAddress(value);
    if (addressError) {
      setAddressError(undefined);
    }
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
                  <EvmAccountImage
                    address={favoriteAddress.address}
                    avatar={favoriteAddress.avatar}
                  />
                )}
                {chainType === ChainType.HIVE && (
                  <UsernameAvatar
                    username={favoriteAddress.address}
                    className="user-picture"
                    fallbackImage={HIVE_CONTACT_FALLBACK_IMAGE}
                  />
                )}

                {favoriteAddress.label && favoriteAddress.label.length > 0
                  ? favoriteAddress.label
                  : chrome.i18n.getMessage('evm_contact_no_label')}
              </>
            )}
          </div>
        </div>

        <InputComponent
          label="evm_contact_label"
          value={contactLabel}
          type={InputType.TEXT}
          onChange={setContactLabel}
        />

        {chainType === ChainType.EVM && (
          <>
            <TextAreaComponent
              label={'evm_contact_address'}
              value={contactAddress}
              onChange={updateContactAddress}
              useChips={false}
            />
            {addressError && (
              <div className="address-error">{addressError}</div>
            )}
          </>
        )}
        {chainType === ChainType.HIVE && (
          <InputComponent
            label={'dialog_account'}
            value={contactAddress}
            onChange={setContactAddress}
            type={InputType.TEXT}
          />
        )}

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
