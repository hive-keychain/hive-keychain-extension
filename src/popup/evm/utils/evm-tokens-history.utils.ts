import {
  EvmUserHistory,
  EvmUserHistoryItem,
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmDataFetchingV2Utils,
  LightNodeHistoryFlow,
  LightNodeHistoryItem,
} from '@popup/evm/utils/evm-data-fetching-v2.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import FormatUtils from 'src/utils/format.utils';

const LIMIT = 50;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
type NftFlow = Extract<LightNodeHistoryFlow, { kind: 'ERC721' | 'ERC1155' }>;
type KnownOpName =
  | 'NATIVE_SEND'
  | 'NATIVE_RECEIVE'
  | 'ERC20_SEND'
  | 'ERC20_RECEIVE'
  | 'ERC20_APPROVE'
  | 'ERC20_MINT'
  | 'ERC20_BURN'
  | 'ERC721_SEND'
  | 'ERC721_RECEIVE'
  | 'ERC721_APPROVE'
  | 'ERC721_APPROVE_FOR_ALL'
  | 'ERC721_MINT'
  | 'ERC721_BURN'
  | 'ERC1155_SEND'
  | 'ERC1155_RECEIVE'
  | 'ERC1155_APPROVE_FOR_ALL'
  | 'ERC1155_MINT'
  | 'ERC1155_BURN'
  | 'SWAP'
  | 'AIRDROP_RECEIVE'
  | 'CONTRACT_CALL'
  | 'CONTRACT_DEPLOY'
  | 'ADD_LIQUIDITY'
  | 'REMOVE_LIQUIDITY'
  | 'WRAP'
  | 'UNWRAP'
  | 'UNKNOWN';

const OUTGOING_OPS = new Set<KnownOpName>([
  'NATIVE_SEND',
  'ERC20_SEND',
  'ERC20_APPROVE',
  'ERC20_BURN',
  'ERC721_SEND',
  'ERC721_APPROVE',
  'ERC721_APPROVE_FOR_ALL',
  'ERC721_BURN',
  'ERC1155_SEND',
  'ERC1155_APPROVE_FOR_ALL',
  'ERC1155_BURN',
  'SWAP',
  'CONTRACT_CALL',
  'CONTRACT_DEPLOY',
  'ADD_LIQUIDITY',
  'WRAP',
]);

const INCOMING_OPS = new Set<KnownOpName>([
  'NATIVE_RECEIVE',
  'ERC20_RECEIVE',
  'ERC20_MINT',
  'ERC721_RECEIVE',
  'ERC721_MINT',
  'ERC1155_RECEIVE',
  'ERC1155_MINT',
  'AIRDROP_RECEIVE',
  'REMOVE_LIQUIDITY',
  'UNWRAP',
]);

const APPROVE_OPS = new Set<KnownOpName>([
  'ERC20_APPROVE',
  'ERC721_APPROVE',
  'ERC721_APPROVE_FOR_ALL',
  'ERC1155_APPROVE_FOR_ALL',
]);

const NFT_MINT_OPS = new Set<KnownOpName>(['ERC721_MINT', 'ERC1155_MINT']);

const COMPLEX_OPS = new Set<KnownOpName>([
  'SWAP',
  'AIRDROP_RECEIVE',
  'ADD_LIQUIDITY',
  'REMOVE_LIQUIDITY',
  'WRAP',
  'UNWRAP',
]);

const getEmptyHistory = (): EvmUserHistory => ({
  events: [],
  nextCursor: null,
  fullyFetch: false,
});

const isOpLike = (opName: string, values: string[]) => {
  const normalized = (opName || '').toLowerCase();
  return values.some((value) => normalized.includes(value));
};

const isFlowNft = (flow: LightNodeHistoryFlow): flow is NftFlow =>
  flow.kind === 'ERC721' || flow.kind === 'ERC1155';

const toTimestamp = (blockTime: string) => {
  const value = Date.parse(blockTime);
  return Number.isNaN(value) ? Date.now() : value;
};

const toTransactionIndex = (opIndex: string) => {
  const value = Number(opIndex);
  return Number.isFinite(value) ? value : 0;
};

const getFlowAmount = (flow: LightNodeHistoryFlow) => {
  switch (flow.kind) {
    case 'NATIVE':
      return flow.amount;
    case 'ERC20':
      return flow.amount;
    case 'ERC721':
      return flow.quantity;
    case 'ERC1155':
      return flow.quantity;
    default:
      return '0';
  }
};

const getFlowSymbol = (flow: LightNodeHistoryFlow, chain: EvmChain) => {
  switch (flow.kind) {
    case 'NATIVE':
      return chain.mainToken;
    case 'ERC20':
      return flow.symbol ?? 'ERC20';
    case 'ERC721':
    case 'ERC1155':
      return flow.collectionName ?? 'NFT';
    default:
      return chain.mainToken;
  }
};

const getDisplayAddress = (address?: string | null) => {
  if (!address) return '';
  return EvmFormatUtils.formatAddress(address);
};

const toKnownOpName = (opName: string): KnownOpName => {
  const value = (opName || 'UNKNOWN').toUpperCase() as KnownOpName;
  return value;
};

const formatTokenAmount = (amount: string) =>
  FormatUtils.withCommas(amount, 8, true);

const formatFlow = (flow: LightNodeHistoryFlow, chain: EvmChain) => {
  if (flow.kind === 'ERC721') {
    return `${getFlowSymbol(flow, chain)}#${flow.tokenId}`;
  }
  if (flow.kind === 'ERC1155') {
    return `${flow.quantity} ${getFlowSymbol(flow, chain)}#${flow.tokenId}`;
  }
  return `${formatTokenAmount(getFlowAmount(flow))} ${getFlowSymbol(flow, chain)}`;
};

const makeCommonItem = (item: LightNodeHistoryItem): EvmUserHistoryItem => ({
  pageTitle: 'evm_history_smart_contract',
  type: EvmUserHistoryItemType.BASE_TRANSACTION,
  blockNumber: item.blockNumber,
  transactionHash: item.txId,
  transactionIndex: toTransactionIndex(item.opIndex),
  timestamp: toTimestamp(item.blockTime),
  label: chrome.i18n.getMessage('evm_history_generic_message'),
  nonce: 0,
});

const pushAddressDetails = (
  details: EvmUserHistoryItemDetail[],
  fromAddress: string | null,
  toAddress: string | null,
) => {
  if (fromAddress) {
    details.push({
      label: 'popup_html_evm_transaction_info_from',
      value: fromAddress,
      type: EvmUserHistoryItemDetailType.ADDRESS,
    });
  }
  if (toAddress) {
    details.push({
      label: 'popup_html_evm_transaction_info_to',
      value: toAddress,
      type: EvmUserHistoryItemDetailType.ADDRESS,
    });
  }
};

const getPreferredFlow = (
  item: LightNodeHistoryItem,
  isOutgoing: boolean,
): LightNodeHistoryFlow | undefined => {
  const preferred = isOutgoing ? item.out : item.in;
  const fallback = isOutgoing ? item.in : item.out;
  return preferred[0] ?? fallback[0];
};

const parseTransfer = (
  historyItem: EvmUserHistoryItem,
  item: LightNodeHistoryItem,
  chain: EvmChain,
  isOutgoing: boolean,
  counterpartyLabel: string,
): EvmUserHistoryItem => {
  const flow = getPreferredFlow(item, isOutgoing);
  if (!flow) return historyItem;

  const details: EvmUserHistoryItemDetail[] = [];
  const fromAddress = item.fromAddress;
  const toAddress = item.toAddress;
  const symbol = getFlowSymbol(flow, chain);
  const amount = formatTokenAmount(getFlowAmount(flow));

  if (flow.kind === 'ERC721' || flow.kind === 'ERC1155') {
    const tokenId = flow.tokenId;
    const collectionName = getFlowSymbol(flow, chain);
    details.push({
      label:
        flow.kind === 'ERC721'
          ? `${collectionName}#${tokenId}`
          : `${flow.quantity} ${collectionName}#${tokenId}`,
      value: tokenId,
      type: EvmUserHistoryItemDetailType.IMAGE,
    });

    const labelKey =
      flow.kind === 'ERC721'
        ? isOutgoing
          ? 'evm_history_operation_safe_transfer_from_erc721_out'
          : fromAddress?.toLowerCase() === ZERO_ADDRESS
            ? 'evm_history_operation_safe_transfer_from_erc721_in_no_sender'
            : 'evm_history_operation_safe_transfer_from_erc721_in'
        : isOutgoing
          ? 'evm_history_operation_safe_transfer_from_erc1155_out'
          : fromAddress?.toLowerCase() === ZERO_ADDRESS
            ? 'evm_history_operation_safe_transfer_from_erc1155_in_no_sender'
            : 'evm_history_operation_safe_transfer_from_erc1155_in';

    const labelArgs =
      flow.kind === 'ERC721'
        ? fromAddress?.toLowerCase() === ZERO_ADDRESS && !isOutgoing
          ? [collectionName, tokenId]
          : [collectionName, tokenId, counterpartyLabel]
        : fromAddress?.toLowerCase() === ZERO_ADDRESS && !isOutgoing
          ? [flow.quantity, collectionName, tokenId]
          : [flow.quantity, collectionName, tokenId, counterpartyLabel];

    pushAddressDetails(details, fromAddress, toAddress);

    return {
      ...historyItem,
      pageTitle: 'evm_transfer',
      type: isOutgoing
        ? EvmUserHistoryItemType.TRANSFER_OUT
        : EvmUserHistoryItemType.TRANSFER_IN,
      label: chrome.i18n.getMessage(labelKey, labelArgs),
      detailFields: details,
      receiverAddress: toAddress ?? undefined,
    };
  }

  details.push({
    label: 'popup_html_transfer_amount',
    value: `${amount} ${symbol}`,
    type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
  });
  pushAddressDetails(details, fromAddress, toAddress);

  const labelKey = isOutgoing
    ? 'evm_history_operation_transfer_out'
    : fromAddress?.toLowerCase() === ZERO_ADDRESS
      ? 'evm_history_operation_transfer_in_no_sender'
      : 'evm_history_operation_transfer_in';

  const labelArgs =
    fromAddress?.toLowerCase() === ZERO_ADDRESS && !isOutgoing
      ? [amount, symbol]
      : [amount, symbol, counterpartyLabel];

  return {
    ...historyItem,
    pageTitle: 'popup_html_transfer_funds',
    type: isOutgoing
      ? EvmUserHistoryItemType.TRANSFER_OUT
      : EvmUserHistoryItemType.TRANSFER_IN,
    label: chrome.i18n.getMessage(labelKey, labelArgs),
    detailFields: details,
    receiverAddress: toAddress ?? undefined,
  };
};

const parseApprove = (
  historyItem: EvmUserHistoryItem,
  item: LightNodeHistoryItem,
  chain: EvmChain,
  counterpartyLabel: string,
): EvmUserHistoryItem => {
  const details: EvmUserHistoryItemDetail[] = [];
  const flow = item.out[0] ?? item.in[0];
  const symbol = flow ? getFlowSymbol(flow, chain) : 'Token';
  let labelKey = 'evm_history_operation_approve_out_for_all';
  let labelArgs = [counterpartyLabel, symbol];

  if (flow?.kind === 'ERC20') {
    const amount = formatTokenAmount(flow.amount);
    labelKey = 'evm_history_operation_approve_out_erc20';
    labelArgs = [counterpartyLabel, amount, flow.symbol ?? 'ERC20'];
    details.push({
      label: 'popup_html_transfer_amount',
      value: `${amount} ${flow.symbol ?? 'ERC20'}`,
      type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
    });
  } else if (
    flow &&
    (flow.kind === 'ERC721' || flow.kind === 'ERC1155') &&
    !!flow.tokenId
  ) {
    labelKey = 'evm_history_operation_approve_out_erc721';
    labelArgs = [counterpartyLabel, symbol, flow.tokenId];
    details.push({
      label: `${symbol}#${flow.tokenId}`,
      value: flow.tokenId,
      type: EvmUserHistoryItemDetailType.IMAGE,
    });
  }

  pushAddressDetails(details, item.fromAddress, item.toAddress);

  return {
    ...historyItem,
    pageTitle: 'evm_approval',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    label: chrome.i18n.getMessage(labelKey, labelArgs),
    detailFields: details,
    receiverAddress: item.toAddress ?? undefined,
  };
};

const parseMint = (
  historyItem: EvmUserHistoryItem,
  item: LightNodeHistoryItem,
  chain: EvmChain,
): EvmUserHistoryItem => {
  const details: EvmUserHistoryItemDetail[] = [];
  const mintedFlows = [...item.in, ...item.out].filter(isFlowNft);

  if (!mintedFlows.length) {
    pushAddressDetails(details, item.fromAddress, item.toAddress);
    return {
      ...historyItem,
      pageTitle: 'evm_mint',
      type: EvmUserHistoryItemType.SMART_CONTRACT,
      label: chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
        'NFT',
        '-',
      ]),
      detailFields: details,
    };
  }

  for (const flow of mintedFlows) {
    details.push({
      label: `${getFlowSymbol(flow, chain)}#${flow.tokenId}`,
      value: flow.tokenId,
      type: EvmUserHistoryItemDetailType.IMAGE,
    });
  }
  pushAddressDetails(details, item.fromAddress, item.toAddress);

  if (mintedFlows.length > 1 || isOpLike(item.opName, ['mint_batch'])) {
    const amount = mintedFlows.reduce((sum, flow) => {
      if (flow.kind === 'ERC1155') {
        const value = Number(flow.quantity);
        return Number.isNaN(value) ? sum + 1 : sum + value;
      }
      return sum + 1;
    }, 0);

    return {
      ...historyItem,
      pageTitle: 'evm_mint_batch',
      type: EvmUserHistoryItemType.SMART_CONTRACT,
      label: chrome.i18n.getMessage('evm_history_operation_mint_batch', [
        amount.toString(),
        getFlowSymbol(mintedFlows[0], chain),
      ]),
      detailFields: details,
    };
  }

  const flow = mintedFlows[0];
  return {
    ...historyItem,
    pageTitle: 'evm_mint',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    label: chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
      getFlowSymbol(flow, chain),
      flow.tokenId,
    ]),
    detailFields: details,
  };
};

const parseComplexOperation = (
  historyItem: EvmUserHistoryItem,
  item: LightNodeHistoryItem,
  chain: EvmChain,
  opName: KnownOpName,
): EvmUserHistoryItem => {
  const details: EvmUserHistoryItemDetail[] = [];
  const firstOut = item.out[0];
  const firstIn = item.in[0];

  const outLabel = firstOut ? formatFlow(firstOut, chain) : '';
  const inLabel = firstIn ? formatFlow(firstIn, chain) : '';

  for (const flow of [...item.out, ...item.in]) {
    if (flow.kind === 'ERC721' || flow.kind === 'ERC1155') {
      details.push({
        label: formatFlow(flow, chain),
        value: flow.tokenId,
        type: EvmUserHistoryItemDetailType.IMAGE,
      });
    } else {
      details.push({
        label: 'popup_html_transfer_amount',
        value: formatFlow(flow, chain),
        type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
      });
    }
  }
  pushAddressDetails(details, item.fromAddress, item.toAddress);

  let key = 'evm_history_generic_message';
  let args: string[] = [];

  switch (opName) {
    case 'SWAP':
      key = 'evm_history_operation_swap';
      args = [outLabel, inLabel];
      break;
    case 'ADD_LIQUIDITY':
      key = 'evm_history_operation_add_liquidity';
      args = [outLabel, inLabel];
      break;
    case 'REMOVE_LIQUIDITY':
      key = 'evm_history_operation_remove_liquidity';
      args = [outLabel, inLabel];
      break;
    case 'WRAP':
      key = 'evm_history_operation_wrap';
      args = [outLabel, inLabel];
      break;
    case 'UNWRAP':
      key = 'evm_history_operation_unwrap';
      args = [outLabel, inLabel];
      break;
    case 'AIRDROP_RECEIVE':
      key = 'evm_history_operation_airdrop_receive';
      args = [inLabel];
      break;
    default:
      break;
  }

  return {
    ...historyItem,
    pageTitle: 'evm_history_smart_contract',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    label: chrome.i18n.getMessage(key, args),
    detailFields: details,
    receiverAddress: item.toAddress ?? undefined,
  };
};

const parseSmartContractOperation = (
  historyItem: EvmUserHistoryItem,
  item: LightNodeHistoryItem,
  isOutgoing: boolean,
): EvmUserHistoryItem => {
  const details: EvmUserHistoryItemDetail[] = [];
  if (item.toAddress) {
    details.push({
      label: 'evm_operation_smart_contract_address',
      value: item.toAddress,
      type: EvmUserHistoryItemDetailType.ADDRESS,
    });
  } else {
    pushAddressDetails(details, item.fromAddress, item.toAddress);
  }

  const contractAddress = getDisplayAddress(item.toAddress ?? item.fromAddress);
  const operationName = item.action || item.opName || 'operation';
  const labelKey = isOutgoing
    ? 'evm_history_operation_generic_smart_contract_messages_out'
    : 'evm_history_operation_generic_smart_contract_messages_in';

  return {
    ...historyItem,
    pageTitle: 'evm_history_smart_contract',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    label: chrome.i18n.getMessage(labelKey, [
      operationName,
      'Smart Contract',
      contractAddress,
    ]),
    detailFields: details,
  };
};

const parseItem = (
  item: LightNodeHistoryItem,
  chain: EvmChain,
  walletAddress: string,
): EvmUserHistoryItem => {
  const opName = toKnownOpName(item.opName);
  const walletAddressLower = walletAddress.toLowerCase();
  const fromAddress = item.fromAddress?.toLowerCase();
  const isOutgoing = OUTGOING_OPS.has(opName)
    ? true
    : INCOMING_OPS.has(opName)
      ? false
      : fromAddress === walletAddressLower;
  const counterpartyLabel = getDisplayAddress(
    isOutgoing ? item.toAddress : item.fromAddress,
  );

  const base = makeCommonItem(item);
  const hasFlows = item.in.length > 0 || item.out.length > 0;

  if (
    opName === 'CONTRACT_DEPLOY' ||
    isOpLike(item.opName, ['contract_creation', 'create_contract']) ||
    (!item.toAddress && !hasFlows)
  ) {
    const details: EvmUserHistoryItemDetail[] = [];
    pushAddressDetails(details, item.fromAddress, item.toAddress);

    return {
      ...base,
      pageTitle: 'evm_history_smart_contract_creation',
      type: EvmUserHistoryItemType.SMART_CONTRACT_CREATION,
      label: chrome.i18n.getMessage(
        item.toAddress
          ? 'evm_history_smart_contract_creation_message'
          : 'evm_history_smart_contract_creation_message_no_address',
        item.toAddress ? [getDisplayAddress(item.toAddress)] : [],
      ),
      detailFields: details,
    };
  }

  if (APPROVE_OPS.has(opName) || isOpLike(item.opName, ['approve'])) {
    return parseApprove(base, item, chain, counterpartyLabel);
  }

  if (NFT_MINT_OPS.has(opName)) {
    return parseMint(base, item, chain);
  }

  if (COMPLEX_OPS.has(opName)) {
    return parseComplexOperation(base, item, chain, opName);
  }

  if (isOpLike(item.opName, ['transfer']) || hasFlows) {
    return parseTransfer(base, item, chain, isOutgoing, counterpartyLabel);
  }

  return parseSmartContractOperation(base, item, isOutgoing);
};

const sortEvents = (events: EvmUserHistoryItem[]) =>
  [...events].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
    if (a.blockNumber !== b.blockNumber) return b.blockNumber - a.blockNumber;
    return b.transactionIndex - a.transactionIndex;
  });

const getEventKey = (item: EvmUserHistoryItem) =>
  `${item.transactionHash.toLowerCase()}-${item.transactionIndex}`;

const fetchHistory2 = async (
  walletAddress: string,
  chain: EvmChain,
  history?: EvmUserHistory,
) => {
  const previousHistory = history?.events ? history : getEmptyHistory();
  if (previousHistory.fullyFetch) {
    return previousHistory;
  }

  const params = new URLSearchParams();
  if (!!previousHistory.nextCursor) {
    params.set('cursor', previousHistory.nextCursor.toString());
  }
  params.set('limit', LIMIT.toString());

  const response = await EvmDataFetchingV2Utils.getHistory(
    chain.chainId,
    walletAddress,
    params.toString(),
  );

  const parsedItems = response.items.map((item) =>
    parseItem(item, chain, walletAddress),
  );
  const dedupSet = new Set(previousHistory.events.map(getEventKey));
  const merged = [...previousHistory.events];

  for (const event of parsedItems) {
    const key = getEventKey(event);
    if (dedupSet.has(key)) continue;
    dedupSet.add(key);
    merged.push(event);
  }

  return {
    events: sortEvents(merged),
    nextCursor: response.nextCursor,
    fullyFetch: !response.nextCursor,
  } as EvmUserHistory;
};

export const EvmTokensHistoryUtils = {
  fetchHistory2,
};
