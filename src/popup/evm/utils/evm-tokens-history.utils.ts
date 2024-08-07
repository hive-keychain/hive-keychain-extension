import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmLocalHistory,
  EvmTokenHistory,
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmTokenInfoShort,
  EVMTokenType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAddressType } from '@popup/evm/interfaces/wallet.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers, SigningKey, Wallet } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const MIN_NEW_TRANSACTION = 1;
const LIMIT = 20000;

const fetchHistory = async (
  token: EVMToken,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  firstBlock: number,
  lastBlock: number,
): Promise<EvmTokenHistory> => {
  walletAddress = '0xB06Ea6E48A317Db352fA161c8140e8e0791EbB58';
  Logger.info(`Fetching from ${firstBlock} to ${lastBlock}`);
  if (token.tokenInfo.type === EVMTokenType.NATIVE) {
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
          amount: EvmTokensUtils.formatEtherValue(e.value),
          timestamp: new Date(e.timeStamp * 1000),
          label: '',
        };

        event.transactionHash = e.hash;

        event.label = chrome.i18n.getMessage(
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? 'popup_html_evm_history_transfer_out'
            : 'popup_html_evm_history_transfer_in',
          [
            event.amount,
            token.tokenInfo.symbol,
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
      token.tokenInfo.address!,
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
            token.tokenInfo.decimals,
          ),
          timestamp: new Date(block.timestamp * 1000),
          label: '',
        };
        event.label = chrome.i18n.getMessage(
          'popup_html_evm_history_transfer_in',
          [
            event.amount,
            token.tokenInfo.symbol,
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
            token.tokenInfo.decimals,
          ),
          timestamp: new Date(block.timestamp * 1000),
          label: '',
        };
        event.label = chrome.i18n.getMessage(
          'popup_html_evm_history_transfer_out',
          [
            event.amount,
            token.tokenInfo.symbol,
            EvmFormatUtils.formatAddress(event.to),
          ],
        );
        finalEvents.push(event);
      }
    } catch (err) {
      Logger.error('Error while parsing transfer out', err);
    }

    const events = finalEvents.sort(
      (a, b) => a.timestamp.getMilliseconds() - b.timestamp.getMilliseconds(),
    );

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
  token: EVMToken,
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
        token,
        chain,
        walletAddress,
        walletSigningKey,
        firstBlock,
        lastBlock,
      );
      history.events = [...history.events, ...h.events];

      firstBlock = lastBlock + 1;
      lastBlock = firstBlock + LIMIT;
    } while (lastBlock < currentBlockchainBlockNumber);
  } else {
    firstBlock = currentBlockchainBlockNumber - LIMIT;
    lastBlock = currentBlockchainBlockNumber;
    history.lastBlock = currentBlockchainBlockNumber;
    do {
      const h = await fetchHistory(
        token,
        chain,
        walletAddress,
        walletSigningKey,
        token.tokenInfo.type === EVMTokenType.NATIVE ? 0 : firstBlock,
        lastBlock,
      );
      history.events = [...history.events, ...h.events];
      history.firstBlock = h.firstBlock;
      lastBlock = firstBlock - 1;
      firstBlock = lastBlock - LIMIT;
    } while (
      history.events.length < MIN_NEW_TRANSACTION &&
      history.lastBlock > 0
    );
  }
  history.events = history.events.sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  await saveLocalHistory({ ...history }, walletAddress, token.tokenInfo, chain);
  return history;
};

const loadMore = async (
  token: EVMToken,
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
      token,
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
  };
};

const getSavedHistory = async (
  chain: string,
  walletAddress: string,
  tokenInfo: EvmTokenInfoShort,
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
  tokenInfo: EvmTokenInfoShort,
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

export const EvmTokensHistoryUtils = {
  fetchHistory,
  getSavedHistory,
  saveLocalHistory,
  loadHistory,
  loadMore,
};
