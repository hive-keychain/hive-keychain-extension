import { Asset } from '@hiveio/dhive';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import DropdownMenu from 'src/common-ui/dropdown-menu/dropdown-menu.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section-item.component.scss';

interface WalletSectionInfoItemProps {
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue: string | Asset | number;
  subValueLabel: string;
  menuItems: DropdownMenuItemInterface[];
  infoContent?: string;
}

const walletInfoSectionItem = ({
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  menuItems,
  infoContent,
}: PropsFromRedux) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  };

  return (
    <div className="wallet-info-row">
      <div className="value">
        <div className="balance">
          {FormatUtils.formatCurrencyValue(mainValue)}
        </div>
        {parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
          <div className="savings">
            {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
            {FormatUtils.formatCurrencyValue(subValue)}
          </div>
        )}
      </div>
      <div className="currency">
        <div className="balance">{mainValueLabel}</div>
        {infoContent && (
          <Icon
            name={Icons.INFO}
            type={IconType.OUTLINED}
            tooltipMessage={infoContent}
            skipTooltipTranslation
          />
        )}
        {parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
          <div className="savings">({subValueLabel})</div>
        )}
      </div>
      <img
        aria-label={`dropdown-arrow-${mainValueLabel.toLowerCase()}`}
        className="dropdown-arrow"
        src="/assets/images/uparrow.png"
        onClick={toggleDropdown}
      />
      {isDropdownMenuOpen && (
        <DropdownMenu
          dropdownMenuItems={menuItems}
          onOverlayClicked={() => toggleDropdown()}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  WalletSectionInfoItemProps;

export const WalletInfoSectionItemComponent = connector(walletInfoSectionItem);
