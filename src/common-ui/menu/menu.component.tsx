import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import './menu.component.scss';

interface MenuProps {
  title: string;
  isBackButtonEnable: boolean;
  menuItems: MenuItem[];
}

const Menu = ({
  title,
  isBackButtonEnable,
  menuItems,
  navigateTo,
  setTitleContainerProperties,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: title,
      isBackButtonEnabled: isBackButtonEnable,
    });
  });

  const handleMenuItemClick = (menuItem: MenuItem) => {
    if (menuItem.nextScreen) {
      navigateTo(menuItem.nextScreen);
    } else if (menuItem.action) {
      console.log('calling menuItem action: ', menuItem.icon);
      menuItem.action();
    }
  };

  return (
    <div className="menu-page">
      <div className="menu">
        {menuItems.map((menuItem, index) => (
          <div
            aria-label={'menu-settings-button-' + menuItem.icon}
            key={index}
            className="menu-item"
            onClick={() => handleMenuItemClick(menuItem)}>
            <Icon
              name={menuItem.icon!}
              type={IconType.OUTLINED}
              additionalClassName="icon"></Icon>

            <div className="menu-label">
              {chrome.i18n.getMessage(menuItem.label)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setTitleContainerProperties,
});
type PropsType = ConnectedProps<typeof connector> & MenuProps;

export const MenuComponent = connector(Menu);
