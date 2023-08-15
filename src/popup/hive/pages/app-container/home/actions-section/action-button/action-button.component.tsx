import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ActionButton } from 'src/interfaces/action-button.interface';
import { navigateToWithParams } from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import './action-button.component.scss';

const ActionButton = ({
  label,
  icon,
  nextScreen,
  nextScreenParams,
  navigateToWithParams,
}: PropsType) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-testid={`action-button-${label}`}
      className="action-button"
      onClick={() => navigateToWithParams(nextScreen, nextScreenParams)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="icon-container">
        <SVGIcon icon={icon} className="icon" forceHover={hovered} hoverable />
      </div>
      <div className="label">{chrome.i18n.getMessage(label)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsType = ConnectedProps<typeof connector> & ActionButton;

export const ActionButtonComponent = connector(ActionButton);