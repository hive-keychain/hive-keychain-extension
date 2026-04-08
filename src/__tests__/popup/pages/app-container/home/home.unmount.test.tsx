import '@testing-library/jest-dom';
import { act, cleanup } from '@testing-library/react';
import { HiveEngineUtils } from '@popup/hive/utils/hive-engine.utils';
import { HiveInternalMarketUtils } from '@popup/hive/utils/hive-internal-market.utils';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { GovernanceUtils } from 'src/popup/hive/utils/governance.utils';
import React from 'react';
import { initialStateForHome } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { HiveHomeComponent } from 'src/popup/hive/pages/app-container/home/hive-home.component';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';

jest.mock('src/popup/hive/actions/active-account.actions', () => ({
  refreshActiveAccount: jest.fn(() => ({ type: 'REFRESH_ACTIVE_ACCOUNT' })),
  loadActiveAccount: jest.fn(() => ({ type: 'LOAD_ACTIVE_ACCOUNT' })),
}));

jest.mock(
  'src/common-ui/_containers/homepage-container/homepage-container.component',
  () => ({
    HomepageContainer: ({ children, datatestId }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': datatestId }, children);
    },
  }),
);

jest.mock('src/common-ui/_containers/top-bar/top-bar.component', () => ({
  TopBarComponent: ({ actions, accountSelector }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, actions, accountSelector);
  },
}));

jest.mock(
  'src/common-ui/estimated-account-value-section/estimated-account-value-section.component',
  () => ({
    EstimatedAccountValueSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'estimated-account-value-section',
      });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section.component',
  () => ({
    HiveWalletInfoSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'wallet-info-section',
      });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/home/notifications/notifications.component',
  () => ({
    NotificationsComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'notifications' });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/select-account-section/select-account-section.component',
  () => ({
    SelectAccountSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'account-selector' });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/tutorial-popup/tutorial-popup.component',
  () => ({
    TutorialPopupComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'tutorial-popup' });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/vesting-routes-popup/vesting-routes-popup.component',
  () => ({
    VestingRoutesPopupComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'vesting-routes-popup',
      });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/actions-section/actions-section.component',
  () => ({
    ActionsSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'actions-section' });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/governance-renewal/governance-renewal.component',
  () => ({
    GovernanceRenewalComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'governance-renewal',
      });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/resources-section/resources-section.component',
  () => ({
    ResourcesSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'resources-section' });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component',
  () => ({
    ProposalVotingSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'proposal-voting-section',
      });
    },
  }),
);

jest.mock('src/popup/hive/pages/app-container/survey/survey.component', () => ({
  SurveyComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'survey' });
  },
}));

jest.mock(
  'src/popup/hive/pages/app-container/whats-new/whats-new.component',
  () => ({
    WhatsNewComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'whats-new-popup' });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component',
  () => ({
    WrongKeyPopupComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'wrong-key-popup' });
    },
  }),
);

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('home.component unmount behavior', () => {
  const hasUnmountedStateUpdateWarning = (
    consoleError: jest.SpyInstance<void, any[]>,
  ) =>
    consoleError.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes(
            "Can't perform a React state update on an unmounted component",
          ),
      ),
    );

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    chrome.runtime.getManifest = jest.fn(() => ({
      version: '1.0.0',
      name: 'Hive Keychain',
    })) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('does not update local state after async initializers resolve post-unmount', async () => {
    const surveyDeferred = createDeferred<any>();
    const hiddenTokensDeferred = createDeferred<string[]>();
    const extendedAccountsDeferred = createDeferred<any[]>();
    const vestingRoutesDeferred = createDeferred<any[]>();
    const governanceDeferred = createDeferred<string[]>();
    const marketOrdersDeferred = createDeferred<{ hive: number; hbd: number }>();

    jest.spyOn(SurveyUtils, 'getSurvey').mockReturnValue(surveyDeferred.promise);
    jest
      .spyOn(HiveEngineUtils, 'loadHiddenTokensList')
      .mockReturnValue(hiddenTokensDeferred.promise);
    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockReturnValue(extendedAccountsDeferred.promise as any);
    jest
      .spyOn(VestingRoutesUtils, 'getWrongVestingRoutes')
      .mockReturnValue(vestingRoutesDeferred.promise as any);
    jest
      .spyOn(GovernanceUtils, 'getGovernanceReminderList')
      .mockReturnValue(governanceDeferred.promise);
    jest
      .spyOn(HiveInternalMarketUtils, 'getHiveInternalMarketOrders')
      .mockReturnValue(marketOrdersDeferred.promise as any);
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockImplementation(
      async (key: LocalStorageKeyEnum) => {
        switch (key) {
          case LocalStorageKeyEnum.LAST_VERSION_UPDATE:
            return '0.9';
          case LocalStorageKeyEnum.NO_KEY_CHECK:
            return {};
          default:
            return undefined;
        }
      },
    );
    jest.spyOn(VersionLogUtils, 'getLastVersion').mockResolvedValue(undefined as any);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(<HiveHomeComponent />, {
      initialState: initialStateForHome,
    });

    unmount();

    await act(async () => {
      surveyDeferred.resolve(undefined);
      hiddenTokensDeferred.resolve([]);
      extendedAccountsDeferred.resolve([]);
      vestingRoutesDeferred.resolve([]);
      governanceDeferred.resolve([]);
      marketOrdersDeferred.resolve({ hive: 0, hbd: 0 });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });
});
