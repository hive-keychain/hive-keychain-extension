import React from 'react';
import { DropdownMenuItemComponent } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import './dropdown-menu.component.scss';

export interface DropdownMenuProps {
  dropdownMenuItems: DropdownMenuItemInterface[];
  onOverlayClicked: () => void;
}

const DROPDOWN_MENU_WIDTH = 200;

const DropdownMenu = ({
  dropdownMenuItems,
  onOverlayClicked,
}: DropdownMenuProps) => {
  return (
    <div className="dropdown-menu-container">
      <div className="overlay" onClick={() => onOverlayClicked()}></div>
      <div className="dropdown-menu">
        {dropdownMenuItems.map((dropdownMenuItem, index) => (
          <DropdownMenuItemComponent
            key={index}
            label={dropdownMenuItem.label}
            icon={dropdownMenuItem.icon}
            importedIcon={dropdownMenuItem.importedIcon}
            nextScreen={dropdownMenuItem.nextScreen}
            nextScreenParams={dropdownMenuItem.nextScreenParams}
          />
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
