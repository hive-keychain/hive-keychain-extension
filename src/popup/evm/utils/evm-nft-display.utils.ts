import {
  EvmErc1155Token,
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

const isErc1155Item = (
  item: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem,
): item is EvmErc1155TokenCollectionItem =>
  typeof (item as EvmErc1155TokenCollectionItem).balance === 'number';

const getNftOwnedQuantity = (
  item: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem,
) => (isErc1155Item(item) ? item.balance : 1);

const getCollectionOwnedQuantity = (
  collection: EvmErc721Token | EvmErc1155Token,
) =>
  collection.collection.reduce(
    (total, item) => total + getNftOwnedQuantity(item),
    0,
  );

const getNftDisplayName = (
  item: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem,
  collectionName?: string,
) => {
  const metadataName = item.metadata.name?.trim();
  if (metadataName) {
    return metadataName;
  }
  const fallbackCollectionName = collectionName?.trim();
  return fallbackCollectionName
    ? `${fallbackCollectionName} #${item.id}`
    : `#${item.id}`;
};

const formatNftStandard = (type: EVMSmartContractType) => {
  switch (type) {
    case EVMSmartContractType.ERC1155:
      return 'ERC1155';
    case EVMSmartContractType.ERC721:
    case EVMSmartContractType.ERC721Enumerable:
      return 'ERC721';
    default:
      return type;
  }
};

const namesMatch = (nftName: string, collectionName?: string) => {
  const normalizedCollectionName = collectionName?.trim().toLowerCase();
  return (
    !!normalizedCollectionName &&
    nftName.trim().toLowerCase() === normalizedCollectionName
  );
};

const getNftContractExplorerUrl = (
  explorerBaseUrl: string | undefined,
  contractAddress: string,
): string | undefined => {
  if (!explorerBaseUrl) {
    return undefined;
  }
  return `${explorerBaseUrl.replace(/\/+$/, '')}/token/${contractAddress}`;
};

export const EvmNftDisplayUtils = {
  getNftOwnedQuantity,
  getCollectionOwnedQuantity,
  getNftDisplayName,
  formatNftStandard,
  namesMatch,
  getNftContractExplorerUrl,
};
