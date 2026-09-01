import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PortfolioComingSoon } from 'src/portfolio/ui/portfolio-coming-soon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('react-svg', () => ({
  ReactSVG: ({
    afterInjection,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { afterInjection?: unknown }) => (
    <div {...props} />
  ),
}));

describe('PortfolioComingSoon', () => {
  beforeEach(() => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key: string) => key);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the supplied title, description, and status without feature-specific copy', () => {
    const { getByTestId, getByText, queryByText } = render(
      <PortfolioComingSoon
        title="Analytics"
        description="Portfolio analytics will be available here soon."
        icon={SVGIcons.PORTFOLIO_HISTORY}
      />,
    );

    const panel = getByTestId('portfolio-coming-soon');
    const title = getByText('Analytics');
    const status = panel.querySelector('.portfolio-coming-soon__status');
    expect(status?.textContent).toBe('coming_soon_panel_title');
    expect(
      title.compareDocumentPosition(status as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      getByText('Portfolio analytics will be available here soon.'),
    ).toBeTruthy();
    expect(queryByText('Sell')).toBeNull();
    expect(panel.querySelector('.portfolio-coming-soon__hint')).toBeNull();
    expect(panel.querySelector('.portfolio-coming-soon__eta')).toBeNull();
    expect(panel.querySelector('.portfolio-coming-soon__action')).toBeNull();
  });

  it('renders optional hint, eta, and action when provided', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <PortfolioComingSoon
        title="Staking"
        description="Staking will be available here soon."
        icon={SVGIcons.PORTFOLIO_BUY}
        hint="We're working on it."
        eta="Q4 2026"
        action={{ label: 'Notify me', onClick }}
      />,
    );

    expect(getByText("We're working on it.")).toBeTruthy();
    expect(I18nUtils.getMessage).toHaveBeenCalledWith(
      'portfolio_coming_soon_expected',
      ['Q4 2026'],
    );
    fireEvent.click(getByText('Notify me'));
    expect(onClick).toHaveBeenCalled();
  });
});
