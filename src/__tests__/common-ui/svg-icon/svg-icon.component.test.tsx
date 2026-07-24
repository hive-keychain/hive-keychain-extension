import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

jest.mock('react-svg', () => ({
  ReactSVG: ({
    afterInjection,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { afterInjection?: unknown }) => (
    <div {...props} />
  ),
}));

describe('SVGIcon', () => {
  it('makes clickable icons keyboard accessible', () => {
    const onClick = jest.fn();
    render(
      <SVGIcon
        dataTestId="interactive-icon"
        icon={SVGIcons.INPUT_CLEAR}
        ariaLabel="Clear input"
        onClick={onClick}
      />,
    );

    const icon = screen.getByRole('button', { name: 'Clear input' });
    expect(icon).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(icon, { key: 'Enter' });
    fireEvent.keyDown(icon, { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('keeps decorative icons out of the tab order', () => {
    render(
      <SVGIcon dataTestId="decorative-icon" icon={SVGIcons.INPUT_CLEAR} />,
    );

    const icon = screen.getByTestId('decorative-icon');
    expect(icon).not.toHaveAttribute('role');
    expect(icon).not.toHaveAttribute('tabindex');
  });
});
