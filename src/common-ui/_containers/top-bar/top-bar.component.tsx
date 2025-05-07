import React, { useState } from 'react';
import { ChainDropdownComponent } from 'src/common-ui/chain-dropdown/chain-dropdown.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface TopBarProps {
  onMenuButtonClicked: () => Promise<void>;
  onRefreshButtonClicked: () => Promise<void>;
  accountSelector: JSX.Element;
  actions?: JSX.Element;
}

export const TopBarComponent = ({
  accountSelector,
  actions,
  onMenuButtonClicked,
  onRefreshButtonClicked,
}: TopBarProps) => {
  const [rotateLogo, setRotateLogo] = useState(false);

  const refresh = async () => {
    setRotateLogo(true);
    await onRefreshButtonClicked();

    setTimeout(() => {
      setRotateLogo(false);
    }, 1000);
  };

  return (
    <div className="top-bar">
      <SVGIcon
        dataTestId="clickable-settings"
        icon={SVGIcons.MENU_BUTTON}
        onClick={() => onMenuButtonClicked()}
        className="button settings-button"
      />
      <div className="logo-container">
        <SVGIcon
          className={`logo ${rotateLogo ? 'rotate' : ''}`}
          icon={SVGIcons.TOP_BAR_KEYCHAIN_LOGO}
          onClick={refresh}
          data-testid="top-bar-refresh-icon"
        />
      </div>

      {actions && <div className="top-bar-actions">{actions}</div>}
      <div className="account-selector-panel">{accountSelector}</div>
      <ChainDropdownComponent />
    </div>
  );
};
