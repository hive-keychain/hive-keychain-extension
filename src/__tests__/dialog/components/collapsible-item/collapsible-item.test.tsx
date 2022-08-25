import { render, screen } from '@testing-library/react';
import React from 'react';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alHeader from 'src/__tests__/utils-for-testing/aria-labels/al-header';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('collapsible-item tests:\n', () => {
  const { methods, constants } = appMocks;
  const { props } = constants;
  methods.config();
  it('Must show content', () => {
    render(<CollaspsibleItem {...props} />);
    assertion.getManyByText([testsI18n.get('description'), props.content]);
  });
  it('Must show content as preformatted', () => {
    render(<CollaspsibleItem {...{ ...props, pre: true }} />);
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });
  it('Must expand item', async () => {
    render(<CollaspsibleItem {...props} />);
    await clickAwait([alHeader.clickeable]);
    expect(await screen.findByLabelText(alDiv.collapsible)).not.toHaveClass(
      'hide',
    );
  });
});
