import { render, waitFor } from '@testing-library/react';
import React from 'react';
import DialogError from 'src/dialog/pages/error';
import pagesMocks from 'src/__tests__/dialog/pages/mocks/pages-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestDialogError } from 'src/__tests__/utils-for-testing/types/props-types';
describe('error tests:\n', () => {
  const { methods, spies } = pagesMocks;
  const props: PropsRequestDialogError = {
    data: { msg: { display_msg: 'Error on this Dialog!!!' } },
  };
  methods.config();
  it('Must show DialogError', async () => {
    const { asFragment } = render(<DialogError {...props} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('DialogError');
  });
  it('Must call window.close when clicking on close', async () => {
    render(<DialogError {...props} />);
    await clickAwait([alButton.close]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
});
