import { IPFSApi } from '@popup/evm/api/ipfs.api';

const getImgFromURI = async (uri: string): Promise<string> => {
  let metadata;
  if (uri.startsWith('ipfs://')) {
    uri = uri.replace('ipfs://', '');
    metadata = await IPFSApi.getURI(uri);
  } else {
    const json = atob(uri.substring(29));
    metadata = JSON.parse(json);
  }

  return metadata.image;
};

export const EvmNFTUtils = { getImgFromURI };
