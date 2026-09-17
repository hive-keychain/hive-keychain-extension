import { BaseApi } from 'src/api/base';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { IpfsUtils } from 'src/utils/ipfs.utils';

describe('nft.utils', () => {
  beforeEach(() => {
    IpfsUtils.clearGatewayHealthState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    IpfsUtils.clearGatewayHealthState();
  });

  it('normalizes IPFS image URLs from HTTP metadata', async () => {
    jest.spyOn(BaseApi, 'get').mockResolvedValue({
      name: 'NFT',
      description: '',
      image: 'ipfs://image-cid',
      attributes: [],
    });

    const metadata = await EvmNFTUtils.getMetadataFromURI(
      'https://metadata.example/token/1',
      '1',
    );

    expect(metadata.image).toBe(
      IpfsUtils.getPreferredIpfsUrl('ipfs://image-cid'),
    );
  });

  it('normalizes IPFS image URLs from data URI metadata', async () => {
    const data = btoa(
      JSON.stringify({
        name: 'NFT',
        description: '',
        image: 'ipfs://ipfs/image-cid',
        attributes: [],
      }),
    );

    const metadata = await EvmNFTUtils.getMetadataFromURI(
      `data:application/json;base64,${data}`,
      '1',
    );

    expect(metadata.image).toBe(
      IpfsUtils.getPreferredIpfsUrl('ipfs://image-cid'),
    );
  });

  it('falls back to another gateway when IPFS metadata is unavailable on the primary gateway', async () => {
    const getSpy = jest
      .spyOn(BaseApi, 'getWithResponse')
      .mockResolvedValueOnce({ status: 503, data: undefined })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          name: 'NFT',
          description: '',
          image: 'ipfs://asset-cid',
          attributes: [],
        },
      });
    const gatewayUrls = IpfsUtils.getIpfsGatewayUrls(
      'ipfs://metadata-cid/1.json',
    );

    const metadata = await EvmNFTUtils.getMetadataFromURI(
      'ipfs://metadata-cid/1.json',
      '1',
    );

    expect(getSpy.mock.calls[0][0]).toBe(gatewayUrls[0]);
    expect(getSpy.mock.calls[1][0]).toBe(gatewayUrls[1]);
    expect(metadata.image).toBe(
      IpfsUtils.getPreferredIpfsUrl('ipfs://asset-cid'),
    );
  });

  it('uses the ERC1155 hex token id format for URI templates', async () => {
    const getSpy = jest.spyOn(BaseApi, 'get').mockResolvedValue({
      name: 'NFT',
      description: '',
      image: 'https://cdn.example/nft.png',
      attributes: [],
    });

    await EvmNFTUtils.getMetadataFromURI(
      'https://metadata.example/{id}.json',
      '15',
    );

    expect(getSpy).toHaveBeenCalledWith(
      'https://metadata.example/000000000000000000000000000000000000000000000000000000000000000f.json',
    );
  });
});
