import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import estimatedAccountValue from 'src/__tests__/popup/pages/app-container/home/estimated-account-value-section/mocks/estimated-account-value';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
const { constants, methods } = estimatedAccountValue;
describe('estimated-account-value-section.component tests:\n', () => {
  estimatedAccountValue.methods.after;
  describe('with valid response from hive', () => {
    beforeEach(async () => {
      await estimatedAccountValue.beforeEach(<App />, false);
    });
    it('Must display the estimated account value', async () => {
      //testing to remove
      // const result = await HiveEngineConfigUtils.getApi().find(
      //   'tokens',
      //   'delegations',
      //   { from: 'gjhgh' },
      // );
      // console.log(result);
      //END
      assertion.getByText([
        { arialabelOrText: constants.label, query: QueryDOM.BYTEXT },
        { arialabelOrText: constants.amountString, query: QueryDOM.BYTEXT },
      ]);
    });
    it('Must display custom tooltip on mouse enter', async () => {
      await methods.actOnSection(EventType.HOVER);
      expect(screen.getByLabelText(alToolTip.content)).toHaveTextContent(
        constants.estimationText,
      );
    });
    it('Must remove custom tooltip on mouse leave', async () => {
      await methods.actOnSection(EventType.HOVER);
      expect(screen.getByLabelText(alToolTip.content)).toHaveTextContent(
        constants.estimationText,
      );
      await methods.actOnSection(EventType.UNHOVER);
      assertion.queryByLabel(alToolTip.content, false);
    });
  });

  describe('with no response from hive', () => {
    beforeEach(async () => {
      await estimatedAccountValue.beforeEach(<App />, true);
    });
    it('Must display ... when account value not received', async () => {
      assertion.getByText([
        { arialabelOrText: constants.label, query: QueryDOM.BYTEXT },
        {
          arialabelOrText: constants.amountNotReceived,
          query: QueryDOM.BYTEXT,
        },
      ]);
    });
  });
});
