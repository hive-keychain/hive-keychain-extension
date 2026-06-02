import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { Theme, useThemeContext } from '@popup/theme.context';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import SwitchComponent from 'src/common-ui/switch/switch.component';

const SettingsPreferencesDisplayPage = ({
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const { setTheme, theme } = useThemeContext();
  const [openSidePanelByDefault, setOpenSidePanelByDefault] = useState(false);
  const isToolbarPopup = ExtensionSurfaceUtils.isToolbarPopup();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_preferences_and_display',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  const handleOpenInSidePanel = () => {
    void DetachedExtensionTabUtils.openDetachedExtension();
  };

  return (
    <div
      data-testid="settings-preferences-display-content-page"
      className="settings-preferences-display-page">
      <div className="fields">
        <div className="settings-section">
          <div className="section-title">
            {chrome.i18n.getMessage('popup_html_preferences_appearance_section')}
          </div>
          <div className="section-fields">
            <SwitchComponent
              dataTestId="theme-mode"
              leftValue={Theme.LIGHT}
              rightValue={Theme.DARK}
              selectedValue={theme ?? Theme.LIGHT}
              onChange={handleThemeChange}
              leftValueLabel="popup_html_light_mode"
              rightValueLabel="popup_html_dark_mode"
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            {chrome.i18n.getMessage('popup_html_preferences_display_section')}
          </div>
          <div className="section-fields">
            {isToolbarPopup && (
              <>
                <p className="settings-page-note">
                  {chrome.i18n.getMessage('popup_html_open_in_side_panel_hint')}
                </p>
                <ButtonComponent
                  dataTestId="button-open-side-panel"
                  label="popup_html_open_in_side_panel"
                  logo={SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION}
                  onClick={handleOpenInSidePanel}
                />
              </>
            )}
            <CheckboxPanelComponent
              dataTestId="checkbox-open-side-panel-by-default"
              title="popup_html_open_side_panel_by_default"
              hint="popup_html_open_side_panel_by_default_hint"
              checked={openSidePanelByDefault}
              onChange={setOpenSidePanelByDefault}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const connector = connect((state: RootState) => ({}), {
  setTitleContainerProperties,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsPreferencesDisplayPageComponent = connector(
  SettingsPreferencesDisplayPage,
);
