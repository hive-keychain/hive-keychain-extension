import { Icons } from '@popup/icons.enum';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
import { ReactElement } from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { IconsPage } from 'src/__tests__/utils-for-testing/interfaces/elements';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const menuPages: IconsPage[] = [
  { icon: Icons.ACCOUNTS, ariaLabel: alComponent.peoplePage },
  { icon: Icons.PREFERENCES, ariaLabel: alComponent.tunePage },
  { icon: Icons.SETTINGS, ariaLabel: alComponent.settingsPage },
  { icon: Icons.INFO, ariaLabel: alComponent.infoPage },
];

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  messages: {
    about: i18n.get('popup_html_about_text'),
  },
  menuItems: {
    settings: SettingsMenuItems,
    settingsFiltered: SettingsMenuItems.filter(
      (menuItem) => menuItem.icon !== Icons.SUPPORT,
    ),
    urlSupport: { url: 'https://discord.gg/E6P6Gjv9MC' },
  },
};

const beforeEach = async (component: ReactElement) => {
  let _asFragment = DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.menu]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  spyChromeTabs: () => jest.spyOn(chrome.tabs, 'create'),
};

const extraMocks = () => {};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  menuPages,
};
