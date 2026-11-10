import {
  EvmNftMedia,
  isNftVideoMedia,
} from '@common-ui/evm/nft-media/nft-media.component';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IpfsUtils } from 'src/utils/ipfs.utils';

describe('EvmNftMedia', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects video URLs from query-string filenames', () => {
    expect(
      isNftVideoMedia(
        'https://cdn.example/QmYte18XSsbtofqYVGPsnhpPsLoYBtw45LrRFgqvsgfRnX?filename=Soul.mp4',
      ),
    ).toBe(true);
  });

  it('renders video media with a video element', () => {
    const { container } = render(
      <EvmNftMedia src="https://cdn.example/cid?filename=Soul.mp4" />,
    );

    expect(container.querySelector('video')).toBeTruthy();
    expect(container.querySelector('img')).toBeFalsy();
  });

  it('resolves IPFS media and retries without a gateway that fails to render', async () => {
    const resolveSpy = jest
      .spyOn(IpfsUtils, 'resolveIpfsUrl')
      .mockResolvedValueOnce({
        url: 'https://ipfs.filebase.io/ipfs/cid?filename=Soul.mp4',
        gateway: 'https://ipfs.filebase.io/ipfs/',
      })
      .mockResolvedValueOnce({
        url: 'https://4everland.io/ipfs/cid?filename=Soul.mp4',
        gateway: 'https://4everland.io/ipfs/',
      });
    jest.spyOn(IpfsUtils, 'reportGatewayFailure').mockImplementation();
    const { container } = render(
      <EvmNftMedia src="ipfs://cid?filename=Soul.mp4" />,
    );

    await waitFor(() => {
      expect(container.querySelector('video')!.getAttribute('src')).toBe(
        'https://ipfs.filebase.io/ipfs/cid?filename=Soul.mp4',
      );
    });

    fireEvent.error(container.querySelector('video')!);

    await waitFor(() => {
      expect(container.querySelector('video')!.getAttribute('src')).toBe(
        'https://4everland.io/ipfs/cid?filename=Soul.mp4',
      );
    });
    expect(resolveSpy).toHaveBeenLastCalledWith('ipfs://cid?filename=Soul.mp4', {
      bypassCache: true,
      excludedGateways: ['https://ipfs.filebase.io/ipfs/'],
    });
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
