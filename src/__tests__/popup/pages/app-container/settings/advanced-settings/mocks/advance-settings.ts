import { Icons } from '@popup/icons.enum';
import AdvancedSettingsMenuItems from '@popup/pages/app-container/settings/advanced-settings/advanced-settings-menu-items';
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
  { icon: Icons.RPC, ariaLabel: alComponent.advanceSettings.rpcNodes },
  { icon: Icons.AUTO_LOCK, ariaLabel: alComponent.advanceSettings.autoLock },
  {
    icon: Icons.PASSWORD,
    ariaLabel: alComponent.advanceSettings.changePassword,
  },
  { icon: Icons.LINK, ariaLabel: alComponent.advanceSettings.link },
  {
    icon: Icons.IMPORT_EXPORT,
    ariaLabel: alComponent.advanceSettings.importExport,
  },
  { icon: Icons.CLEAR, ariaLabel: alComponent.advanceSettings.clearAllData },
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
    advanceSettings: AdvancedSettingsMenuItems,
  },
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.menu, alButton.menuPreFix + Icons.SETTINGS]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = () => {};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  menuPages,
};
