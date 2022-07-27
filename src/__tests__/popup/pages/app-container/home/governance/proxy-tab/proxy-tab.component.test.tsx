import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import proxy from 'src/__tests__/popup/pages/app-container/home/governance/proxy-tab/mocks/proxy';
import initialProxy from 'src/__tests__/popup/pages/app-container/home/governance/proxy-tab/othercases/initial-proxy';
import noActiveKey from 'src/__tests__/popup/pages/app-container/home/governance/proxy-tab/othercases/no-active-key';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('proxy-tab.component tests:\n', () => {
  const { methods, extraMocks, constants } = proxy;
  methods.afterEach;
  describe('with active key cases:\n', () => {
    describe('empty proxy', () => {
      beforeEach(async () => {
        await proxy.beforeEach(<App />, false, false);
      });
      it('Must show intro message for empty proxy', () => {
        assertion.getOneByText(constants.introMessage.noProxy);
      });
      it('Must change the input username when typying', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: 'keychain',
          },
        ]);
        assertion.getByDisplay('keychain');
      });
      it('Must clear the input when clicking clear icon', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: 'keychain',
          },
        ]);
        assertion.getByDisplay('keychain');
        await clickTypeAwait([
          {
            ariaLabel: alIcon.input.clear,
            event: EventType.CLICK,
          },
        ]);
        expect(screen.getByLabelText(alInput.username)).toHaveTextContent('');
      });
      it('Must set proxy and show message', async () => {
        extraMocks({ setAsProxy: true });
        await methods.typeNClick('keychain');
        await assertion.awaitFor(constants.successMessage, QueryDOM.BYTEXT);
      });
      it('Must show error when set proxy fails', async () => {
        extraMocks({ setAsProxy: false });
        await methods.typeNClick('keychain');
        await assertion.awaitFor(constants.errorMessage.set, QueryDOM.BYTEXT);
      });
    });
    describe('initial proxy', () => {
      beforeEach(async () => {
        await proxy.beforeEach(<App />, false, true);
      });
      initialProxy.run();
    });
  });
  describe('no active key cases:\n', () => {
    beforeEach(async () => {
      await proxy.beforeEach(<App />, true, false);
    });
    noActiveKey.run();
  });
});
