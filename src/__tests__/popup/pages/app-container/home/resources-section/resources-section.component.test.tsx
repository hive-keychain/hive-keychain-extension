import App from '@popup/App';
import { screen } from '@testing-library/react';
import React from 'react';
import resourcesSection from 'src/__tests__/popup/pages/app-container/home/resources-section/mocks/resources-section';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
jest.setTimeout(10000);
describe('resources-section.component tests:\n', () => {
  const { methods, constants } = resourcesSection;
  methods.afterEach;
  describe('existing data\n:', () => {
    beforeEach(async () => {
      await resourcesSection.beforeEach(<App />);
    });
    it('Must show mana and resource credits', () => {
      assertion.toHaveTextContent([
        { arialabel: alDiv.resources.vm, text: constants.wMana },
        { arialabel: alDiv.resources.rc, text: constants.wRc },
      ]);
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
  describe('zero as data\n:', () => {
    beforeEach(async () => {
      await resourcesSection.beforeEach(<App />, true);
    });
    it('Must show -- as mana and credits 0', () => {
      assertion.toHaveTextContent([
        { arialabel: alDiv.resources.vm, text: constants.noMana },
        { arialabel: alDiv.resources.rc, text: constants.zeroRc },
      ]);
    });
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
