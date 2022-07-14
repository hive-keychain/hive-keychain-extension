import App from '@popup/App';
import React from 'react';
import FormatUtils from 'src/utils/format.utils';
import tokenItem from 'src/__tests__/popup/pages/app-container/home/tokens/token-item/mocks/token-item';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokenItem;
const { userToken } = constants;
const { data, screenInfo } = userToken;
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
  it.skip('Must show expanded information', async () => {
    await clickAwait([methods.selectPreFix('LEO', 'expandMore')]);
    assertion.getManyByText(screenInfo.leoToken);
  });
  it.todo('Must open a new window to visit token url'); //click on expand.
  it.todo('Must close expanded information'); //click expand, assertion, click, assert info not to be present.
  it.todo('Must navigate to each page'); //loop?
});
