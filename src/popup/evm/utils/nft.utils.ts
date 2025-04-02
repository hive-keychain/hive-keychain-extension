import { IPFSApi } from '@popup/evm/api/ipfs.api';
import { EvmErc721TokenCollectionItem } from '@popup/evm/interfaces/active-account.interface';
import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import { ethers } from 'ethers';
import { BaseApi } from 'src/api/base';

const getImgFromURI = async (metadata: EvmNFTMetadata): Promise<string> => {
  return metadata.image;
};

const getMetadataFromURI = async (uri: string): Promise<EvmNFTMetadata> => {
  let metadata;
  if (uri.startsWith('ipfs://')) {
    uri = uri.replace('ipfs://', '');
    metadata = await IPFSApi.getURI(uri);
    metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  } else if (uri.startsWith('https://') || uri.startsWith('http://')) {
    metadata = await BaseApi.get(uri);
  } else {
    const json = atob(uri.substring(29));
    metadata = JSON.parse(json);
  }
  return metadata;
};

const getMetadataFromTokenId = async (
  tokenId: string,
  contract: ethers.Contract,
): Promise<EvmErc721TokenCollectionItem> => {
  let uri = await contract.tokenURI(tokenId);
  return {
    id: tokenId,
    metadata: await getMetadataFromURI(uri),
  };
};

export const EvmNFTUtils = {
  getMetadataFromURI,
  getImgFromURI,
  getMetadataFromTokenId,
};
