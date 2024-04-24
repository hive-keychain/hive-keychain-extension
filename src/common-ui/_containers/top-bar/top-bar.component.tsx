import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface TopBarProps {
  onMenuButtonClicked: () => Promise<void>;
  onRefreshButtonClicked: () => Promise<void>;
  accountSelector: JSX.Element;
  extraComponents?: JSX.Element;
}

export const TopBarComponent = ({
  accountSelector,
  extraComponents,
  onMenuButtonClicked,
  onRefreshButtonClicked,
}: TopBarProps) => {
  const [rotateLogo, setRotateLogo] = useState(false);

  const refresh = async () => {
    setRotateLogo(true);
    await onRefreshButtonClicked();
    setRotateLogo(false);
  };

  return (
    <div className="top-bar">
      <SVGIcon
        dataTestId="clickable-settings"
        icon={SVGIcons.MENU_BUTTON}
        onClick={() => onMenuButtonClicked()}
        className="button settings-button"
      />
      <SVGIcon
        className={`logo ${rotateLogo ? 'rotate' : ''}`}
        icon={SVGIcons.TOP_BAR_KEYCHAIN_LOGO}
        onClick={refresh}
        data-testid="top-bar-refresh-icon"
      />
      {extraComponents}
      <div className="spacer"></div>
      {accountSelector}
    </div>
  );
};
