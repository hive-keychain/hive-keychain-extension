import { EditContactPopupComponent } from '@common-ui/contacts/edit-contact-popup/edit-contact-popup.component';
import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import {
  HIVE_CONTACT_FALLBACK_IMAGE,
  UsernameAvatar,
} from '@common-ui/username-with-avatar/username-with-avatar';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React, { SyntheticEvent, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  favoriteAddress: FavoriteAddress;
  shortAddress: boolean;
  onSaveClicked: (newAddressSaved: FavoriteAddress) => void;
  onDeleteClicked: (favoriteAddress: FavoriteAddress) => void;
  chainType: ChainType;
  maxLabelLength?: number;
}

const formatContactLabel = (label: string, maxLabelLength?: number) => {
  if (!maxLabelLength || label.length <= maxLabelLength) {
    return label;
  }

  return `${label.slice(0, maxLabelLength)}...`;
};

export const EditContactComponent = ({
  favoriteAddress,
  shortAddress = true,
  onSaveClicked,
  onDeleteClicked,
  chainType,
  maxLabelLength,
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

  const openEditContactModal = (event: SyntheticEvent) => {
    event.stopPropagation();
    setIsPopupOpen(true);
  };

  const deleteContact = (event: SyntheticEvent, item: FavoriteAddress) => {
    event.stopPropagation();
    onDeleteClicked(item);
    setIsPopupOpen(false);
  };

  return (
    <div className={`edit-contact-item `}>
      <div className="contact-label-panel">
        <div className="contact-label">
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
            ? formatContactLabel(favoriteAddress.label, maxLabelLength)
            : I18nUtils.getMessage('evm_contact_no_label')}
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
        <div className="contact-actions">
          <SVGIcon
            icon={SVGIcons.FAVORITE_ACCOUNTS_EDIT}
            className="edit-icon"
            onClick={openEditContactModal}
          />
          <SVGIcon
            icon={SVGIcons.FAVORITE_ACCOUNTS_DELETE}
            className="delete-icon"
            onClick={(event) => deleteContact(event, favoriteAddress)}
          />
        </div>
      </div>

      {isPopupOpen && (
        <EditContactPopupComponent
          favoriteAddress={favoriteAddress}
          onSaveClicked={(item) => save(item)}
          closePopup={closePopup}
          chainType={chainType}
        />
      )}
    </div>
  );
};
