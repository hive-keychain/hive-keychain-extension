import {
  EvmNftMedia,
  isNftVideoMedia,
} from '@common-ui/evm/nft-media/nft-media.component';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('EvmNftMedia', () => {
  it('detects video URLs from query-string filenames', () => {
    expect(
      isNftVideoMedia(
        'https://ipfs.io/ipfs/QmYte18XSsbtofqYVGPsnhpPsLoYBtw45LrRFgqvsgfRnX?filename=Soul.mp4',
      ),
    ).toBe(true);
  });

  it('renders video media with a video element', () => {
    const { container } = render(
      <EvmNftMedia src="https://ipfs.io/ipfs/cid?filename=Soul.mp4" />,
    );

    expect(container.querySelector('video')).toBeTruthy();
    expect(container.querySelector('img')).toBeFalsy();
  });

  it('renders still media with an image element', () => {
    render(<EvmNftMedia src="https://cdn.example/nft.png" />);

    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'https://cdn.example/nft.png',
    );
  });

  it('marks the shared placeholder URL as placeholder media', () => {
    render(<EvmNftMedia src="/assets/images/placeholder-image.svg" />);

    expect(screen.getByRole('img').classList.contains('placeholder')).toBe(
      true,
    );
  });
});
