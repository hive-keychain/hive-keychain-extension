import {
  EvmErc1155Token,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';

describe('evm nft display utils', () => {
  const erc721Collection = {
    tokenInfo: {
      name: 'Rocks',
      type: EVMSmartContractType.ERC721,
      contractAddress: '0x1',
    },
    collection: [
      { id: '1', metadata: { name: 'Rocks', image: '' } },
      { id: '2', metadata: { name: 'Paper', image: '' } },
    ],
  } as EvmErc721Token;

  const erc1155Collection = {
    tokenInfo: {
      name: 'Studio',
      type: EVMSmartContractType.ERC1155,
      contractAddress: '0x2',
    },
    collection: [
      { id: '4', balance: 3, metadata: { name: '', image: '' } },
      { id: '5', balance: 1, metadata: { name: 'Sun', image: '' } },
    ],
  } as EvmErc1155Token;

  it('counts erc721 items as one each and sums erc1155 balances', () => {
    expect(EvmNftDisplayUtils.getCollectionOwnedQuantity(erc721Collection)).toBe(
      2,
    );
    expect(
      EvmNftDisplayUtils.getNftOwnedQuantity(erc1155Collection.collection[0]),
    ).toBe(3);
    expect(
      EvmNftDisplayUtils.getCollectionOwnedQuantity(erc1155Collection),
    ).toBe(4);
  });

  it('formats token standards and falls back when a token has no name', () => {
    expect(
      EvmNftDisplayUtils.formatNftStandard(EVMSmartContractType.ERC721),
    ).toBe('ERC721');
    expect(
      EvmNftDisplayUtils.formatNftStandard(
        EVMSmartContractType.ERC721Enumerable,
      ),
    ).toBe('ERC721');
    expect(
      EvmNftDisplayUtils.formatNftStandard(EVMSmartContractType.ERC1155),
    ).toBe('ERC1155');
    expect(
      EvmNftDisplayUtils.getNftDisplayName(
        erc1155Collection.collection[0],
        'Studio',
      ),
    ).toBe('Studio #4');
    expect(
      EvmNftDisplayUtils.namesMatch('Rocks', 'rocks'),
    ).toBe(true);
  });
});
