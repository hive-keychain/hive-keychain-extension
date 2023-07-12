import { Asset } from '@hiveio/dhive';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import DropdownMenu from 'src/common-ui/dropdown-menu/dropdown-menu.component';
import { IconType } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { RootState } from 'src/popup/hive/store';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section-item.component.scss';

interface WalletSectionInfoItemProps {
  icon: IconType;
  iconColor?: 'red' | 'green';
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
  menuItems: DropdownMenuItemInterface[];
  infoContent?: string;
}

const walletInfoSectionItem = ({
  icon,
  iconColor,
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
    <div className="wallet-info-row" data-testid={`wallet-info-section-row`}>
      <SVGIcon icon={icon} className={`currency-icon ${iconColor ?? ''}`} />
      <div className="main-value-label">{mainValueLabel}</div>
      <div className="value">
        <div className="main-value">
          {FormatUtils.formatCurrencyValue(mainValue)}
        </div>
        {subValue &&
          parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
            <div className="sub-value">
              {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
              {FormatUtils.formatCurrencyValue(subValue)} ({subValueLabel})
            </div>
          )}
      </div>
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
