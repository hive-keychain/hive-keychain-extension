import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItemComponent } from 'src/common-ui/menu/menu-item/menu-item.component';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('MenuItemComponent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('activates the menu item with Enter and Space', async () => {
    const user = userEvent.setup();
    const handleMenuItemClick = jest.fn();
    const menuItem = {
      label: 'settings_menu_item',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS,
    };
    render(
      <MenuItemComponent
        menuItem={menuItem}
        handleMenuItemClick={handleMenuItemClick}
        isLast
      />,
    );

    const menuItemButton = screen.getByRole('button', {
      name: 'settings_menu_item',
    });
    menuItemButton.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(handleMenuItemClick).toHaveBeenNthCalledWith(1, menuItem);
    expect(handleMenuItemClick).toHaveBeenNthCalledWith(2, menuItem);
  });
});
