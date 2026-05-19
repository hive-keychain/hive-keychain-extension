import { BaseApi } from 'src/api/base';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';

describe('nft.utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

    expect(metadata.image).toBe('https://ipfs.io/ipfs/image-cid');
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

    expect(metadata.image).toBe('https://ipfs.io/ipfs/image-cid');
  });

  it('falls back to another gateway when IPFS metadata is unavailable on the primary gateway', async () => {
    const getSpy = jest
      .spyOn(BaseApi, 'get')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        name: 'NFT',
        description: '',
        image: 'ipfs://asset-cid',
        attributes: [],
      });

    const metadata = await EvmNFTUtils.getMetadataFromURI(
      'ipfs://metadata-cid/1.json',
      '1',
    );

    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      'https://ipfs.io/ipfs/metadata-cid/1.json',
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      'https://nftstorage.link/ipfs/metadata-cid/1.json',
    );
    expect(metadata.image).toBe('https://ipfs.io/ipfs/asset-cid');
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
