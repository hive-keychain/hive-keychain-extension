import { Screen } from '@interfaces/screen.interface';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Theme, useThemeContext } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {
  DisplayAppearancePreferencesComponent,
  DisplayMode,
} from 'src/popup/multichain/pages/settings/display-appearance-preferences.component';
import { buildAddAccountSetupTitleProperties } from 'src/popup/hive/pages/add-account/add-account-setup-title.utils';
import { SetupAppearanceDraftUtils } from 'src/popup/multichain/utils/setup-appearance-draft.utils';
import { I18nLanguageOption, I18nUtils } from 'src/utils/i18n.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

const DisplayAppearanceSetupPage = ({
  hasFinishedSignup,
  navigateTo,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const { setTheme } = useThemeContext();
  const isMigrationSetup = hasFinishedSignup === true;
  const setupDraft = SetupAppearanceDraftUtils.getDraft();
  const [selectedDisplayMode, setSelectedDisplayMode] = useState(
    () => setupDraft?.displayMode ?? DisplayMode.POPUP,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<I18nLanguageOption>(
    () =>
      I18nUtils.getLanguageOption(
        setupDraft?.language ?? I18nUtils.BROWSER_LANGUAGE_PREFERENCE,
      ),
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_preferences_and_display',
      isBackButtonEnabled: false,
      isCloseButtonDisabled: true,
    });
  }, [setTitleContainerProperties]);

  useEffect(() => {
    const draftTheme = SetupAppearanceDraftUtils.getDraft()?.theme;
    if (draftTheme) {
      setTheme(draftTheme);
      return;
    }

    if (!isMigrationSetup) {
      setTheme(Theme.LIGHT);
    }
  }, [isMigrationSetup, setTheme]);

  const handlePreferencesChange = useCallback(
    ({
      displayMode,
      language,
    }: {
      displayMode: DisplayMode;
      language: I18nLanguageOption;
    }) => {
      setSelectedDisplayMode(displayMode);
      setSelectedLanguage(language);
    },
    [],
  );

  const handleContinue = async () => {
    await Promise.all([
      SidePanelPreferenceUtils.setOpenSidePanelByDefault(
        selectedDisplayMode === DisplayMode.SIDE_PANEL,
      ),
      I18nUtils.saveLanguage(selectedLanguage.value),
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.DISPLAY_APPEARANCE_SETUP_COMPLETED,
        true,
      ),
    ]);
    SetupAppearanceDraftUtils.clearDraft();

    if (isMigrationSetup) {
      navigateTo(Screen.HOME_PAGE, true);
      return;
    }

    setTitleContainerProperties(buildAddAccountSetupTitleProperties(false));
    navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
  };

  return (
    <div
      className="display-appearance-setup-page"
      data-testid="display-appearance-setup-page">
      <div className="display-appearance-setup-description">
        {I18nUtils.getMessage('popup_html_customize_keychain_appearance')}
      </div>
      <div className="display-appearance-setup-content">
        <DisplayAppearancePreferencesComponent
          dataTestId="setup-display-appearance-preferences"
          defaultDisplayMode={DisplayMode.POPUP}
          loadStoredDisplayMode={isMigrationSetup}
          loadStoredLanguage={isMigrationSetup}
          persistDisplayModeOnChange={false}
          persistLanguageOnChange={false}
          showReopenNotice={true}
          onChange={handlePreferencesChange}
        />
      </div>
      <ButtonComponent
        label="popup_html_next"
        onClick={handleContinue}
        dataTestId="display-appearance-setup-continue"
        additionalClass="display-appearance-setup-continue"
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  hasFinishedSignup: state.hasFinishedSignup,
});

const connector = connect(mapStateToProps, {
  navigateTo,
  setTitleContainerProperties,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const DisplayAppearanceSetupPageComponent = connector(
  DisplayAppearanceSetupPage,
);
