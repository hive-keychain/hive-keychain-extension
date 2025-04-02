import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import {
  EvmLocalHistory,
  EvmTokenHistory,
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers, SigningKey, Wallet } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const MIN_NEW_TRANSACTION = 1;
const LIMIT = 20000;

const fetchHistory = async (
  tokenInfo: EvmSmartContractInfo,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  firstBlock: number,
  lastBlock: number,
): Promise<EvmTokenHistory> => {
  Logger.info(`Fetching from ${firstBlock} to ${lastBlock}`);
  if (tokenInfo.type === EVMSmartContractType.NATIVE) {
    let response;
    const events = [];
    let page = 1;
    do {
      response = await EtherscanApi.getHistory(
        walletAddress,
        chain,
        page,
        0,
        firstBlock,
        lastBlock,
      );
      page++;
      for (const e of response.result) {
        const isTransferIn = e.to.toLowerCase() === walletAddress.toLowerCase();

        const addressType = await EvmAddressesUtils.getAddressType(
          isTransferIn ? e.from : e.to,
          chain,
        );

        if (addressType === EvmAddressType.SMART_CONTRACT) {
          continue;
        }

        const event: EvmTokenTransferInHistoryItem = {
          ...getCommonHistoryItem(e),
          type: EvmTokenHistoryItemType.TRANSFER_IN,
          from: e.from,
          to: e.to,
          amount: Number(e.value)
            ? EvmTokensUtils.formatEtherValue(e.value)
            : '0',
          timestamp: e.timeStamp * 1000,
          label: '',
          isCanceled: Number(e.value) === 0,
        };

        event.transactionHash = e.hash;

        event.label = chrome.i18n.getMessage(
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? 'popup_html_evm_history_transfer_out'
            : 'popup_html_evm_history_transfer_in',
          [
            event.amount,
            tokenInfo.symbol,
            EvmFormatUtils.formatAddress(
              event.from.toLowerCase() === walletAddress.toLowerCase()
                ? event.to
                : event.from,
            ),
          ],
        );
        events.push(event);
      }
    } while (response.result.length > 0);

    return { events: events, lastBlock: lastBlock, firstBlock: firstBlock };
  } else {
    const provider = EthersUtils.getProvider(chain);
    const connectedWallet = new Wallet(walletSigningKey, provider);
    const contract = new ethers.Contract(
      tokenInfo.address!,
      Erc20Abi,
      connectedWallet,
    );

    const transferInFilter = contract.filters.Transfer(null, walletAddress);
    const transferOutFilter = contract.filters.Transfer(walletAddress, null);
    let eventsIn: any[];
    let eventsOut: any[];
    const finalEvents: EvmTokenHistoryItem[] = [];
    try {
      eventsIn = await contract.queryFilter(
        transferInFilter,
        firstBlock,
        lastBlock,
      );
      for (const e of eventsIn) {
        //   console.log([
        //     await provider.lookupAddress(e.args[0]),
        //     await provider.lookupAddress(e.args[1]),
        //   ]);
        const block = await e.getBlock();
        const event: EvmTokenTransferInHistoryItem = {
          ...getCommonHistoryItem(e),
          type: EvmTokenHistoryItemType.TRANSFER_IN,
          from: e.args[0],
          to: e.args[1],
          amount: EvmTokensUtils.formatTokenValue(
            e.args[2],
            (tokenInfo as EvmSmartContractInfoErc20).decimals,
          ),
          timestamp: block.timestamp * 1000,
          label: '',
        };
        event.label = chrome.i18n.getMessage(
          'popup_html_evm_history_transfer_in',
          [
            event.amount,
            tokenInfo.symbol,
            EvmFormatUtils.formatAddress(event.from),
          ],
        );
        finalEvents.push(event);
      }
    } catch (err) {
      Logger.error('Error while parsing transfer in', err);
    }

    try {
      eventsOut = await contract.queryFilter(
        transferOutFilter,
        firstBlock,
        lastBlock,
      );
      for (const e of eventsOut) {
        const block = await e.getBlock();
        const event: EvmTokenTransferOutHistoryItem = {
          ...getCommonHistoryItem(e),
          type: EvmTokenHistoryItemType.TRANSFER_OUT,
          from: e.args[0],
          to: e.args[1],
          amount: EvmTokensUtils.formatTokenValue(
            e.args[2],
            (tokenInfo as EvmSmartContractInfoErc20).decimals,
          ),
          timestamp: block.timestamp * 1000,
          label: '',
        };
        event.label = chrome.i18n.getMessage(
          'popup_html_evm_history_transfer_out',
          [
            event.amount,
            tokenInfo.symbol,
            EvmFormatUtils.formatAddress(event.to),
          ],
        );
        finalEvents.push(event);
      }
    } catch (err) {
      Logger.error('Error while parsing transfer out', err);
    }

    const events = finalEvents.sort((a, b) => a.timestamp - b.timestamp);

    Logger.info(
      `Fetching from ${firstBlock} to ${firstBlock - LIMIT}: found ${
        finalEvents.length
      }`,
    );

    return {
      events: events,
      lastBlock: firstBlock,
      firstBlock: firstBlock - LIMIT,
    };
  }
};

const loadHistory = async (
  token: NativeAndErc20Token,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  sendFeedback?: (progression: {
    nbBlocks: number;
    totalBlocks: number;
  }) => void,
): Promise<EvmTokenHistory> => {
  const localHistory = await getSavedHistory(
    chain.chainId,
    walletAddress,
    token.tokenInfo,
  );

  const mainTokenInfo = await EvmTokensUtils.getMainTokenInfo(chain);
  const mainTokenHistory = await getSavedHistory(
    chain.chainId,
    walletAddress,
    mainTokenInfo,
  );

  const canceledTransactions =
    await EvmTransactionsUtils.getAllCanceledTransactions(chain, walletAddress);

  const provider = EthersUtils.getProvider(chain);
  const currentBlockchainBlockNumber = await provider.getBlockNumber();
  let firstBlock;
  let lastBlock;

  const history: EvmTokenHistory = {
    events: localHistory ? localHistory.events : [],
    firstBlock: -1,
    lastBlock: -1,
  };
  if (localHistory) {
    firstBlock = localHistory.lastBlock + 1;
    lastBlock = firstBlock + LIMIT;

    history.firstBlock = localHistory.firstBlock;
    history.lastBlock = currentBlockchainBlockNumber;
    do {
      const h = await fetchHistory(
        token.tokenInfo,
        chain,
        walletAddress,
        walletSigningKey,
        firstBlock,
        lastBlock,
      );
      history.events = [...history.events, ...h.events];

      firstBlock = lastBlock + 1;
      lastBlock = firstBlock + LIMIT;

      history.events = history.events.sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );

      await saveLocalHistory(
        { ...history },
        walletAddress,
        token.tokenInfo,
        chain,
      );
    } while (lastBlock < currentBlockchainBlockNumber);
  } else {
    firstBlock = currentBlockchainBlockNumber - LIMIT;
    lastBlock = currentBlockchainBlockNumber;
    history.lastBlock = currentBlockchainBlockNumber;
    do {
      const h = await fetchHistory(
        token.tokenInfo,
        chain,
        walletAddress,
        walletSigningKey,
        token.tokenInfo.type === EVMSmartContractType.NATIVE ? 0 : firstBlock,
        lastBlock,
      );
      history.events = [...history.events, ...h.events];
      history.firstBlock = h.firstBlock;
      lastBlock = firstBlock - 1;
      firstBlock = lastBlock - LIMIT;

      history.events = history.events.sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );

      await saveLocalHistory(
        { ...history },
        walletAddress,
        token.tokenInfo,
        chain,
      );
    } while (
      history.events.length < MIN_NEW_TRANSACTION &&
      history.lastBlock > 0
    );
  }

  const finalHistory: EvmTokenHistory = {
    events: [],
    firstBlock: history.firstBlock,
    lastBlock: history.lastBlock,
  };
  for (const historyItem of history.events) {
    const canceledTransaction = canceledTransactions.find(
      (transaction) => transaction.nonce === historyItem.nonce,
    );
    if (token.tokenInfo.type === EVMSmartContractType.NATIVE) {
      if (historyItem.isCanceled) {
        historyItem.label = chrome.i18n.getMessage(
          'popup_html_evm_history_transaction_canceled',
        );
        historyItem.cancelDetails = canceledTransaction;
      }
    }
    finalHistory.events.push(historyItem);
  }

  if (token.tokenInfo.type === EVMSmartContractType.ERC20) {
    const tokenCanceledTransactions = canceledTransactions.filter(
      (tx) =>
        tx.tokenInfo.coingeckoId === token.tokenInfo.coingeckoId &&
        tx.tokenInfo.symbol === token.tokenInfo.symbol,
    );
    for (const localTxCanceled of tokenCanceledTransactions) {
      if (
        history.events
          .map((event) => event.nonce)
          .includes(localTxCanceled.nonce)
      ) {
        continue;
      }

      const canceledTx = mainTokenHistory?.events.find(
        (tx) => tx.nonce === localTxCanceled.nonce,
      );

      if (canceledTx) {
        finalHistory.events.push({
          ...canceledTx,
          label: chrome.i18n.getMessage(
            'popup_html_evm_history_transaction_canceled_transfer_out_details',
            [
              localTxCanceled.amount.toString(),
              localTxCanceled.tokenInfo.symbol,
              EvmFormatUtils.formatAddress(localTxCanceled.to),
            ],
          ),
          amount: localTxCanceled.amount,
          isCanceled: true,
        } as EvmTokenHistoryItem);
      } else {
        //delete tx from canceled tx
      }
    }

    finalHistory.events = finalHistory.events.sort(
      (a, b) => Number(b.timestamp) - Number(a.timestamp),
    );
  }

  return finalHistory;
};

const loadMore = async (
  token: NativeAndErc20Token,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  history: EvmTokenHistory,
  sendFeedback?: (progression: {
    nbBlocks: number;
    totalBlocks: number;
  }) => void,
) => {
  const initialBlock = history.firstBlock;
  let blockChecked = 0;

  let firstBlock = history.firstBlock - 1 - LIMIT;
  let lastBlock = history.firstBlock - 1;
  let h: EvmTokenHistory;
  do {
    h = await fetchHistory(
      token.tokenInfo,
      chain,
      walletAddress,
      walletSigningKey,
      firstBlock,
      lastBlock,
    );
    history.events = [...history.events, ...h.events];
    history.firstBlock = h.firstBlock;
    lastBlock = firstBlock - 1;
    firstBlock = lastBlock - LIMIT;
    blockChecked += LIMIT;
    if (sendFeedback)
      sendFeedback({ totalBlocks: initialBlock, nbBlocks: blockChecked });
  } while (h.events.length < MIN_NEW_TRANSACTION && history.firstBlock > 0);

  history.events = history.events.sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  await saveLocalHistory({ ...history }, walletAddress, token.tokenInfo, chain);
  return history;
};

const getCommonHistoryItem = (e: any) => {
  return {
    address: e.address,
    blockNumber: e.blockNumber,
    index: e.index,
    transactionHash: e.transactionHash,
    transactionIndex: e.transactionIndex,
    nonce: Number(e.nonce),
  };
};

const getSavedHistory = async (
  chain: string,
  walletAddress: string,
  tokenInfo: EvmSmartContractInfo,
): Promise<EvmTokenHistory | undefined> => {
  let localHistory: EvmLocalHistory =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
    );
  let chainHistory;
  let userHistory;
  let tokenHistory;

  if (localHistory) {
    chainHistory = localHistory[chain];
    if (chainHistory) {
      userHistory = chainHistory[walletAddress];
      if (userHistory) {
        tokenHistory =
          userHistory[`${tokenInfo.symbol}-${tokenInfo.coingeckoId}`];
      }
    }
  }
  return tokenHistory;
};

const saveLocalHistory = async (
  history: EvmTokenHistory,
  address: string,
  tokenInfo: EvmSmartContractInfo,
  chain: EvmChain,
) => {
  let localHistory: EvmLocalHistory =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
    );

  if (!localHistory) {
    localHistory = {};
  }
  if (!localHistory[chain.chainId]) {
    localHistory[chain.chainId] = {};
  }
  if (!localHistory[chain.chainId][address]) {
    localHistory[chain.chainId][address] = {};
  }
  localHistory[chain.chainId][address][
    `${tokenInfo.symbol}-${tokenInfo.coingeckoId}`
  ] = history;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
    localHistory,
  );
};

const fetchFullMainTokenHistory = async (
  chain: EvmChain,
  tokenInfo: EvmSmartContractInfo,
  walletAddress: string,
  walletSigningKey: SigningKey,
) => {
  const localHistory = await getSavedHistory(
    chain.chainId,
    walletAddress,
    tokenInfo,
  );

  const firstBlock = localHistory ? localHistory.lastBlock : 0;

  const provider = EthersUtils.getProvider(chain);
  const currentBlockchainBlockNumber = await provider.getBlockNumber();
  const history = await fetchHistory(
    tokenInfo,
    chain,
    walletAddress,
    walletSigningKey,
    firstBlock,
    currentBlockchainBlockNumber,
  );

  let newLocalHistory;
  if (localHistory) {
    newLocalHistory = {
      firstBlock: 0,
      lastBlock: history.lastBlock,
      events: [...history.events, ...localHistory.events],
    };
  } else {
    newLocalHistory = history;
  }
  await saveLocalHistory(newLocalHistory, walletAddress, tokenInfo, chain);
};

export const EvmTokensHistoryUtils = {
  fetchHistory,
  getSavedHistory,
  saveLocalHistory,
  loadHistory,
  loadMore,
  fetchFullMainTokenHistory,
};
