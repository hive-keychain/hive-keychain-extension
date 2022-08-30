import { render } from '@testing-library/react';
import React from 'react';
import RequestUsername from 'src/dialog/components/request-username/request-username';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestUsername from 'src/__tests__/utils-for-testing/data/props/dialog/request-username';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('request-username tests:\n', () => {
  const { methods } = appMocks;
  const { props } = requestUsername;
  methods.config();
  it('Must show current selected account', () => {
    render(<RequestUsername {...props} />);
    assertion.toHaveTextContent([
      { arialabel: alDiv.selectedAccount, text: mk.user.one },
    ]);
  });
  it('Must call setUsername when switched account', async () => {
    render(<RequestUsername {...props} />);
    await clickAwait([alSelect.accountSelector, mk.user.two]);
    expect(props.setUsername).toBeCalledWith(mk.user.two);
  });
});
