import { KeychainApi } from '@api/keychain';
import { IPFSApi } from '@popup/evm/api/ipfs.api';
import {
  EvmErc1155TokenCollectionItem,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { BaseApi } from 'src/api/base';

const getImgFromMetadata = (metadata: EvmNFTMetadata): string => {
  console.log('getImgFromMetadata', metadata);
  if (!metadata) return 'https://placehold.co/600x600?text=Not+Found';
  if (metadata.image.startsWith('ipfs://ipfs/')) {
    metadata.image = metadata.image.replace(
      'ipfs://ipfs/',
      'https://ipfs.io/ipfs/',
    );
  } else if (metadata.image.startsWith('ipfs://')) {
    metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return metadata.image;
};

const getMetadataFromURI = async (
  uri: string,
  tokenId: string,
): Promise<EvmNFTMetadata> => {
  if (uri && uri.includes('{id}')) {
    uri = uri.replace('{id}', tokenId);
  }
  console.log('getMetadataFromURI');
  let metadata;
  try {
    if (uri.startsWith('ipfs://ipfs/')) {
      uri = uri.replace('ipfs://ipfs/', '');
      metadata = await IPFSApi.getURI(uri);
      metadata.image = getImgFromMetadata(metadata);
    } else if (uri.startsWith('ipfs://')) {
      uri = uri.replace('ipfs://', '');
      metadata = await IPFSApi.getURI(uri);
      metadata.image = getImgFromMetadata(metadata);
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
  console.log('getMetadata');
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
  chain: EvmChain,
  contractAddress: string,
  balance?: number,
): Promise<EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem> => {
  let uri;

  const collectionItem: any = {
    id: tokenId,
    metadata: null,
  };

  switch (type) {
    case EVMSmartContractType.ERC721:
      uri = await contract.tokenURI(tokenId);
      break;
    case EVMSmartContractType.ERC1155:
      uri = await contract.uri(tokenId);
      break;
  }
  if (uri.includes('api.opensea.io')) {
    collectionItem.metadata = await getMetadataFromOpenSea(
      chain,
      contractAddress,
      tokenId,
    );
  } else {
    collectionItem.metadata = await getMetadataFromURI(uri, tokenId);
  }

  if (balance) {
    (collectionItem as EvmErc1155TokenCollectionItem).balance = balance;
  }

  return collectionItem;
};

const getMetadataFromOpenSea = async (
  chain: EvmChain,
  contractAddress: string,
  tokenId: string,
): Promise<EvmNFTMetadata> => {
  const res = await KeychainApi.get(
    `evm/${chain.openSeaChainId}/nft/${contractAddress}/${tokenId}`,
  );
  return {
    name: res.nft.name,
    description: res.nft.description,
    image: res.nft.image_url,
    attributes: [],
  };
};

export const EvmNFTUtils = {
  getMetadataFromURI,
  getImgFromMetadata,
  getMetadataFromTokenId,
  getMetadata,
  getMetadataFromOpenSea,
};
