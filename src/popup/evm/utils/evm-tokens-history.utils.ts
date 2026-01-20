import { AvalancheApi } from '@popup/evm/api/avalanche.api';
import { BlockscoutApi } from '@popup/evm/api/blockscout.api';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmTokensHistoryParserUtils } from '@popup/evm/utils/evm-tokens-history-parser.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  BlockExplorerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ArrayUtils } from 'src/utils/array.utils';
import { AsyncUtils } from 'src/utils/async.utils';
import Logger from 'src/utils/logger.utils';

// const RESULTS_PER_PAGE = 20;
const RESULTS_PER_PAGE = 100;
const RESULTS_PER_PAGE_AVALANCHE = 100;

let cachedData: any[] = [];

const fetchHistory = async (
  walletAddress: string,
  chain: EvmChain,
  history?: EvmUserHistory,
) => {
  const start = Date.now();

  if (!history || !history.events) {
    history = {
      lastPage: 1,
      events: [],
      fullyFetch: false,
    } as EvmUserHistory;
  } else {
    history.lastPage += 1;
  }
  let allTokensMetadata = await EvmTokensUtils.getMetadataFromStorage(chain);

  // TODO remove

  // walletAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  // walletAddress = '0xB06Ea6E48A317Db352fA161c8140e8e0791EbB58';

  let promisesResult: { [key: string]: any[] } = {};
  promisesResult = await AsyncUtils.promiseAllWithKeys({
    tokens: fetchAllTokensTx(walletAddress, chain, history.lastPage),
    nfts: fetchAllNftsTx(walletAddress, chain, history.lastPage),
    internals: fetchAllInternalTx(walletAddress, chain, history.lastPage),
    main: fetchMainHistory(walletAddress, chain, history.lastPage),
  });

  promisesResult['internals'] = [];

  // TODO delete when finish
  // const test = ['tokens', 'nfts', 'main'];
  // for (const key of test) {
  //   const list = promisesResult[key];

  //   for (const i of promisesResult['internals']) {
  //     const tx = list.find((t) => t.hash === i.transactionHash);
  //     if (tx && i) {
  //       console.log(tx, i);
  //     }
  //   }
  // }

  // Find latest date among full list
  let latestDate = 0;

  let fetchFinished = true;
  for (const listKey of Object.keys(promisesResult)) {
    if (promisesResult[listKey].length === RESULTS_PER_PAGE) {
      fetchFinished = false;
      const localLatest = Number(
        promisesResult[listKey][promisesResult[listKey].length - 1].timeStamp,
      );
      if (!latestDate || localLatest > latestDate) latestDate = localLatest;
    }
  }

  let events = [];
  // Merge lists without duplicates
  let duplicates = 0;
  let eventsHashes: string[] = [];

  const tmpCachedData = [];
  for (const data of cachedData) {
    const hash = data.hash ?? data.transactionHash;
    if (!eventsHashes.includes(hash)) {
      if (data.timeStamp >= latestDate) {
        events.push(data);
        eventsHashes.push(hash);
      } else {
        tmpCachedData.push(data);
      }
    }
  }
  cachedData = tmpCachedData;

  for (const listKey of Object.keys(promisesResult)) {
    for (const event of promisesResult[listKey]) {
      if (
        chain.blockExplorerApi?.type === BlockExplorerType.AVALANCHE_SCAN ||
        !eventsHashes.includes(event.hash ?? event.transactionHash)
      ) {
        if (Number(event.timeStamp) >= latestDate) {
          events.push(event);
          eventsHashes.push(event.hash ?? event.transactionHash);
        } else {
          cachedData.push(event);
        }
      } else {
        duplicates++;
      }
    }
  }

  console.log(`${duplicates} duplicates`);

  events = events.sort((a, b) => b.timeStamp - a.timeStamp);

  const allSmartContractsAddresses = ArrayUtils.removeDuplicates(
    events
      .filter((event) => event.contractAddress?.length > 0)
      .map((event) => event.contractAddress),
  );

  console.log('----- Get metadata from backend -----');
  const metadata = await EvmTokensUtils.getMetadataFromBackend(
    ArrayUtils.inAButNotB(
      allSmartContractsAddresses,
      allTokensMetadata
        .filter((metadata) => metadata.type !== EVMSmartContractType.NATIVE)
        .map(
          (metadata) =>
            (
              metadata as
                | EvmSmartContractInfoErc1155
                | EvmSmartContractInfoErc721
                | EvmSmartContractInfoErc20
            ).contractAddress,
        ),
    ),
    chain,
  );
  console.log(
    '-----End Get metadata from backend -----',
    (Date.now() - start) / 1000,
  );

  const newAllTokensMetadata = [...allTokensMetadata, ...(metadata ?? [])];

  const evmSettings = await EvmSettingsUtils.getSettings();

  console.log('start parsing');
  for (const event of events) {
    if (event.txreceipt_status === '0') {
      Logger.warn(`Transaction ${event.hash} ignored because failed`);
      continue;
    }
    if (event.contractAddress && event.contractAddress.length > 0) {
      const metadata = newAllTokensMetadata.find(
        (metadata) =>
          metadata.type !== EVMSmartContractType.NATIVE &&
          (
            metadata as
              | EvmSmartContractInfoErc20
              | EvmSmartContractInfoErc721
              | EvmSmartContractInfoErc1155
          ).contractAddress.toLowerCase() ===
            event.contractAddress.toLowerCase(),
      ) as
        | EvmSmartContractInfoErc20
        | EvmSmartContractInfoErc721
        | EvmSmartContractInfoErc1155;
      if (evmSettings && evmSettings.smartContracts) {
        if (!evmSettings?.smartContracts.displayPossibleSpam) {
          if (metadata && metadata.possibleSpam) {
            continue;
          }
        }
        if (!evmSettings?.smartContracts.displayNonVerifiedContracts) {
          if (metadata && !metadata.verifiedContract) {
            continue;
          }
        }
      }
    }

    const historyItem = await EvmTokensHistoryParserUtils.parseEvent(
      event,
      chain,
      walletAddress.toLowerCase(),
      newAllTokensMetadata,
      evmSettings,
    );
    if (historyItem) {
      history.events.push(historyItem);
    }
  }
  Logger.info('End parsing ' + (Date.now() - start) / 1000);
  history.fullyFetch = fetchFinished;
  return history;
};

const fetchMainHistory = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 1,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let mainHistoryResponse;
    Logger.info(`Fetching  page ${page}`);
    switch (chain.blockExplorerApi?.type) {
      case BlockExplorerType.BLOCKSCOUT:
        mainHistoryResponse = await BlockscoutApi.getHistory(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.AVALANCHE_SCAN:
        mainHistoryResponse = await AvalancheApi.getHistory(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.ETHERSCAN:
        mainHistoryResponse = await EtherscanApi.getHistory(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
    }

    Logger.info('End fetch main history : ' + (Date.now() - start) / 1000);
    resolve(mainHistoryResponse);
  });
};

const fetchAllTokensTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 1,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let tokensHistory;
    Logger.info(`Fetching Tokens history page ${page}`);
    switch (chain.blockExplorerApi?.type) {
      case BlockExplorerType.BLOCKSCOUT:
        tokensHistory = await BlockscoutApi.getTokenTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.AVALANCHE_SCAN:
        tokensHistory = await AvalancheApi.getTokenTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.ETHERSCAN:
        tokensHistory = await EtherscanApi.getTokenTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
    }

    Logger.info('End fetch Tokens history ' + (Date.now() - start) / 1000);
    resolve(tokensHistory);
  });
};

const fetchAllNftsTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 1,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let ntfsHistory;
    Logger.info(`Fetching NFT history page ${page}`);
    switch (chain.blockExplorerApi?.type) {
      case BlockExplorerType.BLOCKSCOUT:
        ntfsHistory = await BlockscoutApi.getNftTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.AVALANCHE_SCAN:
        ntfsHistory = await AvalancheApi.getNftTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.ETHERSCAN:
        ntfsHistory = await EtherscanApi.getNftTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
    }

    Logger.info('End fetch NFT history ' + (Date.now() - start) / 1000);
    resolve(ntfsHistory);
  });
};

const fetchAllInternalTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 1,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let internalsHistory;
    Logger.info(`Fetching internals history page ${page}`);
    switch (chain.blockExplorerApi?.type) {
      case BlockExplorerType.BLOCKSCOUT:
        internalsHistory = await BlockscoutApi.getInternalsTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.AVALANCHE_SCAN:
        internalsHistory = await AvalancheApi.getInternalsTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
      case BlockExplorerType.ETHERSCAN:
        internalsHistory = await EtherscanApi.getInternalsTx(
          walletAddress,
          chain,
          page,
          RESULTS_PER_PAGE,
        );
        break;
    }

    Logger.info('End fetch internals history ' + (Date.now() - start) / 1000);
    resolve(internalsHistory);
  });
};

export const EvmTokensHistoryUtils = {
  fetchHistory,
};
