import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ContextualMenuComponent } from 'src/common-ui/contextual-menu/contextual-menu.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

describe('ContextualMenuComponent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('supports keyboard navigation and restores trigger focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ContextualMenuComponent
        menu={{
          sections: [
            {
              items: [
                { label: 'edit', icon: SVGIcons.EVM_ACCOUNT_EDIT },
                { label: 'delete', icon: SVGIcons.EVM_ACCOUNT_DELETE },
              ],
            },
          ],
        }}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'dialog_options' });
    await user.click(trigger);
    const menuItems = screen.getAllByRole('menuitem');
    await waitFor(() => expect(menuItems[0]).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    expect(menuItems[1]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(menuItems[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(menuItems[1]).toHaveFocus();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('activates a menu item with Enter', async () => {
    const user = userEvent.setup();
    const onEditClicked = jest.fn();
    render(
      <ContextualMenuComponent
        menu={{
          sections: [
            {
              items: [
                {
                  label: 'edit',
                  icon: SVGIcons.EVM_ACCOUNT_EDIT,
                  onClick: onEditClicked,
                },
              ],
            },
          ],
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'dialog_options' }));
    const menuItem = screen.getByRole('menuitem', { name: 'edit' });
    await waitFor(() => expect(menuItem).toHaveFocus());
    await user.keyboard('{Enter}');

    expect(onEditClicked).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'dialog_options' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
