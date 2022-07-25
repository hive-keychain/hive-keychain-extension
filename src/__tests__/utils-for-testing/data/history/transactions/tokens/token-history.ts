import { TokenTransaction } from '@interfaces/tokens.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const leoToken: TokenTransaction[] = [
  {
    _id: '61674a248bae1252026e04ef',
    account: mk.user.one,
    amount: '0.986 LEO',
    authorPerm: 're-theghost1980-20211215t195955670z',
    authorperm: 're-theghost1980-20211215t195955670z',
    blockNumber: 11274525,
    from: 'fakeuser',
    memo: null,
    operation: 'comments_curationReward',
    quantity: '0.986',
    symbol: 'LEO',
    timestamp: 1634159133,
    to: mk.user.one,
    transactionId: 'e3525c27349cd7b32903385d967b86273b987377',
  } as any,
  {
    _id: '61654d8f8bae125202648bbd',
    account: mk.user.one,
    amount: '0.985 LEO',
    authorPerm: 're-theghost1980-20211215t195955670z',
    authorperm: 're-theghost1980-20211215t195955670z',
    blockNumber: 11231373,
    from: mk.user.one,
    memo: null,
    operation: 'comments_authorReward',
    quantity: '0.985',
    symbol: 'LEO',
    timestamp: 1634028936,
    to: 'theghost1980',
    transactionId: 'fcbd964d3b48a91ed749b0c67d4d57c4cd5a21d0',
  } as any,
  {
    _id: '615a3b378bae1252023114ba',
    account: mk.user.one,
    amount: '10000.985 LEO',
    blockNumber: 10990073,
    from: 'contract_tokens',
    memo: 'Fake Memo mining_lottery',
    operation: 'mining_lottery',
    poolId: '10099',
    quantity: '10000.985',
    symbol: 'LEO',
    timestamp: 1633303344,
    to: mk.user.one,
    transactionId: 'ca9397cff3f270abeef4880de6570c3adec49134',
  } as any,
  {
    _id: '6147d1928bae125202dd666e',
    account: mk.user.one,
    amount: '0.985 LEO',
    blockNumber: 10589513,
    from: 'contract_tokens',
    memo: 'Fake Memo tokens_transfer',
    operation: 'tokens_transfer',
    quantity: '0.985',
    symbol: 'LEO',
    timestamp: 1632096651,
    to: mk.user.one,
    transactionId: '9e79e7a4b3d9cd057655870a7f16959f0674352e',
  } as any,
  {
    _id: '613ef535780fd34f81d69aef',
    account: mk.user.one,
    amount: '1000.986 LEO',
    blockNumber: 10335267,
    from: 'contract_tokens',
    memo: null,
    operation: 'tokens_stake',
    quantity: '1000.986',
    symbol: 'LEO',
    timestamp: 1631331048,
    to: mk.user.one,
    transactionId: '5283ef02a869d85be961e963cd7aa75100b0a6b6',
  } as any,
  {
    _id: '6135cb1c187544f7ef365d21',
    account: mk.user.one,
    amount: '100000.985 LEO',
    blockNumber: 9747646,
    delegatee: 'theghost1980',
    delegator: mk.user.one,
    from: mk.user.one,
    memo: null,
    operation: 'tokens_delegate',
    quantity: '100000.985',
    symbol: 'LEO',
    timestamp: 1629562089,
    to: 'theghost1980',
    transactionId: 'a463cc98b9912dd117856250087d2842b0ff5f4d',
  } as any,
  {
    _id: '6135ca75187544f7ef2f3833',
    account: mk.user.one,
    amount: '0.985 LEO',
    blockNumber: 9709308,
    delegatee: 'contract_tokens',
    delegator: mk.user.one,
    from: 'contract_tokens',
    memo: null,
    operation: 'tokens_undelegateStart',
    quantity: '0.985',
    symbol: 'LEO',
    timestamp: 1629446655,
    to: mk.user.one,
    transactionId: '39b772d44f0f6df07e43397078a53d06eda8e802',
  } as any,
  {
    _id: '6135999e187544f7efe79c78',
    account: mk.user.one,
    amount: '6.666 LEO',
    blockNumber: 6801163,
    delegatee: 'contract_tokens',
    delegator: mk.user.one,
    from: 'contract_tokens',
    memo: null,
    operation: 'tokens_undelegateDone',
    quantity: '6.666 LEO',
    symbol: 'LEO',
    timestamp: 1620470055,
    to: mk.user.one,
    transactionId: '82f138ba16de2ce3bd7901ce5819fd0693e09aa0-3',
  } as any,
];

export default { leoToken };
