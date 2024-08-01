import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmTokenHistory,
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { SigningKey, Wallet, ethers } from 'ethers';
import Logger from 'src/utils/logger.utils';

const MIN_NEW_TRANSACTION = 1;
const LIMIT = 20000;

const fetchHistory = async (
  token: EVMToken,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  lastBlock: number,
): Promise<EvmTokenHistory> => {
  if (token.tokenInfo.type === EVMTokenType.NATIVE) {
    const response = await EtherscanApi.getHistory(walletAddress, chain, 1, 0);
    const events = [];
    for (const e of response.result) {
      console.log(e);

      const isTransferIn = e.to.toLowerCase() === walletAddress.toLowerCase();

      if (
        !(await EvmWalletUtils.isWalletAddress(
          isTransferIn ? e.from : e.to,
          chain,
        ))
      ) {
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

      event.details = `${event.from.toLowerCase()} === ${walletAddress.toLowerCase()}`;

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

    return { events: events, lastBlock: -1 };
  } else {
    const provider = EthersUtils.getProvider(chain);
    const connectedWallet = new Wallet(walletSigningKey, provider);
    const contract = new ethers.Contract(
      token.tokenInfo.address!,
      Erc20Abi,
      connectedWallet,
    );
    let iface = new ethers.Interface(Erc20Abi);

    const transferInFilter = contract.filters.Transfer(null, walletAddress);
    const transferOutFilter = contract.filters.Transfer(walletAddress, null);
    let eventsIn: any[];
    let eventsOut: any[];
    const finalEvents: EvmTokenHistoryItem[] = [];
    try {
      eventsIn = await contract.queryFilter(
        transferInFilter,
        lastBlock - LIMIT,
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
        lastBlock - LIMIT,
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
      `Fetching from ${lastBlock} to ${lastBlock - LIMIT}: found ${
        finalEvents.length
      }`,
    );

    return {
      events: events,
      lastBlock: lastBlock - LIMIT,
    };
  }
};

const getHistory = async (
  token: EVMToken,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  sendFeedback?: (progression: {
    nbBlocks: number;
    totalBlocks: number;
  }) => void,
  lastBlock?: number,
): Promise<EvmTokenHistory> => {
  const provider = EthersUtils.getProvider(chain);
  const currentBlockchainBlockNumber = await provider.getBlockNumber();
  const lastBlockNumber = lastBlock ?? currentBlockchainBlockNumber;
  const history: EvmTokenHistory = { events: [], lastBlock: lastBlockNumber };
  do {
    const h = await fetchHistory(
      token,
      chain,
      walletAddress,
      walletSigningKey,
      history.lastBlock,
    );
    history.events = [...history.events, ...h.events];
    history.lastBlock = h.lastBlock;
    if (sendFeedback)
      sendFeedback({
        nbBlocks: currentBlockchainBlockNumber - h.lastBlock,
        totalBlocks: currentBlockchainBlockNumber,
      });
  } while (
    history.events.length < MIN_NEW_TRANSACTION &&
    history.lastBlock > 0
  );
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

export const EvmTokensHistoryUtils = {
  getHistory,
  fetchHistory,
};
