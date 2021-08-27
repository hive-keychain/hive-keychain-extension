import React from 'react';
import { DropdownMenuItemComponent } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { DropdownMenuItem } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import './dropdown-menu.component.scss';

export interface DropdownMenuProps {
  dropdownMenuItems: DropdownMenuItem[];
  position: DropdownPosition;
}

export interface DropdownPosition {
  x: number;
  y: number;
}

const DROPDOWN_MENU_WIDTH = 200;

const DropdownMenu = ({ dropdownMenuItems, position }: DropdownMenuProps) => {
  return (
    <div
      className="dropdown-menu"
      style={{
        position: 'absolute',
        top: position.y + 3,
        left: position.x - DROPDOWN_MENU_WIDTH,
        width: DROPDOWN_MENU_WIDTH,
      }}>
      {dropdownMenuItems.map((dropdownMenuItem, index) => (
        <DropdownMenuItemComponent
          key={index}
          label={dropdownMenuItem.label}
          icon={dropdownMenuItem.icon}
          nextScreen={dropdownMenuItem.nextScreen}
        />
      ))}
    </div>
  );
};

export default DropdownMenu;
