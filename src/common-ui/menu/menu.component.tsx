import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
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
      menuItem.action();
    }
  };

  return (
    <div className="menu-page">
      <div className="menu">
        {menuItems.map((menuItem, index) => (
          <div
            data-testid={'menu-settings-button-' + menuItem.icon}
            key={index}
            className="menu-item"
            onClick={() => handleMenuItemClick(menuItem)}>
            {menuItem.importedIcon && (
              <img className="icon" src={`/assets/images/${menuItem.icon}`} />
            )}
            {!menuItem.importedIcon && (
              <Icon
                name={menuItem.icon!}
                type={IconType.OUTLINED}
                additionalClassName="icon"></Icon>
            )}

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
