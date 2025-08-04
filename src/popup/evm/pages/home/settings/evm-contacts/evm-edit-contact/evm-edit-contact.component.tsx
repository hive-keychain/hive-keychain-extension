import { SVGIcons } from '@common-ui/icons.enum';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { EvmFavoriteAddress } from '@popup/evm/interfaces/evm-addresses.interface';
import React, { useState } from 'react';

interface Props {
  favoriteAddress: EvmFavoriteAddress;
  onSaveClicked: (newAddressSaved: EvmFavoriteAddress) => void;
}

export const EvmEditContactComponent = ({
  favoriteAddress,
  onSaveClicked,
}: Props) => {
  const [contactLabel, setContactLabel] = useState(favoriteAddress.label);

  return (
    <div className="edit-contact-item">
      <InputComponent
        type={InputType.TEXT}
        value={contactLabel}
        onChange={setContactLabel}
        hint={favoriteAddress.address.toLowerCase()}
        label=""
        skipHintTranslation
        rightActionIcon={SVGIcons.MENU_RPC_SAVE_BUTTON}
        rightActionClicked={() => {
          onSaveClicked({ ...favoriteAddress, label: contactLabel });
        }}
        size="small"
      />
    </div>
  );
};
