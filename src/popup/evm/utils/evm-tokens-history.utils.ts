import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import {
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
  EvmUserHistory,
  EvmUserHistoryItem,
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionDecodedData } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { ArrayUtils } from 'src/utils/array.utils';
import { AsyncUtils } from 'src/utils/async.utils';
import Logger from 'src/utils/logger.utils';

const MIN_NEW_TRANSACTION = 1;
const LIMIT = 20000;
const RESULTS_PER_PAGE = 100;

const fetchHistory = async (
  walletAddress: string,
  chain: EvmChain,
  history?: EvmUserHistory,
) => {
  const start = Date.now();

  if (!history) {
    history = {
      lastPage: 0,
      events: [],
      fullyFetch: false,
    } as EvmUserHistory;
  }

  history.lastPage = history.lastPage + 1;

  let allTokensMetadata = await EvmTokensUtils.getMetadataFromStorage(chain);

  let events: any[] = [];
  Logger.info(`Fetching  page ${history.lastPage}`);

  let [
    mainHistoryResponse,
    tokensHistoryResponse,
    nftsHistoryReponse,
    internalTxHistoryResponse,
  ] = await Promise.all([
    fetchMainHistory(walletAddress, chain, history),
    fetchAllTokensTx(walletAddress, chain, 0),
    fetchAllNftsTx(walletAddress, chain, 0),
    fetchAllInternalTx(walletAddress, chain, 0),
  ]);

  console.log({
    mainHistoryResponse,
    tokensHistoryResponse,
    nftsHistoryReponse,
    internalTxHistoryResponse,
  });

  if (
    mainHistoryResponse.length !== RESULTS_PER_PAGE &&
    tokensHistoryResponse.length !== RESULTS_PER_PAGE &&
    nftsHistoryReponse.length !== RESULTS_PER_PAGE &&
    internalTxHistoryResponse.length !== RESULTS_PER_PAGE
  ) {
    history.fullyFetch = true;
  }

  const lastestDate =
    mainHistoryResponse[mainHistoryResponse.length - 1].timeStamp;

  let allDataSync = false;

  let nextPage = 1;
  do {
    const promises: any = {};
    if (
      tokensHistoryResponse.length > 0 &&
      tokensHistoryResponse[tokensHistoryResponse.length - 1].timeStamp >
        lastestDate &&
      tokensHistoryResponse.length === RESULTS_PER_PAGE
    ) {
      promises['tokens'] = fetchAllTokensTx(walletAddress, chain, nextPage);
    }
    if (
      nftsHistoryReponse.length > 0 &&
      nftsHistoryReponse[nftsHistoryReponse.length - 1].timeStamp >
        lastestDate &&
      nftsHistoryReponse.length === RESULTS_PER_PAGE
    ) {
      promises['nfts'] = fetchAllNftsTx(walletAddress, chain, nextPage);
    }
    if (
      internalTxHistoryResponse.length > 0 &&
      internalTxHistoryResponse[internalTxHistoryResponse.length - 1]
        .timeStamp > lastestDate &&
      tokensHistoryResponse.length === RESULTS_PER_PAGE
    ) {
      promises['internal'] = fetchAllInternalTx(walletAddress, chain, nextPage);
    }

    const promisesResult = await AsyncUtils.promiseAllWithKeys(promises);

    nextPage++;
    // console.log(promisesResult);

    allDataSync = Object.keys(promises).length > 0 ? false : true;
  } while (allDataSync === false);

  console.log(`First page of main history ends on ${lastestDate}`);

  // console.log('End fetch', (Date.now() - start) / 1000);

  // merge all three lists

  events = [...events, ...mainHistoryResponse];
  const allSmartContractsAddresses = ArrayUtils.removeDuplicates(
    events
      .filter((event) => event.contractAddress.length > 0)
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
            ).address,
        ),
    ),
    chain,
  );
  console.log(
    '-----End Get metadata from backend -----',
    (Date.now() - start) / 1000,
  );

  const tokenMetadata = [...allTokensMetadata, ...metadata];

  console.log('start parsing');
  // console.log({ metadata, allTokensMetadata });
  for (const event of events) {
    let historyItem = { ...getCommonHistoryItem(event) } as EvmUserHistoryItem;
    // parse event

    if (event.contractAddress.length > 0) {
      // contract creation

      const details: EvmUserHistoryItemDetail[] = [];
      details.push({
        label: 'evm_created_smart_contract',
        value: event.contractAddress,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      });

      historyItem = {
        ...historyItem,
        type: EvmUserHistoryItemType.SMART_CONTRACT_CREATION,
      };

      historyItem.label = chrome.i18n.getMessage(
        'evm_history_smart_contract_creation_message',
        [EvmFormatUtils.formatAddress(event.contractAddress)],
      );
      historyItem.pageTitle = 'evm_history_smart_contract_creation';
      historyItem.detailFields = details;
    } else if (
      (await EvmAddressesUtils.getAddressType(event.to, chain)) ===
      EvmAddressType.WALLET_ADDRESS
    ) {
      // Normal transaction
      const mainToken = allTokensMetadata.find(
        (t) => t.type === EVMSmartContractType.NATIVE,
      );
      // native event
      const amount = EvmFormatUtils.etherToGwei(
        Number(event.value) / 1000000000,
      ).toString();

      const details: EvmUserHistoryItemDetail[] = [];
      details.push({
        label: 'popup_html_evm_transaction_info_from',
        value: event.from,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      });
      details.push({
        label: 'popup_html_evm_transaction_info_to',
        value: event.to,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      });
      details.push({
        label: 'popup_html_transfer_amount',
        value: `${amount.toString()} ${mainToken!.symbol.toString()}`,
        type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
      });

      historyItem = {
        ...historyItem,
        type:
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? EvmUserHistoryItemType.TRANSFER_OUT
            : EvmUserHistoryItemType.TRANSFER_IN,
        from: event.from,
        to: event.to,
        amount: amount,
        isCanceled: Number(event.value) === 0,
        label: chrome.i18n.getMessage(
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? 'popup_html_evm_history_transfer_out'
            : 'popup_html_evm_history_transfer_in',
          [
            amount,
            mainToken!.symbol,
            EvmFormatUtils.formatAddress(
              event.from.toLowerCase() === walletAddress.toLowerCase()
                ? event.to
                : event.from,
            ),
          ],
        ),
        detailFields: details,
        pageTitle: 'popup_html_transfer_funds',
        tokenInfo: mainToken,
      } as EvmTokenTransferInHistoryItem | EvmTokenTransferOutHistoryItem;
    } else {
      // Smart contract (parse transaction)

      const decodedData = await EvmTransactionParserUtils.parseData(
        event.input,
        chain,
      );

      historyItem = {
        ...historyItem,
        type: EvmUserHistoryItemType.SMART_CONTRACT,
      };

      const specificData = await getSpecificData(
        chain,
        event.to.toLowerCase(),
        event.from.toLowerCase(),
        walletAddress.toLowerCase(),
        decodedData,
        tokenMetadata,
      );

      historyItem.label = specificData.label;
      historyItem.pageTitle = specificData.pageTitle;
      historyItem.receiverAddress = specificData.receiverAddress;
      historyItem.detailFields = specificData.detailFields;
      historyItem.tokenInfo = specificData.tokenInfo;
    }
    history.events.push(historyItem);
  }
  console.log('end parsing', (Date.now() - start) / 1000);
  return history;
};

// TODO change return
const fetchMainHistory = (
  walletAddress: string,
  chain: EvmChain,
  history: EvmUserHistory,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let mainHistoryResponse;
    Logger.info(`Fetching  page ${history.lastPage}`);
    mainHistoryResponse = await EtherscanApi.getHistory(
      walletAddress,
      chain,
      history.lastPage,
      RESULTS_PER_PAGE,
    );

    console.log('End fetch main history', (Date.now() - start) / 1000);
    resolve(mainHistoryResponse);
  });
};

const fetchAllTokensTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 0,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let tokensHistory;
    Logger.info(`Fetching Tokens history page ${page}`);
    tokensHistory = await EtherscanApi.getTokenTx(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

    console.log('End fetch Tokens history', (Date.now() - start) / 1000);
    resolve(tokensHistory);
  });
};

const fetchAllNftsTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 0,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let ntfsHistory;
    Logger.info(`Fetching NFT history page ${page}`);
    ntfsHistory = await EtherscanApi.getErc721TokenTransactions(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

    console.log('End fetch NFT history', (Date.now() - start) / 1000);
    resolve(ntfsHistory);
  });
};

const fetchAllInternalTx = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 0,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
};

interface EvmHistoryItemSpecificData {
  label: string;
  pageTitle: string;
  receiverAddress?: string;
  detailFields: EvmUserHistoryItemDetail[];
  tokenInfo?: EvmSmartContractInfo;
}

const getSpecificData = async (
  chain: EvmChain,
  contractAddress: string,
  broadcaster: string,
  walletAddress: string,
  decodedData: EvmTransactionDecodedData | undefined,
  metadata: EvmSmartContractInfo[],
): Promise<EvmHistoryItemSpecificData> => {
  const details: EvmUserHistoryItemDetail[] = [];

  let result: EvmHistoryItemSpecificData = {
    label: chrome.i18n.getMessage(
      'evm_history_default_smart_contract_operation',
    ),
    pageTitle: 'evm_history_default_smart_contract_operation',
    detailFields: details,
  };
  const tokenMetadata = metadata.find(
    (md) =>
      md.type !== EVMSmartContractType.NATIVE && md.address === contractAddress,
  );

  let name;
  let symbol;

  if (tokenMetadata) {
    name = tokenMetadata.name ?? tokenMetadata.symbol;
    symbol = tokenMetadata.symbol;
  } else {
    let abi = await EtherscanApi.getAbi(chain, contractAddress);

    if (abi) {
      try {
        const contract = new ethers.Contract(contractAddress, JSON.parse(abi));
        [name, symbol] = await Promise.all([
          contract.name(),
          contract.symbol(),
        ]);
      } catch (err) {
        name = EvmFormatUtils.formatAddress(contractAddress);
        symbol = 'No symbol';
      }
    } else {
      name = EvmFormatUtils.formatAddress(contractAddress);
      symbol = 'NO symbol 2';
    }
  }
  console.log(decodedData, metadata, tokenMetadata);
  if (decodedData) {
    switch (decodedData.operationName) {
      case 'safeTransferFrom': {
        const from = decodedData.inputs[0].value.toLowerCase();
        const to = decodedData.inputs[1].value.toLowerCase();
        const formattedFrom = EvmFormatUtils.formatAddress(from);
        const formattedTo = EvmFormatUtils.formatAddress(to);

        if (decodedData.inputs.length === 5) {
          if (to === walletAddress)
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc1155_in',
                [
                  decodedData.inputs[3].value,
                  name,
                  decodedData.inputs[2].value,
                  formattedFrom,
                ],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: walletAddress,
              detailFields: [
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          else {
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc1155_out',
                [
                  decodedData.inputs[3].value,
                  name,
                  decodedData.inputs[2].value,
                  formattedTo,
                ],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: formattedFrom,
              detailFields: [
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          }
        } else if (decodedData.inputs.length === 3) {
          if (to === walletAddress)
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc721_in',
                [name, decodedData.inputs[2].value, formattedFrom],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: formattedTo,
              detailFields: [
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          else {
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc721_out',
                [name, decodedData.inputs[2].value, formattedTo],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: formattedFrom,
              detailFields: [
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          }
        }
        break;
      }
      case 'transfer': {
        const to = decodedData.inputs[0].value.toLowerCase();
        const formattedTo = EvmFormatUtils.formatAddress(to);

        const isTransferIn = to === walletAddress;
        const amount = Number(decodedData.inputs[1].value) / 1000000;

        result = {
          label: chrome.i18n.getMessage(
            isTransferIn
              ? 'evm_history_operation_transfer_in'
              : 'evm_history_operation_transfer_out',
            [
              amount,
              symbol,
              isTransferIn
                ? EvmFormatUtils.formatAddress(broadcaster)
                : formattedTo,
            ],
          ),
          pageTitle: 'evm_transfer',
          receiverAddress: formattedTo,
          detailFields: [
            {
              label: 'popup_html_transfer_amount',
              value: `${amount.toString()} ${symbol}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            },
            {
              label: 'popup_html_evm_transaction_info_from',
              value: broadcaster,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
            {
              label: 'popup_html_evm_transaction_info_to',
              value: to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
        break;
      }
      case 'mintBatch': {
        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mint_batch', [
            decodedData.inputs[1].value.length,
            name,
          ]),
          pageTitle: 'evm_mint_batch',
          detailFields: [],
        };
        break;
      }
      case 'approve': {
        const to = EvmFormatUtils.formatAddress(decodedData.inputs[0].value);
        if (tokenMetadata?.type === EVMSmartContractType.ERC20) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc20',
              [to, decodedData.inputs[1].value / 1000000, symbol],
            ),
            pageTitle: 'evm_approval',
            receiverAddress: to,
            detailFields: [],
          };
        } else if (tokenMetadata?.type === EVMSmartContractType.ERC721) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc721',
              [to, name, decodedData.inputs[1].value],
            ),
            pageTitle: 'evm_approval',
            receiverAddress: to,
            detailFields: [],
          };
        }
        break;
      }
      case 'mintNFTs': {
        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
            name,
            decodedData.inputs[0].value,
          ]),
          pageTitle: 'evm_mint',
          detailFields: [],
        };
        break;
      }
      default: {
        result = {
          label: chrome.i18n.getMessage(
            'evm_history_operation_generic_smart_contract_messages',
            [decodedData.operationName, name],
          ),
          pageTitle: 'evm_broadcast',
          detailFields: [],
        };
        break;
      }
    }
  }

  result.detailFields.push({
    label: 'evm_history_smart_contract',
    value: contractAddress,
    type: EvmUserHistoryItemDetailType.ADDRESS,
  });

  result.tokenInfo = tokenMetadata;
  return result;
};

// const fetchHistory = async (
//   tokenInfo: EvmSmartContractInfo,
//   chain: EvmChain,
//   walletAddress: string,
//   walletSigningKey: SigningKey,
//   firstBlock: number,
//   lastBlock: number,
// ): Promise<EvmTokenHistory> => {
//   Logger.info(`Fetching from ${firstBlock} to ${lastBlock}`);
//   if (tokenInfo.type === EVMSmartContractType.NATIVE) {
//     let response;
//     const events = [];
//     let page = 1;
//     do {
//       response = await EtherscanApi.getHistory(
//         walletAddress,
//         chain,
//         page,
//         0,
//         firstBlock,
//         lastBlock,
//       );
//       console.log(response);
//       page++;
//       for (const e of response.result) {
//         const isTransferIn = e.to.toLowerCase() === walletAddress.toLowerCase();

//         const addressType = await EvmAddressesUtils.getAddressType(
//           isTransferIn ? e.from : e.to,
//           chain,
//         );

//         if (addressType === EvmAddressType.SMART_CONTRACT) {
//           continue;
//         }

//         const event: EvmTokenTransferInHistoryItem = {
//           ...getCommonHistoryItem(e),
//           type: EvmTokenHistoryItemType.TRANSFER_IN,
//           from: e.from,
//           to: e.to,
//           amount: Number(e.value)
//             ? EvmTokensUtils.formatEtherValue(e.value)
//             : '0',
//           timestamp: e.timeStamp * 1000,
//           label: '',
//           isCanceled: Number(e.value) === 0,
//         };

//         event.transactionHash = e.hash;

//         event.label = chrome.i18n.getMessage(
//           event.from.toLowerCase() === walletAddress.toLowerCase()
//             ? 'popup_html_evm_history_transfer_out'
//             : 'popup_html_evm_history_transfer_in',
//           [
//             event.amount,
//             tokenInfo.symbol,
//             EvmFormatUtils.formatAddress(
//               event.from.toLowerCase() === walletAddress.toLowerCase()
//                 ? event.to
//                 : event.from,
//             ),
//           ],
//         );
//         events.push(event);
//       }
//     } while (response.result.length > 0);

//     return { events: events, lastBlock: lastBlock, firstBlock: firstBlock };
//   } else {
//     const provider = EthersUtils.getProvider(chain);
//     const connectedWallet = new Wallet(walletSigningKey, provider);
//     const contract = new ethers.Contract(
//       tokenInfo.address!,
//       Erc20Abi,
//       connectedWallet,
//     );

//     const transferInFilter = contract.filters.Transfer(null, walletAddress);
//     const transferOutFilter = contract.filters.Transfer(walletAddress, null);
//     let eventsIn: any[];
//     let eventsOut: any[];
//     const finalEvents: EvmTokenHistoryItem[] = [];
//     try {
//       eventsIn = await contract.queryFilter(
//         transferInFilter,
//         firstBlock,
//         lastBlock,
//       );
//       for (const e of eventsIn) {
//         //   console.log([
//         //     await provider.lookupAddress(e.args[0]),
//         //     await provider.lookupAddress(e.args[1]),
//         //   ]);
//         const block = await e.getBlock();
//         const event: EvmTokenTransferInHistoryItem = {
//           ...getCommonHistoryItem(e),
//           type: EvmTokenHistoryItemType.TRANSFER_IN,
//           from: e.args[0],
//           to: e.args[1],
//           amount: EvmTokensUtils.formatTokenValue(
//             e.args[2],
//             (tokenInfo as EvmSmartContractInfoErc20).decimals,
//           ),
//           timestamp: block.timestamp * 1000,
//           label: '',
//         };
//         event.label = chrome.i18n.getMessage(
//           'popup_html_evm_history_transfer_in',
//           [
//             event.amount,
//             tokenInfo.symbol,
//             EvmFormatUtils.formatAddress(event.from),
//           ],
//         );
//         finalEvents.push(event);
//       }
//     } catch (err) {
//       Logger.error('Error while parsing transfer in', err);
//     }

//     try {
//       eventsOut = await contract.queryFilter(
//         transferOutFilter,
//         firstBlock,
//         lastBlock,
//       );
//       for (const e of eventsOut) {
//         const block = await e.getBlock();
//         const event: EvmTokenTransferOutHistoryItem = {
//           ...getCommonHistoryItem(e),
//           type: EvmTokenHistoryItemType.TRANSFER_OUT,
//           from: e.args[0],
//           to: e.args[1],
//           amount: EvmTokensUtils.formatTokenValue(
//             e.args[2],
//             (tokenInfo as EvmSmartContractInfoErc20).decimals,
//           ),
//           timestamp: block.timestamp * 1000,
//           label: '',
//         };
//         event.label = chrome.i18n.getMessage(
//           'popup_html_evm_history_transfer_out',
//           [
//             event.amount,
//             tokenInfo.symbol,
//             EvmFormatUtils.formatAddress(event.to),
//           ],
//         );
//         finalEvents.push(event);
//       }
//     } catch (err) {
//       Logger.error('Error while parsing transfer out', err);
//     }

//     const events = finalEvents.sort((a, b) => a.timestamp - b.timestamp);

//     Logger.info(
//       `Fetching from ${firstBlock} to ${firstBlock - LIMIT}: found ${
//         finalEvents.length
//       }`,
//     );

//     return {
//       events: events,
//       lastBlock: firstBlock,
//       firstBlock: firstBlock - LIMIT,
//     };
//   }
// };

// const loadHistory = async (
//   token: NativeAndErc20Token,
//   chain: EvmChain,
//   walletAddress: string,
//   walletSigningKey: SigningKey,
//   sendFeedback?: (progression: {
//     nbBlocks: number;
//     totalBlocks: number;
//   }) => void,
// ): Promise<EvmTokenHistory> => {
//   const localHistory = await getSavedHistory(
//     chain.chainId,
//     walletAddress,
//     token.tokenInfo,
//   );

//   const mainTokenInfo = await EvmTokensUtils.getMainTokenInfo(chain);
//   const mainTokenHistory = await getSavedHistory(
//     chain.chainId,
//     walletAddress,
//     mainTokenInfo,
//   );

//   const canceledTransactions =
//     await EvmTransactionsUtils.getAllCanceledTransactions(chain, walletAddress);

//   const provider = EthersUtils.getProvider(chain);
//   const currentBlockchainBlockNumber = await provider.getBlockNumber();
//   let firstBlock;
//   let lastBlock;

//   const history: EvmTokenHistory = {
//     events: localHistory ? localHistory.events : [],
//     firstBlock: -1,
//     lastBlock: -1,
//   };
//   if (localHistory) {
//     firstBlock = localHistory.lastBlock + 1;
//     lastBlock = firstBlock + LIMIT;

//     history.firstBlock = localHistory.firstBlock;
//     history.lastBlock = currentBlockchainBlockNumber;
//     do {
//       const h = await fetchHistory(
//         token.tokenInfo,
//         chain,
//         walletAddress,
//         walletSigningKey,
//         firstBlock,
//         lastBlock,
//       );
//       history.events = [...history.events, ...h.events];

//       firstBlock = lastBlock + 1;
//       lastBlock = firstBlock + LIMIT;

//       history.events = history.events.sort(
//         (a, b) => Number(b.timestamp) - Number(a.timestamp),
//       );

//       await saveLocalHistory(
//         { ...history },
//         walletAddress,
//         token.tokenInfo,
//         chain,
//       );
//     } while (lastBlock < currentBlockchainBlockNumber);
//   } else {
//     firstBlock = currentBlockchainBlockNumber - LIMIT;
//     lastBlock = currentBlockchainBlockNumber;
//     history.lastBlock = currentBlockchainBlockNumber;
//     do {
//       const h = await fetchHistory(
//         token.tokenInfo,
//         chain,
//         walletAddress,
//         walletSigningKey,
//         token.tokenInfo.type === EVMSmartContractType.NATIVE ? 0 : firstBlock,
//         lastBlock,
//       );
//       history.events = [...history.events, ...h.events];
//       history.firstBlock = h.firstBlock;
//       lastBlock = firstBlock - 1;
//       firstBlock = lastBlock - LIMIT;

//       history.events = history.events.sort(
//         (a, b) => Number(b.timestamp) - Number(a.timestamp),
//       );

//       await saveLocalHistory(
//         { ...history },
//         walletAddress,
//         token.tokenInfo,
//         chain,
//       );
//     } while (
//       history.events.length < MIN_NEW_TRANSACTION &&
//       history.lastBlock > 0
//     );
//   }

//   const finalHistory: EvmTokenHistory = {
//     events: [],
//     firstBlock: history.firstBlock,
//     lastBlock: history.lastBlock,
//   };
//   for (const historyItem of history.events) {
//     const canceledTransaction = canceledTransactions.find(
//       (transaction) => transaction.nonce === historyItem.nonce,
//     );
//     if (token.tokenInfo.type === EVMSmartContractType.NATIVE) {
//       if (historyItem.isCanceled) {
//         historyItem.label = chrome.i18n.getMessage(
//           'popup_html_evm_history_transaction_canceled',
//         );
//         historyItem.cancelDetails = canceledTransaction;
//       }
//     }
//     finalHistory.events.push(historyItem);
//   }

//   if (token.tokenInfo.type === EVMSmartContractType.ERC20) {
//     const tokenCanceledTransactions = canceledTransactions.filter(
//       (tx) =>
//         tx.tokenInfo.coingeckoId === token.tokenInfo.coingeckoId &&
//         tx.tokenInfo.symbol === token.tokenInfo.symbol,
//     );
//     for (const localTxCanceled of tokenCanceledTransactions) {
//       if (
//         history.events
//           .map((event) => event.nonce)
//           .includes(localTxCanceled.nonce)
//       ) {
//         continue;
//       }

//       const canceledTx = mainTokenHistory?.events.find(
//         (tx) => tx.nonce === localTxCanceled.nonce,
//       );

//       if (canceledTx) {
//         finalHistory.events.push({
//           ...canceledTx,
//           label: chrome.i18n.getMessage(
//             'popup_html_evm_history_transaction_canceled_transfer_out_details',
//             [
//               localTxCanceled.amount.toString(),
//               localTxCanceled.tokenInfo.symbol,
//               EvmFormatUtils.formatAddress(localTxCanceled.to),
//             ],
//           ),
//           amount: localTxCanceled.amount,
//           isCanceled: true,
//         } as EvmTokenHistoryItem);
//       } else {
//         //delete tx from canceled tx
//       }
//     }

//     finalHistory.events = finalHistory.events.sort(
//       (a, b) => Number(b.timestamp) - Number(a.timestamp),
//     );
//   }

//   return finalHistory;
// };

// const loadMore = async (
//   chain: EvmChain,
//   walletAddress: string,
//   walletSigningKey: SigningKey,
//   history: EvmUserHistory,
//   sendFeedback?: (progression: {
//     nbBlocks: number;
//     totalBlocks: number;
//   }) => void,
// ) => {
//   const initialBlock = history.firstBlock;
//   let blockChecked = 0;

//   let firstBlock = history.firstBlock - 1 - LIMIT;
//   let lastBlock = history.firstBlock - 1;
//   let h: EvmUserHistory;
//   do {
//     h = await fetchHistory(
//       token.tokenInfo,
//       chain,
//       walletAddress,
//       walletSigningKey,
//       firstBlock,
//       lastBlock,
//     );
//     history.events = [...history.events, ...h.events];
//     history.firstBlock = h.firstBlock;
//     lastBlock = firstBlock - 1;
//     firstBlock = lastBlock - LIMIT;
//     blockChecked += LIMIT;
//     if (sendFeedback)
//       sendFeedback({ totalBlocks: initialBlock, nbBlocks: blockChecked });
//   } while (h.events.length < MIN_NEW_TRANSACTION && history.firstBlock > 0);

//   history.events = history.events.sort(
//     (a, b) => Number(b.timestamp) - Number(a.timestamp),
//   );

//   await saveLocalHistory({ ...history }, walletAddress, token.tokenInfo, chain);
//   return history;
// };

const getCommonHistoryItem = (e: any) => {
  return {
    blockNumber: e.blockNumber,
    transactionHash: e.hash,
    transactionIndex: e.transactionIndex,
    nonce: Number(e.nonce),
    timestamp: e.timeStamp * 1000,
  };
};

// const getSavedHistory = async (
//   chain: string,
//   walletAddress: string,
// ): Promise<EvmUserHistory | undefined> => {
//   let localHistory: EvmLocalHistory =
//     await LocalStorageUtils.getValueFromLocalStorage(
//       LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
//     );
//   let chainHistory;
//   let userHistory;

//   if (localHistory) {
//     chainHistory = localHistory[chain];
//     if (chainHistory) {
//       userHistory = chainHistory[walletAddress];
//     }
//   }
//   return userHistory;
// };

// const saveLocalHistory = async (
//   history: EvmUserHistory,
//   walletAddress: string,
//   chain: EvmChain,
// ) => {
//   let localHistory: EvmLocalHistory =
//     await LocalStorageUtils.getValueFromLocalStorage(
//       LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
//     );

//   if (!localHistory) {
//     localHistory = {};
//   }
//   if (!localHistory[chain.chainId]) {
//     localHistory[chain.chainId] = {};
//   }
//   localHistory[chain.chainId][walletAddress] = history;
//   await LocalStorageUtils.saveValueInLocalStorage(
//     LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
//     localHistory,
//   );
// };

// const fetchFullMainTokenHistory = async (
//   chain: EvmChain,
//   tokenInfo: EvmSmartContractInfo,
//   walletAddress: string,
//   walletSigningKey: SigningKey,
// ) => {
//   const localHistory = await getSavedHistory(
//     chain.chainId,
//     walletAddress,
//     tokenInfo,
//   );

//   const firstBlock = localHistory ? localHistory.lastBlock : 0;

//   const provider = EthersUtils.getProvider(chain);
//   const currentBlockchainBlockNumber = await provider.getBlockNumber();
//   const history = await fetchHistory(
//     tokenInfo,
//     chain,
//     walletAddress,
//     walletSigningKey,
//     firstBlock,
//     currentBlockchainBlockNumber,
//   );

//   let newLocalHistory;
//   if (localHistory) {
//     newLocalHistory = {
//       firstBlock: 0,
//       lastBlock: history.lastBlock,
//       events: [...history.events, ...localHistory.events],
//     };
//   } else {
//     newLocalHistory = history;
//   }
//   await saveLocalHistory(newLocalHistory, walletAddress, tokenInfo, chain);
// };

export const EvmTokensHistoryUtils = {
  // fetchHistory,
  // getSavedHistory,
  // saveLocalHistory,
  // loadHistory,
  // loadMore,
  // fetchFullMainTokenHistory,
  fetchHistory,
};
