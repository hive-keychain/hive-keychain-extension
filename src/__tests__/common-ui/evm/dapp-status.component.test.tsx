import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { DappStatusComponent } from 'src/common-ui/evm/dapp-status/dapp-status.component';

describe('DappStatusComponent', () => {
  it('falls back when the dapp favicon cannot be loaded', () => {
    const { container } = render(
      <DappStatusComponent
        imageUrl="https://avascan.info/cdn/favicon.ico"
        fallbackImageUrl="https://www.google.com/s2/favicons?domain=avascan.info&sz=256"
      />,
    );

    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute(
      'src',
      'https://avascan.info/cdn/favicon.ico',
    );

    fireEvent.error(image);

    const fallbackImage = container.querySelector('img')!;
    expect(fallbackImage).toHaveAttribute(
      'src',
      'https://www.google.com/s2/favicons?domain=avascan.info&sz=256',
    );
  });

  it('removes the image when both the favicon and fallback fail', () => {
    const { container } = render(
      <DappStatusComponent
        imageUrl="https://example.com/favicon.ico"
        fallbackImageUrl="https://www.google.com/s2/favicons?domain=example.com&sz=256"
      />,
    );

    fireEvent.error(container.querySelector('img')!);
    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('uses a named button when the status opens details', () => {
    const onClick = jest.fn();

    render(
      <DappStatusComponent
        imageUrl="https://example.com/favicon.ico"
        ariaLabel="View connection status for example.com"
        onClick={onClick}
      />,
    );

    const statusButton = screen.getByRole('button', {
      name: 'View connection status for example.com',
    });

    fireEvent.click(statusButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
