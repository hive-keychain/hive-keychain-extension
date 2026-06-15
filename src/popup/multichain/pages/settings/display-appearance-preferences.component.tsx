import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { Theme, useThemeContext } from '@popup/theme.context';
import React, { Fragment, useEffect, useState } from 'react';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ThemeToggleComponent } from 'src/common-ui/theme-toggle/theme-toggle.component';
import { SetupAppearanceDraftUtils } from 'src/popup/multichain/utils/setup-appearance-draft.utils';
import { I18nLanguageOption, I18nUtils } from 'src/utils/i18n.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

const getInitialDisplayMode = (
  defaultDisplayMode: DisplayMode,
  useSetupDraft: boolean,
): DisplayMode => {
  if (!useSetupDraft) {
    return defaultDisplayMode;
  }

  return SetupAppearanceDraftUtils.getDraft()?.displayMode ?? defaultDisplayMode;
};

const getInitialLanguage = (useSetupDraft: boolean): I18nLanguageOption => {
  const draftLanguage = useSetupDraft
    ? SetupAppearanceDraftUtils.getDraft()?.language
    : undefined;

  return I18nUtils.getLanguageOption(
    draftLanguage ?? I18nUtils.BROWSER_LANGUAGE_PREFERENCE,
  );
};

export enum DisplayMode {
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

interface DisplayAppearancePreferencesValue {
  displayMode: DisplayMode;
  language: I18nLanguageOption;
}

interface DisplayAppearancePreferencesProps {
  dataTestId?: string;
  defaultDisplayMode?: DisplayMode;
  loadStoredDisplayMode?: boolean;
  loadStoredLanguage?: boolean;
  persistDisplayModeOnChange?: boolean;
  persistLanguageOnChange?: boolean;
  showReopenNotice?: boolean;
  onChange?: (preferences: DisplayAppearancePreferencesValue) => void;
}

export const DisplayAppearancePreferencesComponent = ({
  dataTestId = 'display-appearance-preferences',
  defaultDisplayMode = DisplayMode.POPUP,
  loadStoredDisplayMode = true,
  loadStoredLanguage = true,
  persistDisplayModeOnChange = true,
  persistLanguageOnChange = true,
  showReopenNotice = false,
  onChange,
}: DisplayAppearancePreferencesProps) => {
  const useSetupDraft = !persistLanguageOnChange;
  const { setTheme, theme } = useThemeContext();
  const [selectedDisplayMode, setSelectedDisplayMode] = useState(() =>
    getInitialDisplayMode(defaultDisplayMode, useSetupDraft),
  );
  const [selectedLanguage, setSelectedLanguage] = useState<I18nLanguageOption>(
    () => getInitialLanguage(useSetupDraft),
  );
  const languageOptions = I18nUtils.getLanguageOptions();
  const currentDisplayMode = getCurrentDisplayMode();
  const shouldShowReopenNotice =
    showReopenNotice &&
    currentDisplayMode !== undefined &&
    selectedDisplayMode !== currentDisplayMode;

  useEffect(() => {
    if (!loadStoredDisplayMode) {
      return;
    }

    let isMounted = true;
    void SidePanelPreferenceUtils.getOpenSidePanelByDefault().then(
      (openSidePanelByDefault) => {
        if (isMounted) {
          setSelectedDisplayMode(
            openSidePanelByDefault ? DisplayMode.SIDE_PANEL : DisplayMode.POPUP,
          );
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [loadStoredDisplayMode]);

  useEffect(() => {
    if (!loadStoredLanguage) {
      return;
    }

    let isMounted = true;
    void I18nUtils.getSavedOrDefaultLanguage().then((language) => {
      if (isMounted) {
        setSelectedLanguage(I18nUtils.getLanguageOption(language));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadStoredLanguage]);

  useEffect(() => {
    onChange?.({
      displayMode: selectedDisplayMode,
      language: selectedLanguage,
    });
  }, [onChange, selectedDisplayMode, selectedLanguage]);

  useEffect(() => {
    if (!useSetupDraft) {
      return;
    }

    SetupAppearanceDraftUtils.saveDraft({
      displayMode: selectedDisplayMode,
      language: selectedLanguage.value,
      theme,
    });
  }, [selectedDisplayMode, selectedLanguage, theme, useSetupDraft]);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  const handleDisplayModeChange = (displayMode: DisplayMode) => {
    setSelectedDisplayMode(displayMode);
    if (persistDisplayModeOnChange) {
      void SidePanelPreferenceUtils.setOpenSidePanelByDefault(
        displayMode === DisplayMode.SIDE_PANEL,
      );
    }
  };

  const handleLanguageChange = (language: I18nLanguageOption) => {
    setSelectedLanguage(language);
    if (!persistLanguageOnChange) {
      void I18nUtils.changeLanguage(language.value);
      return;
    }

    void I18nUtils.saveLanguage(language.value).then((savedLanguage) => {
      setSelectedLanguage(I18nUtils.getLanguageOption(savedLanguage));
    });
  };

  return (
    <div className="display-appearance-preferences" data-testid={dataTestId}>
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
          {shouldShowReopenNotice && (
            <div
              className="display-mode-reopen-notice"
              data-testid="display-mode-reopen-notice">
              {I18nUtils.getMessage(
                'popup_html_display_mode_reopen_wallet_notice',
              )}
            </div>
          )}
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

const getCurrentDisplayMode = (): DisplayMode | undefined => {
  if (ExtensionSurfaceUtils.isSidePanelPage()) {
    return DisplayMode.SIDE_PANEL;
  }
  if (ExtensionSurfaceUtils.isToolbarPopup()) {
    return DisplayMode.POPUP;
  }
  return undefined;
};
