import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuItemComponent } from 'src/common-ui/menu/menu-item/menu-item.component';
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
  }, []);

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
          <MenuItemComponent
            menuItem={menuItem}
            key={index}
            handleMenuItemClick={handleMenuItemClick}
            isLast={menuItems.length - 1 === index}
          />
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
