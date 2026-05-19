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
import { IpfsUtils } from 'src/utils/ipfs.utils';

const getImgFromMetadata = (metadata: EvmNFTMetadata): string => {
  if (!metadata || !metadata.image)
    return '/assets/images/placeholder-image.svg';
  metadata.image = IpfsUtils.resolveIpfsUrl(metadata.image);
  return metadata.image;
};

const getTokenIdForUriTemplate = (tokenId: string): string => {
  try {
    return BigInt(tokenId).toString(16).padStart(64, '0');
  } catch {
    return tokenId;
  }
};

const getMetadataFromURI = async (
  uri: string,
  tokenId: string,
): Promise<EvmNFTMetadata> => {
  if (uri && uri.includes('{id}')) {
    uri = uri.replace('{id}', getTokenIdForUriTemplate(tokenId));
  }
  let metadata;
  try {
    if (IpfsUtils.getIpfsPath(uri)) {
      metadata = await IPFSApi.getURI(uri);
      metadata.image = getImgFromMetadata(metadata);
    } else if (uri.startsWith('https://') || uri.startsWith('http://')) {
      metadata = await BaseApi.get(uri);
    } else {
      const json = atob(uri.substring(29));
      metadata = JSON.parse(json);
    }

    metadata.image = getImgFromMetadata(metadata);
    return metadata;
  } catch (err) {
    console.log('error', { err });
  } finally {
    return (
      metadata ?? {
        attributes: [],
        description: '',
        image: '/assets/images/placeholder-image.svg',
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
    case EVMSmartContractType.PROTOCOL:
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

  try {
    switch (type) {
      case EVMSmartContractType.ERC721:
        uri = await contract.tokenURI(tokenId);
        break;
      case EVMSmartContractType.ERC1155:
        uri = await contract.uri(tokenId);
        break;
      case EVMSmartContractType.PROTOCOL:
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
  } catch (err) {
    console.log(err);
    collectionItem.metadata = {
      name: 'No name',
      description: 'No description',
      image: 'https://placehold.co/600x600?text=Not+Found',
      attributes: [],
    };
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
  const metadata = {
    name: res.nft.name,
    description: res.nft.description,
    image: res.nft.image_url,
    attributes: [],
  };
  metadata.image = getImgFromMetadata(metadata);
  return metadata;
};

export const EvmNFTUtils = {
  getMetadataFromURI,
  getImgFromMetadata,
  getMetadataFromTokenId,
  getMetadata,
  getMetadataFromOpenSea,
};
