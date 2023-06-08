import App from '@popup/App';
import React from 'react';
import tokenItem from 'src/__tests__/popup/pages/app-container/home/tokens/token-item/mocks/token-item';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickAwaitOnFound,
} from 'src/__tests__/utils-for-testing/setups/events';
import FormatUtils from 'src/utils/format.utils';
config.byDefault();
const { methods, constants } = tokenItem;
const { userToken, toFind, buttonsIcons } = constants;
const { data, screenInfo } = userToken;
//TODO keep working bellow....
describe('token-item.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenItem.beforeEach(<App />);
  });
  it('Must show a list of token items', async () => {
    await assertion.allToHaveLength(alDiv.token.user.item, data.length);
  });
  it('Must show tokens information', () => {
    data.tokens.forEach((token) => {
      assertion.getManyByText([
        FormatUtils.withCommas(token.balance, 3),
        token.symbol,
      ]);
    });
  });
  it('Must show token options buttons', () => {
    data.tokens.forEach((token) => {
      assertion.getByText([
        {
          arialabelOrText: methods.selectPreFix(token.symbol, 'history'),
          query: QueryDOM.BYLABEL,
        },
        {
          arialabelOrText: methods.selectPreFix(token.symbol, 'send'),
          query: QueryDOM.BYLABEL,
        },
        {
          arialabelOrText: methods.selectPreFix(token.symbol, 'expandMore'),
          query: QueryDOM.BYLABEL,
        },
      ]);
    });
  });
  it('Must open a new window to visit token url', async () => {
    await clickAwaitOnFound(alDiv.token.user.tokenInfo.gotoWebSite, 0);
    expect(methods.spyOnTabs()).toBeCalledTimes(1);
  });
  it('Must navigate to each page', async () => {
    for (let i = 0; i < buttonsIcons.length; i++) {
      await clickAwait([buttonsIcons[i]]);
      assertion.getByLabelText(toFind.ariaLabels.pages[i]);
      await clickAwait([alIcon.arrowBack]);
    }
  });
});
