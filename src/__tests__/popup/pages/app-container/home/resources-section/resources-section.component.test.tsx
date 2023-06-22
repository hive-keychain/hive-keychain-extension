import { ExtendedAccount } from '@hiveio/dhive';
import { RC } from '@interfaces/active-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdToolTip from 'src/__tests__/utils-for-testing/data-testid/data-testid-tool-tip';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import fake_RC from 'src/__tests__/utils-for-testing/data/rc';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import HiveUtils from 'src/utils/hive.utils';

describe('resources-section.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const extendedAccountVestingsAsString = {
    ...accounts.extended,
    vesting_shares: '10000 VESTS',
    received_vesting_shares: '20000 VESTS',
    delegated_vesting_shares: '100 VESTS',
  };
  const mana = HiveUtils.getVP(extendedAccountVestingsAsString);

  describe('existing data\n:', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
    });
    it('Must show mana and resource credits, labels & values', async () => {
      expect(
        await screen.findByLabelText(dataTestIdDiv.resources.vm),
      ).toHaveTextContent(
        `${Icons.ARROW_UP}${chrome.i18n.getMessage(
          'popup_html_vm',
        )}1.00 % (1.00 $)`,
      );
      expect(
        await screen.findByLabelText(dataTestIdDiv.resources.rc),
      ).toHaveTextContent(
        `${Icons.RC}${chrome.i18n.getMessage('popup_html_rc')}100.00 %`,
      );
    });

    it('Must show tool tip when hover on mana', async () => {
      await act(async () => {
        await userEvent.hover(
          screen.getByLabelText(dataTestIdDiv.resources.vm),
        );
      });
      expect(
        await screen.findByLabelText(dataTestIdToolTip.content),
      ).toHaveTextContent(HiveUtils.getTimeBeforeFull(mana!));
    });

    it('Must show tool tip when hover on credits', async () => {
      await act(async () => {
        await userEvent.hover(
          screen.getByLabelText(dataTestIdDiv.resources.rc),
        );
      });
      expect(
        await screen.findByLabelText(dataTestIdToolTip.content),
      ).toHaveTextContent(HiveUtils.getTimeBeforeFull(fake_RC.rc.percentage));
    });
  });

  describe('zero as data\n:', () => {
    const extendedAccountZero = {
      ...accounts.extended,
      voting_manabar: {
        current_mana: 0,
      },
    } as ExtendedAccount;
    const rcZero = {
      current_mana: 0,
      percentage: 0,
      delegated_rc: 0,
      received_delegated_rc: 0,
      max_rc: 0,
      max_mana: 0,
    } as RC;
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getExtendedAccount: extendedAccountZero,
                getRCMana: rcZero,
              },
            },
          },
        },
      );
    });
    it('Must show -- as mana and credits 0', async () => {
      expect(
        await screen.findByLabelText(dataTestIdDiv.resources.vm),
      ).toHaveTextContent(
        `${Icons.ARROW_UP}${chrome.i18n.getMessage('popup_html_vm')}--`,
      );
      expect(
        await screen.findByLabelText(dataTestIdDiv.resources.rc),
      ).toHaveTextContent(
        `${Icons.RC}${chrome.i18n.getMessage('popup_html_rc')}0.00 %`,
      );
    });

    it('Must show no hp tool tip when hover on mana', async () => {
      await act(async () => {
        await userEvent.hover(
          screen.getByLabelText(dataTestIdDiv.resources.vm),
        );
      });
      expect(
        await screen.findByLabelText(dataTestIdToolTip.content),
      ).toHaveTextContent(chrome.i18n.getMessage('html_popup_voting_no_hp'));
    });
  });
});
