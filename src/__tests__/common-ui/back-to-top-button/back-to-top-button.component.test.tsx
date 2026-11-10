import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

describe('BackToTopButton', () => {
  it('scrolls to the top with Enter and Space', async () => {
    const user = userEvent.setup();
    const scrollTo = jest.fn();
    I18nUtils.getMessage = jest.fn((key: string) => key);
    const element = {
      current: { scrollTo } as unknown as HTMLElement,
    };
    render(<BackToTopButton element={element} />);

    const button = screen.getByRole('button', {
      name: 'accessibility_back_to_top',
    });
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(scrollTo).toHaveBeenNthCalledWith(1, {
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    expect(scrollTo).toHaveBeenNthCalledWith(2, {
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
});
