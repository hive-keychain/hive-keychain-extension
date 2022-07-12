import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import governance from 'src/__tests__/popup/pages/app-container/home/governance/mocks/governance';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alTab from 'src/__tests__/utils-for-testing/aria-labels/al-tab';
import { QueryDOM, Tab } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('governance.component tests:\n', () => {
  beforeEach(async () => {
    await governance.beforeEach(<App />);
  });
  governance.methods.afterEach;
  it('Must load governance page', () => {
    assertion.getByLabelText(alComponent.governancePage);
  });
  it('Must load witness tab by default', () => {
    assertion.getByText([
      { arialabelOrText: alTab.witness, query: QueryDOM.BYLABEL },
      { arialabelOrText: alDiv.ranking, query: QueryDOM.BYLABEL },
    ]);
  });
  it('Must load proposal tab', async () => {
    await governance.methods.gotoTab(Tab.PROPOSAL);
    assertion.getByLabelText(alTab.proposal);
  });
  it('Must load proxy tab', async () => {
    await governance.methods.gotoTab(Tab.PROXY);
    assertion.getByLabelText(alTab.proxy);
  });
});
