import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';

describe('PortfolioLogoImage', () => {
  it('renders the remote logo when the source loads', () => {
    render(
      <PortfolioLogoImage
        src="https://example.com/token.png"
        className="token-logo"
        fallbackLetter="C"
      />,
    );

    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toBe('https://example.com/token.png');
    expect(image.className).toContain('token-logo');
  });

  it('falls back to a letter avatar when the remote logo fails', () => {
    render(
      <PortfolioLogoImage
        src="https://example.com/broken.png"
        className="token-logo"
        fallbackClassName="token-fallback"
        fallbackLetter="$COOL"
        colorKey="$COOL"
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).toBeNull();
    const fallback = screen.getByText('$');
    expect(fallback.className).toContain('token-fallback');
  });

  it('renders nothing when the logo is missing and no fallback letter is provided', () => {
    const { container } = render(
      <PortfolioLogoImage src={null} className="provider-logo" />,
    );

    expect(container.firstChild).toBeNull();
  });
});
