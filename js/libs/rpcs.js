class Rpcs {
  constructor() {
    this.currentRpc = "https://api.hive.blog/";
    this.awaitRollback = false;
    this.DEFAULT_RPC_API = "https://api.hive-keychain.com/hive/rpc";
    this.list = this.initList();

    hive.config.set("rebranded_api", true);
  }
  getCurrent() {
    return this.currentRpc;
  }
  async initList() {
    let listRPC = [];
    const RPCs = [
      { uri: "DEFAULT", testnet: false },
      { uri: "https://api.deathwing.me", testnet: false },
      { uri: "https://api.hive.blog/", testnet: false },
      { uri: "https://api.openhive.network/", testnet: false },
      { uri: "https://api.hivekings.com/", testnet: false },
      { uri: "https://anyx.io/", testnet: false },
      { uri: "https://api.pharesim.me/", testnet: false },
      { uri: "https://hived.emre.sh", testnet: false },
      { uri: "https://hived.hive-engine.com/", testnet: false },
      { uri: "https://hived.privex.io/", testnet: false },
      { uri: "https://hive.roelandp.nl", testnet: false },
      { uri: "https://rpc.ausbit.dev", testnet: false },
      { uri: "https://rpc.ecency.com", testnet: false },
      { uri: "https://techcoderx.com", testnet: false },
      { uri: "https://hive-api.arcange.eu/", testnet: false },
    ];

    return new Promise((resolve) => {
      chrome.storage.local.get(["rpc", "current_rpc"], (items) => {
        const local = items.rpc;
        if (local) {
          listRPC = JSON.parse(local)
            .map((e) => {
              if (typeof e === "string") {
                return { uri: e, testnet: false };
              } else return e;
            })
            .concat(RPCs);
        } else {
          listRPC = RPCs;
        }
        const currentrpc = items.current_rpc || "DEFAULT";
        const list = [RPCs.find((e) => (e.uri = currentrpc))].concat(
          listRPC.filter((e) => {
            return e.uri != currentrpc;
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
    rpc = rpc.replace("(TESTNET)", "").trim();
    if (rpc === this.currentRpc) {
      return;
    }
    const list = await this.getList();
    const newRpcObj = list.find(
      (e) => e.uri === rpc.replace("(TESTNET)", "").trim()
    );

    const newRpc = newRpcObj
      ? newRpcObj
      : list.find((e) => e.uri === this.currentRpc);
    if (newRpc.testnet) {
      hive.api.setOptions({
        url: newRpc.uri,
        transport: "http",
        useAppbaseApi: true,
      });
      hive.config.set("address_prefix", "TST");
      hive.config.set("chain_id", newRpc.chainId);
    } else {
      console.log("reset chain id");
      hive.config.set("address_prefix", "STM");
      hive.config.set(
        "chain_id",
        "beeab0de00000000000000000000000000000000000000000000000000000000"
      );

      if (newRpc.uri === "DEFAULT") {
        let rpc;
        try {
          rpc = (await this.getDefaultRPC()).rpc || this.list[1].uri;
          console.log(`Using ${rpc} as default.`);
        } catch (e) {
          rpc = "https://api.hive.blog/";
        }

        hive.api.setOptions({
          url: rpc,
          useAppbaseApi: true,
        });
      } else {
        hive.api.setOptions({
          url: newRpc.uri,
          useAppbaseApi: true,
        });
      }
    }
    this.previousRpc = this.currentRpc;
    this.currentRpc = newRpc.uri;
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
      type: "GET",
    });
  }
}
