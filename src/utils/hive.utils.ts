import { Client } from "@hiveio/dhive";

const DEFAULT_RPC = 'https://api.hive.blog';

let client = new Client(DEFAULT_RPC);

const getClient = (): Client => {
    return client;
}

const HiveUtils = {
    getClient
}


export default HiveUtils;
