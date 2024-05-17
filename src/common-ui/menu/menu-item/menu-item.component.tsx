import { MenuItem } from '@interfaces/menu-item.interface';
import React, { useState } from 'react';
import { Badge, BadgeType } from 'src/common-ui/badge/badge.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface MenuItemProps {
  menuItem: MenuItem;
  handleMenuItemClick: (menuItem: MenuItem) => void;
  isLast: boolean;
}

export const MenuItemComponent = ({
  menuItem,
  isLast,
  handleMenuItemClick,
}: MenuItemProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="menu-item-container"
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div
        data-testid={'menu-settings-button-' + menuItem.icon}
        className="menu-item"
        onClick={() => handleMenuItemClick(menuItem)}>
        <SVGIcon icon={menuItem.icon} className="icon" forceHover={hovered} />
        <div className="menu-label">
          {chrome.i18n.getMessage(menuItem.label)}
        </div>
        <div className="divider"></div>
        {menuItem.rightPanel && <menuItem.rightPanel />}
        {menuItem.experimental && (
          <Badge
            label="common_experimental"
            badgeType={BadgeType.EXPERIMENTAL}
          />
        )}
      </div>
      {!isLast && <Separator type={'horizontal'} />}
    </div>
  );
};
