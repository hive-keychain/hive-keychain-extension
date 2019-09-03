class Rpcs {

  constructor() {
    this.currentRpc = 'https://api.steemit.com';
    this.awaitRollback = false;
    this.list = [
      "https://api.steemit.com",
      "https://anyx.io",
      "https://rpc.usesteem.com",
      "https://api.steemitdev.com",
      "https://api.steem.house",
      "https://steemd.minnowsupportproject.org",
      "https://steemd.privex.io",
      "https://appbasetest.timcliff.com",
      "TESTNET"
    ];
  }

  getList() {
    return this.list;
  }

  setOptions(rpc, awaitRollback = false) {
    if (rpc === this.currentRpc) {
      console.log('Same RPC');
      return;
    }
    const newRpc = this.list.includes(rpc) ? rpc : this.currentRpc;
    if (newRpc === 'TESTNET') {
      steem.api.setOptions({
        url: 'https://testnet.steemitdev.com',
        transport: 'http',
        useAppbaseApi: true
      });
      steem.config.set('address_prefix', 'TST');
      steem.config.set('chain_id', '46d82ab7d8db682eb1959aed0ada039a6d49afa1602491f93dde9cac3e8e6c32');
    } else {
      steem.api.setOptions({
        url: newRpc,
        useAppbaseApi: true
      });
      steem.config.set('address_prefix', 'STM');
      steem.config.set('chain_id', '0000000000000000000000000000000000000000000000000000000000000000');
    }
    this.previousRpc = this.currentRpc;
    this.currentRpc = newRpc;
    console.log(`Now using ${this.currentRpc}, previous: ${this.previousRpc}`);
    this.awaitRollback = awaitRollback;
    return;
  }

  rollback() {
    if (this.awaitRollback) {
      console.log('rolling back to user defined rpc');
      this.setOptions(this.previousRpc);
      this.awaitRollback = false;
    }
    return;
  }
}