import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmAbi {
  type: EVMSmartContractType;
  abi: any[];
  methods: string[];
}

export const Erc20Abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
] as any;

export const ERC721Abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentTokenId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'numberOfTokens',
        type: 'uint256',
      },
    ],
    name: 'mintNFTs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as any;

export const ERC721EnumerableAbi = [
  {
    constant: true,
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x01ffc9a7',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x06fdde03',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x081812fc',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x095ea7b3',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x18160ddd',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x23b872dd',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x2f745c59',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x42842e0e',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenByIndex',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x4f6ccce7',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x6352211e',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x70a08231',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x95d89b41',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xa22cb465',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xb88d4fde',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0xc87b56dd',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0xe985e9c5',
  },
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
    signature: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
    signature:
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
    signature:
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
    signature:
      '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: 'tokenURI',
        type: 'string',
      },
    ],
    name: 'mint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xd3fc9864',
  },
];

export const ERC1155Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'values',
        type: 'uint256[]',
      },
    ],
    name: 'TransferBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'TransferSingle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'URI',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
    ],
    name: 'balanceOfBatch',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'uri',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const LiFiAbi = [
  {
    type: 'function',
    name: 'setApprovalForBridges',
    inputs: [
      { name: 'bridges', type: 'address[]', internalType: 'address[]' },
      {
        name: 'tokensToApprove',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1ERC20',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1Native',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2ERC20',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2Native',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaHopL1ERC20',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaHopL1Native',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaHopL2ERC20',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaHopL2Native',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'AssetSwapped',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'dex',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'fromAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'toAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'fromAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'toAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BridgeToNonEVMChain',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'destinationChainId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BridgeToNonEVMChainBytes32',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'destinationChainId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiGenericSwapCompleted',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'integrator',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'referrer',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'fromAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'toAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'fromAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'toAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiSwappedGeneric',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'integrator',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'referrer',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'fromAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'toAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'fromAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'toAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiTransferCompleted',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'receivingAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiTransferRecovered',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'receivingAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiTransferStarted',
    inputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        indexed: false,
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'ContractCallNotAllowed', inputs: [] },
  {
    type: 'error',
    name: 'CumulativeSlippageTooHigh',
    inputs: [
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'receivedAmount', type: 'uint256', internalType: 'uint256' },
    ],
  },
  { type: 'error', name: 'InvalidAmount', inputs: [] },
  { type: 'error', name: 'InvalidContract', inputs: [] },
  { type: 'error', name: 'InvalidReceiver', inputs: [] },
  { type: 'error', name: 'NoSwapDataProvided', inputs: [] },
  { type: 'error', name: 'NoSwapFromZeroBalance', inputs: [] },
  { type: 'error', name: 'NullAddrIsNotAValidSpender', inputs: [] },
  { type: 'error', name: 'NullAddrIsNotAnERC20Token', inputs: [] },
  { type: 'error', name: 'OnlyContractOwner', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaStargate',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_stargateData',
        type: 'tuple',
        internalType: 'struct StargateFacetV2.StargateData',
        components: [
          { name: 'assetId', type: 'uint16', internalType: 'uint16' },
          {
            name: 'sendParams',
            type: 'tuple',
            internalType: 'struct IStargate.SendParam',
            components: [
              { name: 'dstEid', type: 'uint32', internalType: 'uint32' },
              { name: 'to', type: 'bytes32', internalType: 'bytes32' },
              {
                name: 'amountLD',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'minAmountLD',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'extraOptions',
                type: 'bytes',
                internalType: 'bytes',
              },
              {
                name: 'composeMsg',
                type: 'bytes',
                internalType: 'bytes',
              },
              { name: 'oftCmd', type: 'bytes', internalType: 'bytes' },
            ],
          },
          {
            name: 'fee',
            type: 'tuple',
            internalType: 'struct IStargate.MessagingFee',
            components: [
              {
                name: 'nativeFee',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'lzTokenFee',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address payable',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaStargate',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_stargateData',
        type: 'tuple',
        internalType: 'struct StargateFacetV2.StargateData',
        components: [
          { name: 'assetId', type: 'uint16', internalType: 'uint16' },
          {
            name: 'sendParams',
            type: 'tuple',
            internalType: 'struct IStargate.SendParam',
            components: [
              { name: 'dstEid', type: 'uint32', internalType: 'uint32' },
              { name: 'to', type: 'bytes32', internalType: 'bytes32' },
              {
                name: 'amountLD',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'minAmountLD',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'extraOptions',
                type: 'bytes',
                internalType: 'bytes',
              },
              {
                name: 'composeMsg',
                type: 'bytes',
                internalType: 'bytes',
              },
              { name: 'oftCmd', type: 'bytes', internalType: 'bytes' },
            ],
          },
          {
            name: 'fee',
            type: 'tuple',
            internalType: 'struct IStargate.MessagingFee',
            components: [
              {
                name: 'nativeFee',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'lzTokenFee',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address payable',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'tokenMessaging',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ITokenMessaging',
      },
    ],
    stateMutability: 'view',
  },
  { type: 'error', name: 'CannotBridgeToSameNetwork', inputs: [] },
  { type: 'error', name: 'InformationMismatch', inputs: [] },
  {
    type: 'error',
    name: 'InvalidAssetId',
    inputs: [
      { name: 'invalidAssetId', type: 'uint16', internalType: 'uint16' },
    ],
  },
  { type: 'error', name: 'ReentrancyError', inputs: [] },
  {
    type: 'function',
    name: 'swapTokensGeneric',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmount', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaArbitrumBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_arbitrumData',
        type: 'tuple',
        internalType: 'struct ArbitrumBridgeFacet.ArbitrumData',
        components: [
          {
            name: 'maxSubmissionCost',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'maxGas', type: 'uint256', internalType: 'uint256' },
          {
            name: 'maxGasPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaArbitrumBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_arbitrumData',
        type: 'tuple',
        internalType: 'struct ArbitrumBridgeFacet.ArbitrumData',
        components: [
          {
            name: 'maxSubmissionCost',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'maxGas', type: 'uint256', internalType: 'uint256' },
          {
            name: 'maxGasPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getPeripheryContract',
    inputs: [{ name: '_name', type: 'string', internalType: 'string' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerPeripheryContract',
    inputs: [
      { name: '_name', type: 'string', internalType: 'string' },
      {
        name: '_contractAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'PeripheryContractRegistered',
    inputs: [
      {
        name: 'name',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'contractAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'MAYAN',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IMayan' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaMayan',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_mayanData',
        type: 'tuple',
        internalType: 'struct MayanFacet.MayanData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'mayanProtocol',
            type: 'address',
            internalType: 'address',
          },
          { name: 'protocolData', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaMayan',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_mayanData',
        type: 'tuple',
        internalType: 'struct MayanFacet.MayanData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'mayanProtocol',
            type: 'address',
            internalType: 'address',
          },
          { name: 'protocolData', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidConfig', inputs: [] },
  { type: 'error', name: 'InvalidNonEVMReceiver', inputs: [] },
  { type: 'error', name: 'ProtocolDataTooShort', inputs: [] },
  {
    type: 'function',
    name: 'RELAY_DEPOSITORY',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaRelayDepository',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_relayDepositoryData',
        type: 'tuple',
        internalType: 'struct RelayDepositoryFacet.RelayDepositoryData',
        components: [
          { name: 'orderId', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'depositorAddress',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaRelayDepository',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_relayDepositoryData',
        type: 'tuple',
        internalType: 'struct RelayDepositoryFacet.RelayDepositoryData',
        components: [
          { name: 'orderId', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'depositorAddress',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidCallData', inputs: [] },
  {
    type: 'function',
    name: 'isQuoteConsumed',
    inputs: [{ name: '_quoteId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: 'consumed', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaNEARIntents',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_nearData',
        type: 'tuple',
        internalType: 'struct NEARIntentsFacet.NEARIntentsData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'depositAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'quoteId', type: 'bytes32', internalType: 'bytes32' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'minAmountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'refundRecipient',
            type: 'address',
            internalType: 'address',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaNEARIntents',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_nearData',
        type: 'tuple',
        internalType: 'struct NEARIntentsFacet.NEARIntentsData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'depositAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'quoteId', type: 'bytes32', internalType: 'bytes32' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'minAmountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'refundRecipient',
            type: 'address',
            internalType: 'address',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'NEARIntentsBridgeStarted',
    inputs: [
      {
        name: 'transactionId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'quoteId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'depositAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'deadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'minAmountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'InvalidSignature', inputs: [] },
  { type: 'error', name: 'QuoteAlreadyConsumed', inputs: [] },
  { type: 'error', name: 'QuoteExpired', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaSymbiosis',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_symbiosisData',
        type: 'tuple',
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        components: [
          {
            name: 'firstSwapCalldata',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'secondSwapCalldata',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'intermediateToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'firstDexRouter',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'secondDexRouter',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'approvedTokens',
            type: 'address[]',
            internalType: 'address[]',
          },
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaSymbiosis',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_symbiosisData',
        type: 'tuple',
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        components: [
          {
            name: 'firstSwapCalldata',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'secondSwapCalldata',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'intermediateToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'firstDexRouter',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'secondDexRouter',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'approvedTokens',
            type: 'address[]',
            internalType: 'address[]',
          },
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'ACROSS_REFERRER_DELIMITER',
    inputs: [],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cancelOwnershipTransfer',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'confirmOwnershipTransfer',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossERC20Packed',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacet.AcrossData',
        components: [
          { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossNativePacked',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacet.AcrossData',
        components: [
          { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossERC20Packed',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
      { name: 'quoteTimestamp', type: 'uint32', internalType: 'uint32' },
      { name: 'message', type: 'bytes', internalType: 'bytes' },
      { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossNativePacked',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
      { name: 'quoteTimestamp', type: 'uint32', internalType: 'uint32' },
      { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
      { name: 'message', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'executeCallAndWithdraw',
    inputs: [
      { name: '_callTo', type: 'address', internalType: 'address' },
      { name: '_callData', type: 'bytes', internalType: 'bytes' },
      { name: '_assetAddress', type: 'address', internalType: 'address' },
      { name: '_to', type: 'address', internalType: 'address' },
      { name: '_amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingOwner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setApprovalForBridge',
    inputs: [
      {
        name: 'tokensToApprove',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossERC20Min',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
      { name: 'quoteTimestamp', type: 'uint32', internalType: 'uint32' },
      { name: 'message', type: 'bytes', internalType: 'bytes' },
      { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossNativeMin',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
      { name: 'quoteTimestamp', type: 'uint32', internalType: 'uint32' },
      { name: 'message', type: 'bytes', internalType: 'bytes' },
      { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossNativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: '_newOwner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'CallExecutedAndFundsWithdrawn',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiAcrossTransfer',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes8',
        indexed: false,
        internalType: 'bytes8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferRequested',
    inputs: [
      {
        name: '_from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'NewOwnerMustNotBeSelf', inputs: [] },
  { type: 'error', name: 'NoNullOwner', inputs: [] },
  { type: 'error', name: 'NoPendingOwnershipTransfer', inputs: [] },
  { type: 'error', name: 'NotPendingOwner', inputs: [] },
  { type: 'error', name: 'UnAuthorized', inputs: [] },
  { type: 'error', name: 'WithdrawFailed', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaSquid',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_squidData',
        type: 'tuple',
        internalType: 'struct SquidFacet.SquidData',
        components: [
          {
            name: 'routeType',
            type: 'uint8',
            internalType: 'enum SquidFacet.RouteType',
          },
          {
            name: 'destinationChain',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'destinationAddress',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'bridgedTokenSymbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'depositAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sourceCalls',
            type: 'tuple[]',
            internalType: 'struct ISquidMulticall.Call[]',
            components: [
              {
                name: 'callType',
                type: 'uint8',
                internalType: 'enum ISquidMulticall.CallType',
              },
              {
                name: 'target',
                type: 'address',
                internalType: 'address',
              },
              { name: 'value', type: 'uint256', internalType: 'uint256' },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              { name: 'payload', type: 'bytes', internalType: 'bytes' },
            ],
          },
          { name: 'payload', type: 'bytes', internalType: 'bytes' },
          { name: 'fee', type: 'uint256', internalType: 'uint256' },
          { name: 'enableExpress', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaSquid',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_squidData',
        type: 'tuple',
        internalType: 'struct SquidFacet.SquidData',
        components: [
          {
            name: 'routeType',
            type: 'uint8',
            internalType: 'enum SquidFacet.RouteType',
          },
          {
            name: 'destinationChain',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'destinationAddress',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'bridgedTokenSymbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'depositAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sourceCalls',
            type: 'tuple[]',
            internalType: 'struct ISquidMulticall.Call[]',
            components: [
              {
                name: 'callType',
                type: 'uint8',
                internalType: 'enum ISquidMulticall.CallType',
              },
              {
                name: 'target',
                type: 'address',
                internalType: 'address',
              },
              { name: 'value', type: 'uint256', internalType: 'uint256' },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              { name: 'payload', type: 'bytes', internalType: 'bytes' },
            ],
          },
          { name: 'payload', type: 'bytes', internalType: 'bytes' },
          { name: 'fee', type: 'uint256', internalType: 'uint256' },
          { name: 'enableExpress', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidRouteType', inputs: [] },
  {
    type: 'function',
    name: 'ACROSS_CHAIN_ID_SOLANA',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MULTIPLIER_BASE',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SPOKEPOOL',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IAcrossSpokePoolV4',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WRAPPED_NATIVE',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV4',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV4.AcrossV4Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'sendingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountMultiplier',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaAcrossV4',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV4.AcrossV4Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'sendingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountMultiplier',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaCBridgeERC20Packed',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct CBridgeFacet.CBridgeData',
        components: [
          { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaCBridgeNativePacked',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct CBridgeFacet.CBridgeData',
        components: [
          { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaCBridgeERC20Packed',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'nonce', type: 'uint64', internalType: 'uint64' },
      { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaCBridgeNativePacked',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      { name: 'nonce', type: 'uint64', internalType: 'uint64' },
      { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCBridgeERC20Min',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'nonce', type: 'uint64', internalType: 'uint64' },
      { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCBridgeERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCBridgeNativeMin',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint64',
        internalType: 'uint64',
      },
      { name: 'nonce', type: 'uint64', internalType: 'uint64' },
      { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCBridgeNativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'triggerRefund',
    inputs: [
      {
        name: '_callTo',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_callData', type: 'bytes', internalType: 'bytes' },
      { name: '_assetAddress', type: 'address', internalType: 'address' },
      { name: '_to', type: 'address', internalType: 'address' },
      { name: '_amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'CBridgeRefund',
    inputs: [
      {
        name: '_assetAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiFiCBridgeTransfer',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes8',
        indexed: false,
        internalType: 'bytes8',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'ExternalCallFailed', inputs: [] },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'pauseDiamond',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pauserWallet',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'removeFacet',
    inputs: [
      { name: '_facetAddress', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpauseDiamond',
    inputs: [
      { name: '_blacklist', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'DiamondCut',
    inputs: [
      {
        name: '_diamondCut',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct LibDiamond.FacetCut[]',
        components: [
          {
            name: 'facetAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'action',
            type: 'uint8',
            internalType: 'enum LibDiamond.FacetCutAction',
          },
          {
            name: 'functionSelectors',
            type: 'bytes4[]',
            internalType: 'bytes4[]',
          },
        ],
      },
      {
        name: '_init',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: '_calldata',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyFacetRemoved',
    inputs: [
      {
        name: 'facetAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'msgSender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyPaused',
    inputs: [
      {
        name: 'msgSender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyUnpaused',
    inputs: [
      {
        name: 'msgSender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'CalldataEmptyButInitNotZero', inputs: [] },
  { type: 'error', name: 'DiamondIsPaused', inputs: [] },
  { type: 'error', name: 'FacetAddressIsNotZero', inputs: [] },
  { type: 'error', name: 'FacetAddressIsZero', inputs: [] },
  { type: 'error', name: 'FacetContainsNoCode', inputs: [] },
  { type: 'error', name: 'FacetIsNotRegistered', inputs: [] },
  { type: 'error', name: 'FunctionAlreadyExists', inputs: [] },
  { type: 'error', name: 'FunctionDoesNotExist', inputs: [] },
  { type: 'error', name: 'FunctionIsImmutable', inputs: [] },
  { type: 'error', name: 'IncorrectFacetCutAction', inputs: [] },
  { type: 'error', name: 'InitReverted', inputs: [] },
  { type: 'error', name: 'InitZeroButCalldataNotEmpty', inputs: [] },
  { type: 'error', name: 'NoFacetToPause', inputs: [] },
  { type: 'error', name: 'NoSelectorsInFace', inputs: [] },
  {
    type: 'function',
    name: 'LIFI_INTENT_ESCROW_SETTLER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaLiFiIntentEscrow',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_lifiIntentData',
        type: 'tuple',
        internalType: 'struct LiFiIntentEscrowFacet.LiFiIntentEscrowData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'depositAndRefundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'nonce', type: 'uint256', internalType: 'uint256' },
          { name: 'expires', type: 'uint32', internalType: 'uint32' },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'inputOracle',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputOracle',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputSettler',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'outputCall', type: 'bytes', internalType: 'bytes' },
          { name: 'outputContext', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaLiFiIntentEscrow',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_lifiIntentData',
        type: 'tuple',
        internalType: 'struct LiFiIntentEscrowFacet.LiFiIntentEscrowData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'depositAndRefundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'nonce', type: 'uint256', internalType: 'uint256' },
          { name: 'expires', type: 'uint32', internalType: 'uint32' },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'inputOracle',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputOracle',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputSettler',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'outputCall', type: 'bytes', internalType: 'bytes' },
          { name: 'outputContext', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'NativeAssetNotSupported', inputs: [] },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaHopL1ERC20Packed',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaHopL1NativePacked',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaHopL2ERC20Packed',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaHopL2NativePacked',
    inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '',
        type: 'tuple',
        internalType: 'struct HopFacetOptimized.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hopBridge',
            type: 'address',
            internalType: 'contract IHopBridge',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaHopL1ERC20Packed',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayer', type: 'address', internalType: 'address' },
      { name: 'relayerFee', type: 'uint256', internalType: 'uint256' },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaHopL1NativePacked',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayer', type: 'address', internalType: 'address' },
      { name: 'relayerFee', type: 'uint256', internalType: 'uint256' },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaHopL2ERC20Packed',
    inputs: [
      { name: 'transactionId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutMin', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'destinationDeadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'wrapper', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaHopL2NativePacked',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutMin', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'nativeBridge',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nativeExchangeAddress',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nativeHToken',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nativeL2CanonicalToken',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setApprovalForHopBridges',
    inputs: [
      { name: 'bridges', type: 'address[]', internalType: 'address[]' },
      {
        name: 'tokensToApprove',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1ERC20Min',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayer', type: 'address', internalType: 'address' },
      { name: 'relayerFee', type: 'uint256', internalType: 'uint256' },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1ERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1NativeMin',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'relayer', type: 'address', internalType: 'address' },
      { name: 'relayerFee', type: 'uint256', internalType: 'uint256' },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL1NativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2ERC20Min',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutMin', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'destinationDeadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2ERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2NativeMin',
    inputs: [
      { name: 'transactionId', type: 'bytes8', internalType: 'bytes8' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutMin', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationAmountOutMin',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'destinationDeadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'hopBridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHopL2NativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'LiFiHopTransfer',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes8',
        indexed: false,
        internalType: 'bytes8',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'Invalid', inputs: [] },
  {
    type: 'function',
    name: 'NATIVE_ADDRESS',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'swapTokensMultipleV3ERC20ToERC20',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapTokensMultipleV3ERC20ToNative',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapTokensMultipleV3NativeToERC20',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapTokensSingleV3ERC20ToERC20',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple',
        internalType: 'struct LibSwap.SwapData',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapTokensSingleV3ERC20ToNative',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple',
        internalType: 'struct LibSwap.SwapData',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapTokensSingleV3NativeToERC20',
    inputs: [
      {
        name: '_transactionId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: '_integrator', type: 'string', internalType: 'string' },
      { name: '_referrer', type: 'string', internalType: 'string' },
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address payable',
      },
      { name: '_minAmountOut', type: 'uint256', internalType: 'uint256' },
      {
        name: '_swapData',
        type: 'tuple',
        internalType: 'struct LibSwap.SwapData',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'NativeAssetTransferFailed', inputs: [] },
  {
    type: 'function',
    name: 'spokePool',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IAcrossSpokePool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV3',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV3.AcrossV3Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountPercent',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaAcrossV3',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV3.AcrossV3Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountPercent',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'wrappedNative',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'PIONEER_ADDRESS',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address payable' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaPioneer',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_pioneerData',
        type: 'tuple',
        internalType: 'struct PioneerFacet.PioneerData',
        components: [
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address payable',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaPioneer',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_pioneerData',
        type: 'tuple',
        internalType: 'struct PioneerFacet.PioneerData',
        components: [
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address payable',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'PioneerRefundAddressRegistered',
    inputs: [
      {
        name: 'refundTo',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaUnit',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_unitData',
        type: 'tuple',
        internalType: 'struct UnitFacet.UnitData',
        components: [
          {
            name: 'depositAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaUnit',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_unitData',
        type: 'tuple',
        internalType: 'struct UnitFacet.UnitData',
        components: [
          {
            name: 'depositAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidDestinationChain', inputs: [] },
  { type: 'error', name: 'InvalidSendingToken', inputs: [] },
  { type: 'error', name: 'SignatureExpired', inputs: [] },
  { type: 'error', name: 'TransactionAlreadyProcessed', inputs: [] },
  { type: 'error', name: 'UnsupportedChain', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaGarden',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_gardenData',
        type: 'tuple',
        internalType: 'struct GardenFacet.GardenData',
        components: [
          { name: 'redeemer', type: 'address', internalType: 'address' },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'timelock', type: 'uint256', internalType: 'uint256' },
          {
            name: 'secretHash',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'nonEvmReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaGarden',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_gardenData',
        type: 'tuple',
        internalType: 'struct GardenFacet.GardenData',
        components: [
          { name: 'redeemer', type: 'address', internalType: 'address' },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'timelock', type: 'uint256', internalType: 'uint256' },
          {
            name: 'secretHash',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'nonEvmReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'AssetNotSupported', inputs: [] },
  { type: 'error', name: 'InvalidGardenData', inputs: [] },
  {
    type: 'function',
    name: 'GAS_ZIP_ROUTER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IGasZip' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDestinationChainsValue',
    inputs: [{ name: '_chainIds', type: 'uint8[]', internalType: 'uint8[]' }],
    outputs: [
      {
        name: 'destinationChains',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaGasZip',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_gasZipData',
        type: 'tuple',
        internalType: 'struct IGasZip.GasZipData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'destinationChains',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaGasZip',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_gasZipData',
        type: 'tuple',
        internalType: 'struct IGasZip.GasZipData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'destinationChains',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'OnlyNativeAllowed', inputs: [] },
  { type: 'error', name: 'TooManyChainIds', inputs: [] },
  {
    type: 'function',
    name: 'consumedIds',
    inputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'relayReceiver',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'relaySolver',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaRelay',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_relayData',
        type: 'tuple',
        internalType: 'struct RelayFacet.RelayData',
        components: [
          { name: 'requestId', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaRelay',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_relayData',
        type: 'tuple',
        internalType: 'struct RelayFacet.RelayData',
        components: [
          { name: 'requestId', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidQuote', inputs: [] },
  { type: 'error', name: 'SliceOutOfBounds', inputs: [] },
  { type: 'error', name: 'SliceOverflow', inputs: [] },
  {
    type: 'function',
    name: 'diamondCut',
    inputs: [
      {
        name: '_diamondCut',
        type: 'tuple[]',
        internalType: 'struct LibDiamond.FacetCut[]',
        components: [
          {
            name: 'facetAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'action',
            type: 'uint8',
            internalType: 'enum LibDiamond.FacetCutAction',
          },
          {
            name: 'functionSelectors',
            type: 'bytes4[]',
            internalType: 'bytes4[]',
          },
        ],
      },
      { name: '_init', type: 'address', internalType: 'address' },
      { name: '_calldata', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initOptimism',
    inputs: [
      {
        name: 'configs',
        type: 'tuple[]',
        internalType: 'struct OptimismBridgeFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
      {
        name: 'standardBridge',
        type: 'address',
        internalType: 'contract IL1StandardBridge',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerOptimismBridge',
    inputs: [
      { name: 'assetId', type: 'address', internalType: 'address' },
      { name: 'bridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaOptimismBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_optimismData',
        type: 'tuple',
        internalType: 'struct OptimismBridgeFacet.OptimismData',
        components: [
          {
            name: 'assetIdOnL2',
            type: 'address',
            internalType: 'address',
          },
          { name: 'l2Gas', type: 'uint32', internalType: 'uint32' },
          { name: 'isSynthetix', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaOptimismBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_optimismData',
        type: 'tuple',
        internalType: 'struct OptimismBridgeFacet.OptimismData',
        components: [
          {
            name: 'assetIdOnL2',
            type: 'address',
            internalType: 'address',
          },
          { name: 'l2Gas', type: 'uint32', internalType: 'uint32' },
          { name: 'isSynthetix', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'OptimismBridgeRegistered',
    inputs: [
      {
        name: 'assetId',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'bridge',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OptimismInitialized',
    inputs: [
      {
        name: 'configs',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct OptimismBridgeFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'AlreadyInitialized', inputs: [] },
  { type: 'error', name: 'NotInitialized', inputs: [] },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: '_assetAddress', type: 'address', internalType: 'address' },
      { name: '_to', type: 'address', internalType: 'address' },
      { name: '_amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'LogWithdraw',
    inputs: [
      {
        name: '_assetAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'NotAContract', inputs: [] },
  {
    type: 'function',
    name: 'addressCanExecuteMethod',
    inputs: [
      { name: '_selector', type: 'bytes4', internalType: 'bytes4' },
      { name: '_executor', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setCanExecute',
    inputs: [
      { name: '_selector', type: 'bytes4', internalType: 'bytes4' },
      { name: '_executor', type: 'address', internalType: 'address' },
      { name: '_canExecute', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AccessGranted',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'method',
        type: 'bytes4',
        indexed: true,
        internalType: 'bytes4',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AccessRevoked',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'method',
        type: 'bytes4',
        indexed: true,
        internalType: 'bytes4',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExecutionAllowed',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'method',
        type: 'bytes4',
        indexed: true,
        internalType: 'bytes4',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExecutionDenied',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'method',
        type: 'bytes4',
        indexed: true,
        internalType: 'bytes4',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'CannotAuthoriseSelf', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaGnosisBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaGnosisBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'POLYMER_FEE_RECEIVER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address payable' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TOKEN_MESSENGER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ITokenMessenger',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'USDC',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initPolymerCCTP',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaPolymerCCTP',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_polymerData',
        type: 'tuple',
        internalType: 'struct PolymerCCTPFacet.PolymerCCTPData',
        components: [
          {
            name: 'polymerTokenFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxCCTPFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'minFinalityThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaPolymerCCTP',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_polymerData',
        type: 'tuple',
        internalType: 'struct PolymerCCTPFacet.PolymerCCTPData',
        components: [
          {
            name: 'polymerTokenFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxCCTPFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'nonEVMReceiver',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'minFinalityThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'PolymerCCTPFeeSent',
    inputs: [
      {
        name: 'bridgeAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'polymerFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'minFinalityThreshold',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'CIRCLE_BRIDGE_PROXY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ICircleBridgeProxy',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initCelerCircleBridge',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCelerCircleBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_celerCircleData',
        type: 'tuple',
        internalType: 'struct CelerCircleBridgeFacet.CelerCircleData',
        components: [
          { name: 'maxFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'minFinalityThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaCelerCircleBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_celerCircleData',
        type: 'tuple',
        internalType: 'struct CelerCircleBridgeFacet.CelerCircleData',
        components: [
          { name: 'maxFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'minFinalityThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossV3ERC20Packed',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV3.AcrossV3Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountPercent',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossV3NativePacked',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV3.AcrossV3Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountPercent',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossV3ERC20Packed',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV3.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'depositor', type: 'address', internalType: 'address' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'inputAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossV3NativePacked',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV3.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'depositor', type: 'address', internalType: 'address' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV3ERC20Min',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV3.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'depositor', type: 'address', internalType: 'address' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'inputAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV3ERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV3NativeMin',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV3.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'depositor', type: 'address', internalType: 'address' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV3NativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'initHop',
    inputs: [
      {
        name: 'configs',
        type: 'tuple[]',
        internalType: 'struct HopFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerBridge',
    inputs: [
      { name: 'assetId', type: 'address', internalType: 'address' },
      { name: 'bridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaHop',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacet.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaHop',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_hopData',
        type: 'tuple',
        internalType: 'struct HopFacet.HopData',
        components: [
          { name: 'bonderFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationAmountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationDeadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'relayer', type: 'address', internalType: 'address' },
          {
            name: 'relayerFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'HopBridgeRegistered',
    inputs: [
      {
        name: 'assetId',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'bridge',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HopInitialized',
    inputs: [
      {
        name: 'configs',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct HopFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaOmniBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaOmniBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaPolygonBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaPolygonBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAllBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_allBridgeData',
        type: 'tuple',
        internalType: 'struct AllBridgeFacet.AllBridgeData',
        components: [
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'fees', type: 'uint256', internalType: 'uint256' },
          {
            name: 'receiveToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'nonce', type: 'uint256', internalType: 'uint256' },
          {
            name: 'messenger',
            type: 'uint8',
            internalType: 'enum IAllBridge.MessengerProtocol',
          },
          {
            name: 'payFeeWithSendingAsset',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaAllBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_allBridgeData',
        type: 'tuple',
        internalType: 'struct AllBridgeFacet.AllBridgeData',
        components: [
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'fees', type: 'uint256', internalType: 'uint256' },
          {
            name: 'receiveToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'nonce', type: 'uint256', internalType: 'uint256' },
          {
            name: 'messenger',
            type: 'uint8',
            internalType: 'enum IAllBridge.MessengerProtocol',
          },
          {
            name: 'payFeeWithSendingAsset',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'UnsupportedAllBridgeChainId', inputs: [] },
  {
    type: 'function',
    name: 'PORTAL',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract IEcoPortal' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaEco',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_ecoData',
        type: 'tuple',
        internalType: 'struct EcoFacet.EcoData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'prover', type: 'address', internalType: 'address' },
          {
            name: 'rewardDeadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          { name: 'encodedRoute', type: 'bytes', internalType: 'bytes' },
          { name: 'solanaATA', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'refundRecipient',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaEco',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_ecoData',
        type: 'tuple',
        internalType: 'struct EcoFacet.EcoData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'prover', type: 'address', internalType: 'address' },
          {
            name: 'rewardDeadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          { name: 'encodedRoute', type: 'bytes', internalType: 'bytes' },
          { name: 'solanaATA', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'refundRecipient',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'IntentAlreadyFunded', inputs: [] },
  {
    type: 'function',
    name: 'batchSetContractSelectorWhitelist',
    inputs: [
      {
        name: '_contracts',
        type: 'address[]',
        internalType: 'address[]',
      },
      { name: '_selectors', type: 'bytes4[]', internalType: 'bytes4[]' },
      { name: '_whitelisted', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllContractSelectorPairs',
    inputs: [],
    outputs: [
      { name: 'contracts', type: 'address[]', internalType: 'address[]' },
      {
        name: 'selectors',
        type: 'bytes4[][]',
        internalType: 'bytes4[][]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWhitelistedSelectorsForContract',
    inputs: [{ name: '_contract', type: 'address', internalType: 'address' }],
    outputs: [
      { name: 'selectors', type: 'bytes4[]', internalType: 'bytes4[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isContractSelectorWhitelisted',
    inputs: [
      { name: '_contract', type: 'address', internalType: 'address' },
      { name: '_selector', type: 'bytes4', internalType: 'bytes4' },
    ],
    outputs: [{ name: 'whitelisted', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setContractSelectorWhitelist',
    inputs: [
      { name: '_contract', type: 'address', internalType: 'address' },
      { name: '_selector', type: 'bytes4', internalType: 'bytes4' },
      { name: '_whitelisted', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ContractSelectorWhitelistChanged',
    inputs: [
      {
        name: 'contractAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'selector',
        type: 'bytes4',
        indexed: true,
        internalType: 'bytes4',
      },
      {
        name: 'whitelisted',
        type: 'bool',
        indexed: true,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossV4ERC20Packed',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV4.AcrossV4Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'sendingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountMultiplier',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'decode_startBridgeTokensViaAcrossV4NativePacked',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacetV4.AcrossV4Data',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'sendingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmountMultiplier',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossV4ERC20Packed',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV4.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes8',
            internalType: 'bytes8',
          },
          { name: 'receiver', type: 'bytes32', internalType: 'bytes32' },
          { name: 'depositor', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'sendingAssetId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: 'inputAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'encode_startBridgeTokensViaAcrossV4NativePacked',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV4.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes8',
            internalType: 'bytes8',
          },
          { name: 'receiver', type: 'bytes32', internalType: 'bytes32' },
          { name: 'depositor', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV4ERC20Min',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV4.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes8',
            internalType: 'bytes8',
          },
          { name: 'receiver', type: 'bytes32', internalType: 'bytes32' },
          { name: 'depositor', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'sendingAssetId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      { name: 'inputAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV4ERC20Packed',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV4NativeMin',
    inputs: [
      {
        name: '_parameters',
        type: 'tuple',
        internalType: 'struct AcrossFacetPackedV4.PackedParameters',
        components: [
          {
            name: 'transactionId',
            type: 'bytes8',
            internalType: 'bytes8',
          },
          { name: 'receiver', type: 'bytes32', internalType: 'bytes32' },
          { name: 'depositor', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'destinationChainId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'receivingAssetId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exclusiveRelayer',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityParameter',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcrossV4NativePacked',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'InvalidCalldataLength', inputs: [] },
  { type: 'error', name: 'InvalidInputAmount', inputs: [] },
  {
    type: 'function',
    name: 'initMegaETH',
    inputs: [
      {
        name: '_configs',
        type: 'tuple[]',
        internalType: 'struct MegaETHBridgeFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
      {
        name: '_defaultBridge',
        type: 'address',
        internalType: 'contract IL1StandardBridge',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerMegaETHBridge',
    inputs: [
      { name: '_assetId', type: 'address', internalType: 'address' },
      { name: '_bridge', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaMegaETHBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_megaETHData',
        type: 'tuple',
        internalType: 'struct MegaETHBridgeFacet.MegaETHData',
        components: [
          {
            name: 'assetIdOnL2',
            type: 'address',
            internalType: 'address',
          },
          { name: 'l2Gas', type: 'uint32', internalType: 'uint32' },
          {
            name: 'requiresDepositTo',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaMegaETHBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_megaETHData',
        type: 'tuple',
        internalType: 'struct MegaETHBridgeFacet.MegaETHData',
        components: [
          {
            name: 'assetIdOnL2',
            type: 'address',
            internalType: 'address',
          },
          { name: 'l2Gas', type: 'uint32', internalType: 'uint32' },
          {
            name: 'requiresDepositTo',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'MegaETHBridgeRegistered',
    inputs: [
      {
        name: 'assetId',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'bridge',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MegaETHInitialized',
    inputs: [
      {
        name: 'configs',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct MegaETHBridgeFacet.Config[]',
        components: [
          { name: 'assetId', type: 'address', internalType: 'address' },
          { name: 'bridge', type: 'address', internalType: 'address' },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'CHAINFLIP_VAULT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IChainflipVault',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaChainflip',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_chainflipData',
        type: 'tuple',
        internalType: 'struct ChainflipFacet.ChainflipData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'dstToken', type: 'uint32', internalType: 'uint32' },
          {
            name: 'dstCallReceiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dstCallSwapData',
            type: 'tuple[]',
            internalType: 'struct LibSwap.SwapData[]',
            components: [
              {
                name: 'callTo',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'approveTo',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'sendingAssetId',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'receivingAssetId',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'fromAmount',
                type: 'uint256',
                internalType: 'uint256',
              },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              {
                name: 'requiresDeposit',
                type: 'bool',
                internalType: 'bool',
              },
            ],
          },
          { name: 'gasAmount', type: 'uint256', internalType: 'uint256' },
          { name: 'cfParameters', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaChainflip',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_chainflipData',
        type: 'tuple',
        internalType: 'struct ChainflipFacet.ChainflipData',
        components: [
          {
            name: 'nonEVMReceiver',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'dstToken', type: 'uint32', internalType: 'uint32' },
          {
            name: 'dstCallReceiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dstCallSwapData',
            type: 'tuple[]',
            internalType: 'struct LibSwap.SwapData[]',
            components: [
              {
                name: 'callTo',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'approveTo',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'sendingAssetId',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'receivingAssetId',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'fromAmount',
                type: 'uint256',
                internalType: 'uint256',
              },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              {
                name: 'requiresDeposit',
                type: 'bool',
                internalType: 'bool',
              },
            ],
          },
          { name: 'gasAmount', type: 'uint256', internalType: 'uint256' },
          { name: 'cfParameters', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'EmptyNonEvmAddress', inputs: [] },
  { type: 'error', name: 'UnsupportedChainflipChainId', inputs: [] },
  {
    type: 'function',
    name: 'AIRLIFT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IGlacisAirlift',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaGlacis',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_glacisData',
        type: 'tuple',
        internalType: 'struct GlacisFacet.GlacisData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'outputToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaGlacis',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_glacisData',
        type: 'tuple',
        internalType: 'struct GlacisFacet.GlacisData',
        components: [
          {
            name: 'receiverAddress',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'refundAddress',
            type: 'address',
            internalType: 'address',
          },
          { name: 'nativeFee', type: 'uint256', internalType: 'uint256' },
          {
            name: 'outputToken',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'facetAddress',
    inputs: [
      {
        name: '_functionSelector',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      { name: 'facetAddress_', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'facetAddresses',
    inputs: [],
    outputs: [
      {
        name: 'facetAddresses_',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'facetFunctionSelectors',
    inputs: [{ name: '_facet', type: 'address', internalType: 'address' }],
    outputs: [
      {
        name: 'facetFunctionSelectors_',
        type: 'bytes4[]',
        internalType: 'bytes4[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'facets',
    inputs: [],
    outputs: [
      {
        name: 'facets_',
        type: 'tuple[]',
        internalType: 'struct IDiamondLoupe.Facet[]',
        components: [
          {
            name: 'facetAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'functionSelectors',
            type: 'bytes4[]',
            internalType: 'bytes4[]',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [{ name: '_interfaceId', type: 'bytes4', internalType: 'bytes4' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaCBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_cBridgeData',
        type: 'tuple',
        internalType: 'struct CBridgeFacet.CBridgeData',
        components: [
          { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaCBridge',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_cBridgeData',
        type: 'tuple',
        internalType: 'struct CBridgeFacet.CBridgeData',
        components: [
          { name: 'maxSlippage', type: 'uint32', internalType: 'uint32' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'DLN_SOURCE',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract IDlnSource' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDeBridgeChainId',
    inputs: [{ name: '_chainId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initDeBridgeDln',
    inputs: [
      {
        name: 'chainIdConfigs',
        type: 'tuple[]',
        internalType: 'struct DeBridgeDlnFacet.ChainIdConfig[]',
        components: [
          { name: 'chainId', type: 'uint256', internalType: 'uint256' },
          {
            name: 'deBridgeChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setDeBridgeChainId',
    inputs: [
      { name: '_chainId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_deBridgeChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaDeBridgeDln',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_deBridgeData',
        type: 'tuple',
        internalType: 'struct DeBridgeDlnFacet.DeBridgeDlnData',
        components: [
          {
            name: 'receivingAssetId',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'receiver', type: 'bytes', internalType: 'bytes' },
          {
            name: 'orderAuthorityDst',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'minAmountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaDeBridgeDln',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_deBridgeData',
        type: 'tuple',
        internalType: 'struct DeBridgeDlnFacet.DeBridgeDlnData',
        components: [
          {
            name: 'receivingAssetId',
            type: 'bytes',
            internalType: 'bytes',
          },
          { name: 'receiver', type: 'bytes', internalType: 'bytes' },
          {
            name: 'orderAuthorityDst',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'minAmountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'DeBridgeChainIdSet',
    inputs: [
      {
        name: 'chainId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'deBridgeChainId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DeBridgeInitialized',
    inputs: [
      {
        name: 'chainIdConfigs',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct DeBridgeDlnFacet.ChainIdConfig[]',
        components: [
          { name: 'chainId', type: 'uint256', internalType: 'uint256' },
          {
            name: 'deBridgeChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DlnOrderCreated',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'EmptyNonEVMAddress', inputs: [] },
  { type: 'error', name: 'UnknownDeBridgeChain', inputs: [] },
  {
    type: 'function',
    name: 'startBridgeTokensViaAcross',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacet.AcrossData',
        components: [
          { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaAcross',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_acrossData',
        type: 'tuple',
        internalType: 'struct AcrossFacet.AcrossData',
        components: [
          { name: 'relayerFeePct', type: 'int64', internalType: 'int64' },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          { name: 'maxCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'extractBridgeData',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'extractData',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'extractGenericSwapParameters',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      {
        name: 'receivingAssetId',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'receivingAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'extractMainParameters',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      { name: 'bridge', type: 'string', internalType: 'string' },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
      { name: 'hasDestinationCall', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'extractNonEVMAddress',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      { name: 'nonEVMAddress', type: 'bytes32', internalType: 'bytes32' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'extractSwapData',
    inputs: [{ name: 'data', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: 'swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'validateCalldata',
    inputs: [
      { name: 'data', type: 'bytes', internalType: 'bytes' },
      { name: 'bridge', type: 'string', internalType: 'string' },
      {
        name: 'sendingAssetId',
        type: 'address',
        internalType: 'address',
      },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'destinationChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
      { name: 'hasDestinationCall', type: 'bool', internalType: 'bool' },
    ],
    outputs: [{ name: 'isValid', type: 'bool', internalType: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'validateDestinationCalldata',
    inputs: [
      { name: 'data', type: 'bytes', internalType: 'bytes' },
      { name: 'callTo', type: 'bytes', internalType: 'bytes' },
      { name: 'dstCalldata', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: 'isValid', type: 'bool', internalType: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'startBridgeTokensViaThorSwap',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_thorSwapData',
        type: 'tuple',
        internalType: 'struct ThorSwapFacet.ThorSwapData',
        components: [
          { name: 'vault', type: 'address', internalType: 'address' },
          { name: 'memo', type: 'string', internalType: 'string' },
          { name: 'expiration', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'swapAndStartBridgeTokensViaThorSwap',
    inputs: [
      {
        name: '_bridgeData',
        type: 'tuple',
        internalType: 'struct ILiFi.BridgeData',
        components: [
          {
            name: 'transactionId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          { name: 'bridge', type: 'string', internalType: 'string' },
          { name: 'integrator', type: 'string', internalType: 'string' },
          { name: 'referrer', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'hasSourceSwaps', type: 'bool', internalType: 'bool' },
          {
            name: 'hasDestinationCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: '_swapData',
        type: 'tuple[]',
        internalType: 'struct LibSwap.SwapData[]',
        components: [
          { name: 'callTo', type: 'address', internalType: 'address' },
          { name: 'approveTo', type: 'address', internalType: 'address' },
          {
            name: 'sendingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receivingAssetId',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'fromAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'requiresDeposit', type: 'bool', internalType: 'bool' },
        ],
      },
      {
        name: '_thorSwapData',
        type: 'tuple',
        internalType: 'struct ThorSwapFacet.ThorSwapData',
        components: [
          { name: 'vault', type: 'address', internalType: 'address' },
          { name: 'memo', type: 'string', internalType: 'string' },
          { name: 'expiration', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'DeprecatedToken', inputs: [] },
  { type: 'error', name: 'AddressOutOfBounds', inputs: [] },
] as any;

export const AbiList: EvmAbi[] = [
  {
    type: EVMSmartContractType.ERC20,
    abi: Erc20Abi,
    methods: [
      'totalSupply',
      'balanceOf',
      'transfer',
      'allowance',
      'approve',
      'transferFrom',
      'Transfer',
      'Approval',
    ],
  },
  {
    type: EVMSmartContractType.ERC721,
    abi: ERC721Abi,
    methods: [
      'balanceOf',
      'ownerOf',
      'safeTransferFrom',
      'transferFrom',
      'approve',
      'getApproved',
      'setApprovalForAll',
      'isApprovedForAll',
      'supportsInterface',
      'Transfer',
      'Approval',
      'ApprovalForAll',
      'name',
      'symbol',
      'totalSupply',
      'tokenURI',
      'currentTokenId',
      'mintNFTs',
    ],
  },
  {
    type: EVMSmartContractType.ERC721,
    abi: ERC721EnumerableAbi,
    methods: [
      'balanceOf',
      'ownerOf',
      'safeTransferFrom',
      'transferFrom',
      'approve',
      'getApproved',
      'setApprovalForAll',
      'isApprovedForAll',
      'supportsInterface',
      'Transfer',
      'Approval',
      'ApprovalForAll',
      'name',
      'symbol',
      'totalSupply',
      'tokenOfOwnerByIndex',
      'tokenByIndex',
      'tokenURI',
      'mint',
    ],
  },
  {
    type: EVMSmartContractType.ERC1155,
    abi: ERC1155Abi,
    methods: [
      'balanceOf',
      'balanceOfBatch',
      'setApprovalForAll',
      'isApprovedForAll',
      'safeTransferFrom',
      'safeBatchTransferFrom',
      'supportsInterface',
      'TransferSingle',
      'TransferBatch',
      'ApprovalForAll',
      'URI',
      'uri',
    ],
  },
];

export const getAbiFromType = (type: EVMSmartContractType) => {
  const abi = AbiList.find((a) => a.type === type);
  return abi?.abi;
};
