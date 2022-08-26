export class Tests_Client {
  address: any;
  database: {};
  options: {};
  constructor(address: string, options: {}) {
    this.address = address;
    this.database = {
      getAccounts: () =>
        Promise.resolve([{ balance: '100 HIVE', hbd_balance: '100' }]),
    };
    this.options = options;
  }
}

export class Tests_ClientError {
  address: any;
  database: {};
  options: {};
  constructor(address: string, options: {}) {
    this.address = address;
    this.database = {
      getAccounts: () => Promise.reject('Error getting accounts from HIVE!'),
    };
    this.options = options;
  }
}
export class Tests_SCC {
  rpc: string;
  constructor(rpc: string) {
    this.rpc = rpc;
  }
  find(contract: string, table: string) {
    return Promise.resolve([
      {
        _id: 13429,
        account: 'keychain.tests',
        symbol: 'LEO',
        balance: '10.000',
        stake: '1.000',
        pendingUnstake: '0',
        delegationsIn: '1',
        delegationsOut: '1',
        pendingUndelegations: '0',
      },
    ]);
  }
}
