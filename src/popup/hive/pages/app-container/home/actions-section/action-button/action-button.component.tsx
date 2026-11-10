import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ActionButton } from 'src/interfaces/action-button.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
const ActionButton = ({
  label,
  icon,
  nextScreen,
  nextScreenParams,
  onClick,
  navigateToWithParams,
}: PropsType) => {
  const [hovered, setHovered] = useState(false);
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (nextScreen) {
      navigateToWithParams(nextScreen, nextScreenParams);
    }
  };

  return (
    <div
      data-testid={`action-button-${label}`}
      className="action-button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="icon-container">
        <SVGIcon icon={icon} className="icon" forceHover={hovered} hoverable />
      </div>
      <div className="label">{I18nUtils.getMessage(label)}</div>
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
