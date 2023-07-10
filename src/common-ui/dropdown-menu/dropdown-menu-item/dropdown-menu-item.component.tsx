import React, { SyntheticEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import Icon from 'src/common-ui/icon/icon.component';
import { navigateToWithParams } from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import './dropdown-menu-item.component.scss';

const DropdownMenuItem = ({
  icon,
  importedIcon,
  label,
  labelParams,
  nextScreen,
  nextScreenParams,
  navigateToWithParams,
}: PropsFromRedux) => {
  const handleClickOnMenuItem = (event: SyntheticEvent) => {
    event.stopPropagation();
    navigateToWithParams(nextScreen, nextScreenParams);
  };

  return (
    <div
      className="dropdown-menu-item"
      data-testid={`dropdown-menu-item-${icon}`}
      onClick={(event) => handleClickOnMenuItem(event)}>
      {importedIcon && <img className="icon" src={`/assets/images/${icon}`} />}
      {!importedIcon && <Icon name={icon} additionalClassName="icon"></Icon>}
      <div className="label">{chrome.i18n.getMessage(label, labelParams)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { navigateToWithParams });
type PropsFromRedux = ConnectedProps<typeof connector> &
  DropdownMenuItemInterface;

export const DropdownMenuItemComponent = connector(DropdownMenuItem);
