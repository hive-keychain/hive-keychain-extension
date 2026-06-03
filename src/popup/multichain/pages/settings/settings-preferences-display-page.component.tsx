import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { Theme, useThemeContext } from '@popup/theme.context';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ThemeToggleComponent } from 'src/common-ui/theme-toggle/theme-toggle.component';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

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

  useEffect(() => {
    const loadOpenSidePanelByDefault = async () => {
      const enabled =
        await SidePanelPreferenceUtils.getOpenSidePanelByDefault();
      setOpenSidePanelByDefault(enabled);
    };

    void loadOpenSidePanelByDefault();
  }, []);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  const handleOpenInSidePanel = () => {
    void DetachedExtensionTabUtils.openDetachedExtension();
  };

  const handleOpenSidePanelByDefaultChange = (checked: boolean) => {
    setOpenSidePanelByDefault(checked);
    void SidePanelPreferenceUtils.setOpenSidePanelByDefault(checked);
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
            <ThemeToggleComponent
              selectedTheme={theme ?? Theme.LIGHT}
              onChange={handleThemeChange}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            {chrome.i18n.getMessage('popup_html_preferences_display_section')}
          </div>
          <div className="section-fields">
            {isToolbarPopup && (
              <button
                type="button"
                data-testid="button-open-side-panel"
                className="try-side-panel-action"
                onClick={handleOpenInSidePanel}>
                <SVGIcon
                  icon={SVGIcons.SIDE_PANEL_DETACH}
                  className="try-side-panel-action-icon"
                />
                <span className="try-side-panel-action-label">
                  {chrome.i18n.getMessage('popup_html_try_side_panel')}
                </span>
              </button>
            )}
            <CheckboxPanelComponent
              dataTestId="checkbox-open-side-panel-by-default"
              title="popup_html_open_side_panel_by_default"
              hint="popup_html_open_side_panel_by_default_hint"
              checked={openSidePanelByDefault}
              onChange={handleOpenSidePanelByDefaultChange}
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
