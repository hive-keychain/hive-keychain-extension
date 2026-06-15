import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('CheckboxPanelComponent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not prevent default link clicks in panel text', () => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((message) => {
      if (message === 'accept_terms_and_condition') {
        return "<a href='https://example.com/terms'>Terms</a>";
      }

      return message;
    });
    const onChange = jest.fn();
    const { getByRole } = render(
      <CheckboxPanelComponent
        checked={false}
        onChange={onChange}
        text="accept_terms_and_condition"
      />,
    );

    expect(fireEvent.click(getByRole('link', { name: 'Terms' }))).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
