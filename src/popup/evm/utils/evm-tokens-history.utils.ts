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

const RESULTS_PER_PAGE = 100;

let cachedData: any[] = [];

const fetchHistory = async (
  walletAddress: string,
  chain: EvmChain,
  history?: EvmUserHistory,
) => {
  const start = Date.now();

  if (!history) {
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

  console.log({ promisesResult });

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
  for (const listKey of Object.keys(promisesResult)) {
    for (const event of promisesResult[listKey]) {
      if (!eventsHashes.includes(event.hash)) {
        if (Number(event.timeStamp) >= latestDate) {
          events.push(event);
          eventsHashes.push(event.hash);
        } else {
          cachedData.push(event);
        }
      } else duplicates++;
    }
  }

  console.log(`${duplicates} duplicates`);

  const tmpCachedData = [];
  for (const data of cachedData) {
    if (!eventsHashes.includes(data.hash)) {
      if (data.timeStamp >= latestDate) {
        events.push(data);
        eventsHashes.push(data.hash);
      } else {
        tmpCachedData.push(data);
      }
    }
  }
  cachedData = tmpCachedData;

  events = events.sort((a, b) => b.timeStamp - a.timeStamp);

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
  for (const event of events) {
    // console.log(event.hash, event);
    // if (
    //   event.hash ===
    //   '0x7db1bdc3eb9f17951423e10321ef848879e0d046edd99bbc99ffff81771d601e'
    // ) {
    //   console.log('----------------------');
    //   console.log(
    //     event,
    //     tokenMetadata.find((t) => (t as any).address === event.to),
    //   );
    //   console.log('----------------------');
    // }

    if (event.txreceipt_status === '0') {
      Logger.warn(`Transaction ${event.hash} ignored because failed`);
      continue;
    }
    let historyItem = { ...getCommonHistoryItem(event) } as EvmUserHistoryItem;
    // parse event
    if (
      event.contractAddress.length > 0 &&
      (!event.to || event.to.length === 0)
    ) {
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
      event.to &&
      event.to.length > 0 &&
      event.input.replace('0x', '').length > 0
    ) {
      // Smart contract (parse transaction)
      try {
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
          event.contractAddress.length > 0
            ? event.contractAddress.toLowerCase()
            : event.to.toLowerCase(),
          event.from.toLowerCase(),
          walletAddress.toLowerCase(),
          decodedData,
          tokenMetadata,
          event,
        );

        historyItem.label = specificData.label;
        historyItem.pageTitle = specificData.pageTitle;
        historyItem.receiverAddress = specificData.receiverAddress;
        historyItem.detailFields = specificData.detailFields;
        historyItem.tokenInfo = specificData.tokenInfo;
      } catch (err) {
        console.log(err);
        continue;
      }
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

      const addressDetails = await EvmAddressesUtils.getAddressDetails(
        event.from.toLowerCase() === walletAddress.toLowerCase()
          ? event.to
          : event.from,
        chain.chainId,
      );

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
            addressDetails.label ?? addressDetails.formattedAddress,
          ],
        ),
        detailFields: details,
        pageTitle: 'popup_html_transfer_funds',
        tokenInfo: mainToken,
      } as EvmTokenTransferInHistoryItem | EvmTokenTransferOutHistoryItem;
    } else {
      Logger.error(`${event.hash} match no condition`);
      // console.log(historyItem);
      const defaultLabel =
        event.from.toLowerCase() === walletAddress.toLowerCase()
          ? 'evm_history_default_out_smart_contract_operation'
          : 'evm_history_default_in_smart_contract_operation';

      historyItem.label = chrome.i18n.getMessage(defaultLabel);
      historyItem.pageTitle = defaultLabel;
    }
    history.events.push(historyItem);
  }
  Logger.info('End parsing ' + (Date.now() - start) / 1000);
  // console.log({ history });

  // console.log({ events, cachedData });
  history.fullyFetch = fetchFinished;
  return history;
};

// TODO change return
const fetchMainHistory = (
  walletAddress: string,
  chain: EvmChain,
  page: number = 1,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    let mainHistoryResponse;
    Logger.info(`Fetching  page ${page}`);
    mainHistoryResponse = await EtherscanApi.getHistory(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

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
    tokensHistory = await EtherscanApi.getTokenTx(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

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
    ntfsHistory = await EtherscanApi.getErc721TokenTransactions(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

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
    internalsHistory = await EtherscanApi.getInternalsTx(
      walletAddress,
      chain,
      page,
      RESULTS_PER_PAGE,
    );

    Logger.info('End fetch internals history ' + (Date.now() - start) / 1000);
    resolve(internalsHistory);
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
  event: any,
): Promise<EvmHistoryItemSpecificData> => {
  const details: EvmUserHistoryItemDetail[] = [];

  const defaultLabel =
    broadcaster.toLowerCase() === walletAddress.toLowerCase()
      ? 'evm_history_default_out_smart_contract_operation'
      : 'evm_history_default_in_smart_contract_operation';

  let result: EvmHistoryItemSpecificData = {
    label: chrome.i18n.getMessage(defaultLabel),
    pageTitle: defaultLabel,
    detailFields: details,
  };
  const tokenMetadata = metadata.find(
    (md) =>
      md.type !== EVMSmartContractType.NATIVE &&
      md.address.toLowerCase() === contractAddress.toLowerCase(),
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

  // console.log(event, decodedData?.operationName, decodedData, tokenMetadata);
  if (decodedData) {
    switch (decodedData.operationName) {
      case 'safeTransferFrom': {
        const from = decodedData.inputs[0].value.toLowerCase();
        const to = decodedData.inputs[1].value.toLowerCase();

        const fromDetails = await EvmAddressesUtils.getAddressDetails(
          from,
          chain.chainId,
        );
        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        if (decodedData.inputs.length === 5) {
          if (to === walletAddress)
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc1155_in',
                [
                  decodedData.inputs[3].value,
                  name,
                  decodedData.inputs[2].value,
                  fromDetails.label ?? fromDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: walletAddress,
              detailFields: [
                {
                  label: `${decodedData.inputs[3].value} ${name}#${Number(
                    decodedData.inputs[2].value,
                  )}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
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
                  toDetails.label ?? toDetails.formattedAddress,
                  ,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${decodedData.inputs[3].value} ${name}#${Number(
                    decodedData.inputs[2].value,
                  )}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
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
                [
                  name,
                  decodedData.inputs[2].value,
                  fromDetails.label ?? fromDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${name}#${Number(decodedData.inputs[2].value)}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
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
                [
                  name,
                  decodedData.inputs[2].value,
                  toDetails.label ?? toDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${name}#${Number(decodedData.inputs[2].value)}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
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
        // console.log(
        //   decodedData?.operationName,
        //   decodedData,
        //   tokenMetadata,
        //   event,
        // );
        const to = decodedData.inputs[0].value.toLowerCase();

        const isTransferIn = to === walletAddress;
        const amount = Number(decodedData.inputs[1].value) / 1000000;

        const broadcasterDetails = await EvmAddressesUtils.getAddressDetails(
          broadcaster,
          chain.chainId,
        );
        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        result = {
          label: chrome.i18n.getMessage(
            isTransferIn
              ? 'evm_history_operation_transfer_in'
              : 'evm_history_operation_transfer_out',
            [
              amount,
              symbol,
              isTransferIn
                ? broadcasterDetails.label ??
                  broadcasterDetails.formattedAddress
                : toDetails.label ?? toDetails.formattedAddress,
            ],
          ),
          pageTitle: 'evm_transfer',
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
      case 'transferFrom': {
        const from = decodedData.inputs[0].value.toLowerCase();
        const to = decodedData.inputs[1].value.toLowerCase();

        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );
        const fromDetails = await EvmAddressesUtils.getAddressDetails(
          from,
          chain.chainId,
        );

        const isTransferIn = to === walletAddress;
        const amount = Number(decodedData.inputs[2].value) / 1000000;

        result = {
          label: chrome.i18n.getMessage(
            isTransferIn
              ? 'evm_history_operation_transfer_in'
              : 'evm_history_operation_transfer_out',
            [
              amount,
              symbol,
              isTransferIn
                ? fromDetails.label ?? fromDetails.formattedAddress
                : toDetails.label ?? toDetails.formattedAddress,
            ],
          ),
          pageTitle: 'evm_transfer',
          detailFields: [
            {
              label: 'popup_html_transfer_amount',
              value: `${amount.toString()} ${symbol}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            },
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
        break;
      }
      case 'approve': {
        const to = decodedData.inputs[0].value;

        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        const amount = Number(decodedData.inputs[1].value) / 1000000;
        if (tokenMetadata?.type === EVMSmartContractType.ERC20) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc20',
              [toDetails.label ?? toDetails.formattedAddress, amount, symbol],
            ),
            pageTitle: 'evm_approval',
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
        } else if (tokenMetadata?.type === EVMSmartContractType.ERC721) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc721',
              [
                toDetails.label ?? toDetails.formattedAddress,
                name,
                decodedData.inputs[1].value,
              ],
            ),
            pageTitle: 'evm_approval',
            detailFields: [
              {
                label: `${name}#${Number(decodedData.inputs[1].value)}`,
                value: decodedData.inputs[1].value,
                type: EvmUserHistoryItemDetailType.IMAGE,
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
        }
        break;
      }
      case 'mintBatch': {
        const details = [];
        for (let i = 0; i < decodedData.inputs[1].value.length; i++) {
          details.push({
            label: `${decodedData.inputs[2].value[i]} ${name}#${Number(
              decodedData.inputs[1].value[i],
            )}`,
            value: decodedData.inputs[1].value[i],
            type: EvmUserHistoryItemDetailType.IMAGE,
          });
        }

        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mint_batch', [
            decodedData.inputs[1].value.length,
            name,
          ]),
          pageTitle: 'evm_mint_batch',
          detailFields: [
            ...details,
            {
              label: 'popup_html_evm_transaction_info_from',
              value: broadcaster,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
        break;
      }

      case 'mintNFTs': {
        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
            name,
            decodedData.inputs[0].value,
          ]),
          pageTitle: 'evm_mint',
          detailFields: [
            {
              label: `${name}#${Number(decodedData.inputs[0].value)}`,
              value: decodedData.inputs[0].value,
              type: EvmUserHistoryItemDetailType.IMAGE,
            },
          ],
        };
        break;
      }
      default: {
        result = {
          label: chrome.i18n.getMessage(
            'evm_history_operation_generic_smart_contract_messages',
            [
              decodedData.operationName,
              name,
              EvmFormatUtils.formatAddress(contractAddress),
            ],
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

const getCommonHistoryItem = (e: any) => {
  return {
    blockNumber: e.blockNumber,
    transactionHash: e.hash,
    transactionIndex: e.transactionIndex,
    nonce: Number(e.nonce),
    timestamp: e.timeStamp * 1000,
    type: EvmUserHistoryItemType.BASE_TRANSACTION,
  };
};

export const EvmTokensHistoryUtils = {
  // fetchHistory,
  // getSavedHistory,
  // saveLocalHistory,
  // loadHistory,
  // loadMore,
  // fetchFullMainTokenHistory,
  fetchHistory,
};
