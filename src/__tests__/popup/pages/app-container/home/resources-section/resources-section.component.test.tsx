import App from '@popup/App';
import { screen } from '@testing-library/react';
import React from 'react';
import resourcesSection from 'src/__tests__/popup/pages/app-container/home/resources-section/mocks/resources-section';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
jest.setTimeout(10000);
describe('resources-section.component tests:\n', () => {
  const { methods, constants } = resourcesSection;
  methods.afterEach;
  describe('valid data', () => {
    beforeEach(async () => {
      await resourcesSection.beforeEach(<App />, false);
    });
    it('Must show mana and resource credits', () => {
      expect(screen.getByLabelText(alDiv.resources.vm)).toHaveTextContent(
        constants.wMana,
      );
      expect(screen.getByLabelText(alDiv.resources.rc)).toHaveTextContent(
        constants.wRc,
      );
    });
    it('Must show tool tip when hover on mana', async () => {
      await clickTypeAwait([
        { ariaLabel: alDiv.resources.vm, event: EventType.HOVER },
      ]);
      expect(screen.getByLabelText(alToolTip.content)).toHaveTextContent(
        constants.toolTip.fullIn,
      );
    });
    it('Must show tool tip when hover on credits', async () => {
      await clickTypeAwait([
        { ariaLabel: alDiv.resources.rc, event: EventType.HOVER },
      ]);
      expect(screen.getByLabelText(alToolTip.content)).toHaveTextContent(
        constants.toolTip.fullIn,
      );
    });
  });
  describe('invalid data', () => {
    beforeEach(async () => {
      await resourcesSection.beforeEach(<App />, true);
    });
    it('Must show -- as mana and credits if no response from hive', () => {
      expect(screen.getByLabelText(alDiv.resources.vm)).toHaveTextContent(
        constants.noMana,
      );
      expect(screen.getByLabelText(alDiv.resources.rc)).toHaveTextContent(
        constants.noRc,
      );
    });

    //TODO
    // pass getAccounts with no activeAccount?.account?.voting_manabar?.current_mana !== 0;
    // refactor and done.
    it('Must show no hp tool tip when hover on mana', async () => {
      await clickTypeAwait([
        { ariaLabel: alDiv.resources.vm, event: EventType.HOVER },
      ]);
      expect(screen.getByLabelText(alToolTip.content)).toHaveTextContent(
        constants.toolTip.noHp,
      );
    });
  });
});
