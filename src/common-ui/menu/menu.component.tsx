import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
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
}: PropsType) => {
  return (
    <div className="menu-page">
      <PageTitleComponent
        title={title}
        isBackButtonEnabled={isBackButtonEnable}
      />
      <div className="menu">
        {menuItems.map((menuItem, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => navigateTo(menuItem.nextScreen)}>
            <img className="icon" src={`/assets/images/${menuItem.icon}.png`} />
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

const connector = connect(mapStateToProps, { navigateTo });
type PropsType = ConnectedProps<typeof connector> & MenuProps;

export const MenuComponent = connector(Menu);
