import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Proxy from 'src/dialog/pages/requests/proxy';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import requestProxy from 'src/__tests__/utils-for-testing/data/props/dialog/request-proxy';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { PropsRequestProxy } from 'src/__tests__/utils-for-testing/types/props-types';
describe('anonymous-requests tests:\n', () => {
  const { methods } = appMocks;
  const { props } = requestProxy;
  methods.config();
  it('Must set username as data.username', async () => {
    render(<Proxy {...props} />);
    waitFor(() => {
      expect(
        screen.getAllByLabelText(alDiv.operation.item.content)[0].textContent,
      ).toBe(`@${props.data.username!}`);
    });
  });
  it('Must set selected account as accounts[0]', async () => {
    const clonedProps = objects.clone(props) as PropsRequestProxy;
    clonedProps.accounts = ['cedric', 'aggroed'];
    render(<Proxy {...clonedProps} />);
    waitFor(() => {
      expect(screen.getByLabelText(alDiv.selectedAccount).textContent).toBe(
        'cedric',
      );
    });
  });
});
