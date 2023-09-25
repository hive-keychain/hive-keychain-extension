import { ActionButton } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import React, { BaseSyntheticEvent, useState } from 'react';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface WalletInfoSectionItemButtonProps {
  handleClick: (event: BaseSyntheticEvent, actionButton: ActionButton) => void;
  actionButton: ActionButton;
}

export const WalletInfoSectionItemButton = ({
  handleClick,
  actionButton,
}: WalletInfoSectionItemButtonProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="wallet-action-button"
      onClick={($event) => handleClick($event, actionButton)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <SVGIcon
        icon={actionButton.icon}
        className="action-icon"
        hoverable
        forceHover={hovered}
      />
      <div className="title">
        {chrome.i18n.getMessage(actionButton.label, actionButton.labelParams)}
      </div>
    </div>
  );
};
