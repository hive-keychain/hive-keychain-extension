import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmTokenHistory,
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
  EvmTokenTransferInHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { SigningKey, Wallet, ethers } from 'ethers';

const fetchHistory = async (
  token: EVMToken,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  lastBlock: number,
): Promise<EvmTokenHistory> => {
  const limit = 1000000;
  const provider = EthersUtils.getProvider(chain.network);
  const connectedWallet = new Wallet(walletSigningKey, provider);

  if (token.tokenInfo.type === EVMTokenType.NATIVE) {
    // TODO
    console.log('skip native');
    return { events: [], lastBlock: -1 };
  } else {
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
    eventsIn = await contract.queryFilter(
      transferInFilter,
      lastBlock - limit,
      lastBlock,
    );
    eventsOut = await contract.queryFilter(transferOutFilter);
    // const events = [...eventsIn, ...eventsOut].sort(
    //   (a, b) => b.timestamp - a.timestamp,
    // );

    const finalEvents: EvmTokenHistoryItem[] = [];
    for (const e of eventsIn) {
      //   console.log([
      //     await provider.lookupAddress(e.args[0]),
      //     await provider.lookupAddress(e.args[1]),
      //   ]);

      const event: EvmTokenTransferInHistoryItem = {
        ...getCommonHistoryItem(e),
        type: EvmTokenHistoryItemType.TRANSFER_IN,
        from: e.args[0],
        to: e.args[1],
        amount: EvmTokensUtils.formatTokenValue(
          e.args[2],
          token.tokenInfo.decimals,
        ),
      };
      finalEvents.push(event);
    }
    for (const e of eventsOut) {
      const event = {
        ...getCommonHistoryItem(e),
        type: EvmTokenHistoryItemType.TRANSFER_OUT,
        from: e.args[0],
        to: e.args[1],
        amount: EvmTokensUtils.formatTokenValue(
          e.args[2],
          token.tokenInfo.decimals,
        ),
      };
      finalEvents.push(event);
    }

    return {
      events: finalEvents,
      lastBlock: lastBlock - limit,
    };
  }
};

const getHistory = async (
  token: EVMToken,
  chain: EvmChain,
  walletAddress: string,
  walletSigningKey: SigningKey,
  lastBlock?: number,
): Promise<EvmTokenHistory> => {
  const provider = EthersUtils.getProvider(chain.network);
  const lastBlockNumber = lastBlock ?? (await provider.getBlockNumber());
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
    // } while (history.events.length === 0);
  } while (history.lastBlock > 0);
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
