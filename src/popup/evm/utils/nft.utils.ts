import { IPFSApi } from '@popup/evm/api/ipfs.api';
import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';

const getImgFromURI = async (metadata: EvmNFTMetadata): Promise<string> => {
  return metadata.image;
};

const getMetadataFromURI = async (uri: string): Promise<EvmNFTMetadata> => {
  let metadata;
  if (uri.startsWith('ipfs://')) {
    uri = uri.replace('ipfs://', '');
    metadata = await IPFSApi.getURI(uri);
  } else {
    const json = atob(uri.substring(29));
    metadata = JSON.parse(json);
  }
  return metadata;
};

export const EvmNFTUtils = {
  getMetadataFromURI,
  getImgFromURI,
};
