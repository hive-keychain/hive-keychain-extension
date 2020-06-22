class Rpcs {
  constructor() {
    this.currentRpc = "https://api.hive.blog/";
    this.awaitRollback = false;
    this.DEFAULT_RPC_API = "https://api.steemkeychain.com/hive/rpc";
    this.list = this.initList();
    //this.version = hive.api.getVersionAsync();
  }
  getCurrent() {
    return this.currentRpc;
  }
  async initList() {
    let listRPC = [];
    const RPCs = [
      "DEFAULT",
      "https://api.hive.blog/",
      "https://api.openhive.network/",
      "https://api.hivekings.com/",
      "https://anyx.io/",
      "https://api.pharesim.me/",
      "https://hived.hive-engine.com/",
      "https://hived.privex.io/",
      "TESTNET"
    ];

    return new Promise(resolve => {
      chrome.storage.local.get(["rpc", "current_rpc"], items => {
        const local = items.rpc;
        listRPC = local != undefined ? JSON.parse(local).concat(RPCs) : RPCs;
        const currentrpc = items.current_rpc || "DEFAULT";
        const list = [currentrpc].concat(
          listRPC.filter(e => {
            return e != currentrpc;
          })
        );
        resolve(list);
      });
    });
  }

  async getList() {
    return await this.initList();
  }

  async setOptions(rpc, awaitRollback = false) {
    //console.log("option:", rpc);
    if (rpc === this.currentRpc) {
      //console.log("Same RPC");
      return;
    }
    const list = await this.getList();
    const newRpc = list.includes(rpc) ? rpc : this.currentRpc;
    if (newRpc === "TESTNET") {
      // steem.api.setOptions({
      //   url: "https://testnet.steemitdev.com",
      //   transport: "http",
      //   useAppbaseApi: true
      // });
      // steem.config.set("address_prefix", "TST");
      // steem.config.set(
      //   "chain_id",
      //   "46d82ab7d8db682eb1959aed0ada039a6d49afa1602491f93dde9cac3e8e6c32"
      // );
    } else {
      if (newRpc === "DEFAULT") {
        let rpc;
        try {
          rpc = (await this.getDefaultRPC()).rpc || this.list[1];
          console.log(`Using ${rpc} as default.`);
        } catch (e) {
          rpc = "https://api.hive.blog/";
        }

        hive.api.setOptions({
          url: rpc,
          useAppbaseApi: true
        });
      } else {
        hive.api.setOptions({
          url: newRpc,
          useAppbaseApi: true
        });
      }
      /*const version = parseInt(
        (await this.version).blockchain_version.split(".")[1]
      );
      const chain_id =
        version >= 24
          ? "BEEABODE00000000000000000000000000000000000000000000000000000000"
          : "0000000000000000000000000000000000000000000000000000000000000000";
      console.log(`HF${version} => chain_id: ${chain_id}`);
      hive.config.set("address_prefix", "STM");
      hive.config.set("chain_id", chain_id);*/
    }
    this.previousRpc = this.currentRpc;
    this.currentRpc = newRpc;
    console.log(`Now using ${this.currentRpc}, previous: ${this.previousRpc}`);
    this.awaitRollback = awaitRollback;
    return;
  }

  rollback() {
    if (this.awaitRollback) {
      console.log("Rolling back to user defined rpc");
      this.setOptions(this.previousRpc);
      this.awaitRollback = false;
    }
    return;
  }

  async getDefaultRPC() {
    return $.ajax({
      url: this.DEFAULT_RPC_API,
      type: "GET"
    });
  }
}
