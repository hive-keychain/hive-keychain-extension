import { IPFSApi } from '@popup/evm/api/ipfs.api';
import {
  EvmErc1155TokenCollectionItem,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { ethers } from 'ethers';
import { BaseApi } from 'src/api/base';

const getImgFromURI = async (metadata: EvmNFTMetadata): Promise<string> => {
  return metadata.image;
};

const getMetadataFromURI = async (
  uri: string,
  tokenId: string,
): Promise<EvmNFTMetadata> => {
  if (uri && uri.includes('{id}')) {
    uri = uri.replace('{id}', tokenId);
  }

  let metadata;
  try {
    if (uri.startsWith('ipfs://')) {
      uri = uri.replace('ipfs://', '');
      metadata = await IPFSApi.getURI(uri);
      metadata.image = metadata.image.replace(
        'ipfs://',
        'https://ipfs.io/ipfs/',
      );
    } else if (uri.startsWith('https://') || uri.startsWith('http://')) {
      metadata = await BaseApi.get(uri);
    } else {
      const json = atob(uri.substring(29));
      metadata = JSON.parse(json);
    }

    return metadata;
  } catch (err) {
    console.log('error', { err });
  } finally {
    return (
      metadata ?? {
        attributes: [],
        description: '',
        image: 'https://placehold.co/600x600?text=Not+Found',
        name: 'No name',
      }
    );
  }
};

const getMetadata = async (
  type: EVMSmartContractType,
  tokenId: string,
  contract: ethers.Contract,
) => {
  let uri;
  switch (type) {
    case EVMSmartContractType.ERC721:
      uri = await contract.tokenURI(tokenId);
      break;
    case EVMSmartContractType.ERC1155:
      uri = await contract.uri(tokenId);
      break;
  }
  return await getMetadataFromURI(uri, tokenId);
};

const getMetadataFromTokenId = async (
  type: EVMSmartContractType,
  tokenId: string,
  contract: ethers.Contract,
  balance?: number,
): Promise<EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem> => {
  let uri;
  switch (type) {
    case EVMSmartContractType.ERC721:
      uri = await contract.tokenURI(tokenId);
      break;
    case EVMSmartContractType.ERC1155:
      uri = await contract.uri(tokenId);
      break;
  }

  const collectionItem = {
    id: tokenId,
    metadata: await getMetadataFromURI(uri, tokenId),
  };
  if (balance) {
    (collectionItem as EvmErc1155TokenCollectionItem).balance = balance;
  }

  return collectionItem;
};

export const EvmNFTUtils = {
  getMetadataFromURI,
  getImgFromURI,
  getMetadataFromTokenId,
  getMetadata,
};
