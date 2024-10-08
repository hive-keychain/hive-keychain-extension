import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItemComponent } from 'src/common-ui/menu/menu-item/menu-item.component';
import { MenuItem } from 'src/interfaces/menu-item.interface';

interface MenuProps {
  title: string;
  isBackButtonEnable: boolean;
  isCloseButtonDisabled?: boolean;
  menuItems: MenuItem[];
  rightAction?: {
    icon: SVGIcons;
    callback: () => void;
    className: string;
  };
  showDetachWindowOption?: boolean;
}

const Menu = ({
  title,
  isBackButtonEnable,
  isCloseButtonDisabled,
  menuItems,
  rightAction,
  navigateTo,
  setTitleContainerProperties,
  showDetachWindowOption,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: title,
      isBackButtonEnabled: isBackButtonEnable,
      isCloseButtonDisabled: isCloseButtonDisabled,
      rightAction: rightAction,
      showDetachWindowOption: showDetachWindowOption,
    });
  }, [rightAction]);

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
