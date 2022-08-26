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
