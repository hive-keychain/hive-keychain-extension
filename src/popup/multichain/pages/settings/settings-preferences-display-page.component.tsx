import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Theme, useThemeContext } from '@popup/theme.context';
import React, { Fragment, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ThemeToggleComponent } from 'src/common-ui/theme-toggle/theme-toggle.component';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

import { I18nLanguageOption, I18nUtils } from 'src/utils/i18n.utils';

enum DisplayMode {
  POPUP = 'popup',
  SIDE_PANEL = 'side-panel',
}

interface DisplayModeToggleOption {
  value: DisplayMode;
  label: string;
  icon: SVGIcons;
  testId: string;
}

const DISPLAY_MODE_TOGGLE_OPTIONS: DisplayModeToggleOption[] = [
  {
    value: DisplayMode.POPUP,
    label: 'popup_html_display_popup',
    icon: SVGIcons.DISPLAY_MODE_POPUP,
    testId: 'display-mode-toggle-popup',
  },
  {
    value: DisplayMode.SIDE_PANEL,
    label: 'popup_html_display_side_panel',
    icon: SVGIcons.SIDE_PANEL_DETACH,
    testId: 'display-mode-toggle-side-panel',
  },
];

const SettingsPreferencesDisplayPage = ({
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const { setTheme, theme } = useThemeContext();
  const [openSidePanelByDefault, setOpenSidePanelByDefault] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<I18nLanguageOption>(
    I18nUtils.getLanguageOption(),
  );
  const languageOptions = I18nUtils.getLanguageOptions();
  const selectedDisplayMode = openSidePanelByDefault
    ? DisplayMode.SIDE_PANEL
    : DisplayMode.POPUP;

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_preferences_and_display',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  useEffect(() => {
    const loadOpenSidePanelByDefault = async () => {
      const enabled = await SidePanelPreferenceUtils.getOpenSidePanelByDefault();
      setOpenSidePanelByDefault(enabled);
    };

    void loadOpenSidePanelByDefault();
  }, []);

  useEffect(() => {
    let isMounted = true;

    void I18nUtils.getSavedOrDefaultLanguage().then((language) => {
      if (isMounted) {
        setSelectedLanguage(I18nUtils.getLanguageOption(language));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  const handleDisplayModeChange = (displayMode: DisplayMode) => {
    const shouldOpenSidePanelByDefault = displayMode === DisplayMode.SIDE_PANEL;
    setOpenSidePanelByDefault(shouldOpenSidePanelByDefault);
    void SidePanelPreferenceUtils.setOpenSidePanelByDefault(
      shouldOpenSidePanelByDefault,
    );
  };

  const handleLanguageChange = (language: I18nLanguageOption) => {
    setSelectedLanguage(language);
    void I18nUtils.saveLanguage(language.value).then((savedLanguage) => {
      setSelectedLanguage(I18nUtils.getLanguageOption(savedLanguage));
    });
  };

  return (
    <div
      data-testid="settings-preferences-display-content-page"
      className="settings-preferences-display-page">
      <div className="fields">
        <div className="settings-section">
          <div className="section-title">
            {I18nUtils.getMessage('popup_html_preferences_appearance_section')}
          </div>
          <div className="section-fields">
            <ThemeToggleComponent
              selectedTheme={theme ?? Theme.LIGHT}
              onChange={handleThemeChange}
            />
            <div className="language-select-panel">
              <ComplexeCustomSelect
                label="popup_html_preferences_language"
                options={languageOptions}
                selectedItem={selectedLanguage}
                setSelectedItem={handleLanguageChange}
                background="white"
                selectHandleDataTestId="language-select-handle"
                ariaLabel={I18nUtils.getMessage(
                  'popup_html_preferences_language',
                )}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            {I18nUtils.getMessage('popup_html_preferences_display_section')}
          </div>
          <div className="section-fields">
            <DisplayModeToggleComponent
              selectedDisplayMode={selectedDisplayMode}
              onChange={handleDisplayModeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DisplayModeToggleProps {
  selectedDisplayMode: DisplayMode;
  onChange: (displayMode: DisplayMode) => void;
}

const DisplayModeToggleComponent = ({
  selectedDisplayMode,
  onChange,
}: DisplayModeToggleProps) => {
  const selectedIndex = DISPLAY_MODE_TOGGLE_OPTIONS.findIndex(
    (option) => option.value === selectedDisplayMode,
  );

  return (
    <div className="theme-toggle" data-testid="display-mode-toggle">
      <div className="theme-toggle-tabs">
        {DISPLAY_MODE_TOGGLE_OPTIONS.map((option) => {
          const isSelected = option.value === selectedDisplayMode;

          return (
            <Fragment key={option.value}>
              <input
                type="radio"
                id={`display-mode-toggle-${option.value}`}
                name="display-mode-toggle"
                checked={isSelected}
                onChange={() => onChange(option.value)}
              />
              <label
                data-testid={option.testId}
                className={`theme-toggle-tab ${isSelected ? 'selected' : ''}`}
                htmlFor={`display-mode-toggle-${option.value}`}>
                <SVGIcon icon={option.icon} />
                <span className="theme-toggle-label">
                  {I18nUtils.getMessage(option.label)}
                </span>
              </label>
            </Fragment>
          );
        })}
        <span
          className="theme-toggle-glider"
          style={{
            transform: `translateX(calc(${selectedIndex} * 100%))`,
          }}
        />
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
