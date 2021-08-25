import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActionButton } from 'src/interfaces/action-button.interface';
import './action-button.component.scss';

const ActionButton = ({ label, icon, nextScreen, navigateTo }: PropsType) => {
  return (
    <div className="action-button" onClick={() => navigateTo(nextScreen)}>
      <img className="icon" src={`/assets/images/${icon}.png`} />
      <div className="label">{chrome.i18n.getMessage(label)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateTo,
});
type PropsType = ConnectedProps<typeof connector> & ActionButton;

export const ActionButtonComponent = connector(ActionButton);
