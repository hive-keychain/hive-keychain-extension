import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('exposes its translated title and checked state as a native checkbox', () => {
    jest.spyOn(I18nUtils, 'getMessage').mockReturnValue('Enable setting');

    render(
      <CheckboxPanelComponent
        checked
        onChange={jest.fn()}
        title="enable_setting"
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Enable setting' }),
    ).toBeChecked();
  });

  it('toggles once with the Space key', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CheckboxPanelComponent
        checked={false}
        onChange={onChange}
        title="Enable setting"
        skipTranslation
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Enable setting' });
    checkbox.focus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('uses panel text as the accessible name when there is no title', () => {
    jest.spyOn(I18nUtils, 'getMessage').mockReturnValue('Accept the terms');

    render(
      <CheckboxPanelComponent
        checked={false}
        onChange={jest.fn()}
        text="accept_terms"
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Accept the terms' }),
    ).not.toBeChecked();
  });

  it('does not toggle a disabled panel', () => {
    const onChange = jest.fn();
    const { container } = render(
      <CheckboxPanelComponent
        checked={false}
        disabled
        onChange={onChange}
        title="Enable setting"
        skipTranslation
      />,
    );

    fireEvent.click(container.querySelector('.checkbox-panel')!);

    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
