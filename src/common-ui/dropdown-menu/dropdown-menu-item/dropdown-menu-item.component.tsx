import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { SyntheticEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItem } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import './dropdown-menu-item.component.scss';

const DropdownMenuItem = ({
  icon,
  label,
  nextScreen,
  navigateTo,
}: PropsFromRedux) => {
  const handleClickOnMenuItem = (event: SyntheticEvent) => {
    event.stopPropagation();
    navigateTo(nextScreen);
  };

  return (
    <div
      className="dropdown-menu-item"
      onClick={(event) => handleClickOnMenuItem(event)}>
      <img className="icon" src={`/assets/images/${icon}`} />
      <div className="label">{chrome.i18n.getMessage(label)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector> & DropdownMenuItem;

export const DropdownMenuItemComponent = connector(DropdownMenuItem);
