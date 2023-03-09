import userData from 'src/__tests__/utils-for-testing/data/user-data';

const constants = {
  swapHiveBalance: {
    _id: 13429,
    account: userData.one.username,
    symbol: 'SWAP.HIVE',
    balance: '38.861',
    stake: '1.060',
    pendingUnstake: '0',
    delegationsIn: '1',
    delegationsOut: '1',
    pendingUndelegations: '0',
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.resetAllMocks();
  }),
};

export default { constants, methods };
