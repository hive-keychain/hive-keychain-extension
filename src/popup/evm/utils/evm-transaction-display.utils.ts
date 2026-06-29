import {
  EvmUserHistoryItem,
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfo,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionDisplayContext,
  EvmTransactionResolvedStatus,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';

import { I18nUtils } from 'src/utils/i18n.utils';

interface BuildResultNavigationParamsOptions {
  transactionResponse?: TransactionResponse | null;
  transactionReceipt?: TransactionReceipt | any;
  displayItem?: EvmUserHistoryItem;
  status?: EvmTransactionResolvedStatus;
  gasFee?: any;
  transactionData?: any;
  context?: EvmTransactionDisplayContext;
}

const ERC20_TRANSFER_SELECTOR = '0xa9059cbb';

const erc20TransferInterface = new ethers.Interface([
  'function transfer(address to, uint256 amount)',
]);

const getDataHex = (
  data: TransactionResponse['data'] | null | undefined,
): string => {
  if (data == null) return '';
  return typeof data === 'string' ? data : ethers.hexlify(data);
};

const isCalldataEmpty = (data: string): boolean => {
  if (!data || data === '0x') return true;
  return data.replace(/^0x/i, '').length === 0;
};

const getBigIntValue = (value: unknown): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && value.length > 0) return BigInt(value);
  return BigInt(0);
};

const getTransactionIndex = (tx: TransactionResponse): number => {
  const txWithIndex = tx as TransactionResponse & {
    index?: number | null;
    transactionIndex?: number | null;
  };
  return Number(txWithIndex.index ?? txWithIndex.transactionIndex ?? 0);
};

const getBaseDisplayItem = (
  tx: TransactionResponse,
  walletAddress: string,
  context?: EvmTransactionDisplayContext,
): EvmUserHistoryItem => ({
  pageTitle: context?.pageTitle ?? 'evm_broadcast',
  type: EvmUserHistoryItemType.BASE_TRANSACTION,
  blockNumber: tx.blockNumber ?? 0,
  transactionHash: tx.hash,
  transactionIndex: getTransactionIndex(tx),
  timestamp: context?.timestamp ?? Date.now(),
  label: I18nUtils.getMessage('evm_history_generic_message'),
  nonce: Number(tx.nonce),
  receiverAddress: context?.receiverAddress,
  detailFields: context?.detailFields,
  tokenInfo: context?.tokenInfo,
  warningMessage: context?.warningMessage,
});

const getTokenDecimals = (tokenInfo: EvmSmartContractInfo): number => {
  if ('decimals' in tokenInfo) {
    return tokenInfo.decimals;
  }
  if (tokenInfo.type === EVMSmartContractType.NATIVE) {
    return 18;
  }
  return 0;
};

const formatContextAmount = (
  amount: string | number,
  tokenInfo: EvmSmartContractInfo,
): string => {
  const decimalAmount = new Decimal(amount.toString());
  return EvmFormatUtils.formatTokenBalance(
    decimalAmount.toFixed(),
    getTokenDecimals(tokenInfo),
  );
};

const getAmountDetailValue = (
  amount: string | number,
  tokenInfo: EvmSmartContractInfo,
): string => {
  if (
    tokenInfo.type === EVMSmartContractType.ERC721 ||
    tokenInfo.type === EVMSmartContractType.ERC1155
  ) {
    return amount.toString();
  }
  return `${formatContextAmount(amount, tokenInfo)} ${tokenInfo.symbol}`;
};

const getTokenIdFromDetails = (
  details?: EvmUserHistoryItemDetail[],
): string | undefined => {
  const tokenIdDetail = details?.find(
    (detail) =>
      detail.type === EvmUserHistoryItemDetailType.IMAGE ||
      detail.label === 'evm_nft_token_id',
  );
  return tokenIdDetail?.value?.toString();
};

const getTransferDetailsFromContext = (
  tx: TransactionResponse,
  walletAddress: string,
  context: EvmTransactionDisplayContext,
): EvmUserHistoryItemDetail[] => {
  if (context.detailFields?.length) {
    return context.detailFields;
  }

  const details: EvmUserHistoryItemDetail[] = [];

  if (context.tokenInfo && context.amount !== undefined) {
    details.push({
      label: 'popup_html_transfer_amount',
      value: getAmountDetailValue(context.amount, context.tokenInfo),
      type:
        context.tokenInfo.type === EVMSmartContractType.ERC721 ||
        context.tokenInfo.type === EVMSmartContractType.ERC1155
          ? EvmUserHistoryItemDetailType.BASE
          : EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
    });
  }

  details.push({
    label: 'popup_html_evm_transaction_info_from',
    value: tx.from ?? walletAddress,
    type: EvmUserHistoryItemDetailType.ADDRESS,
  });

  if (context.receiverAddress ?? tx.to) {
    details.push({
      label: 'popup_html_evm_transaction_info_to',
      value: (context.receiverAddress ?? tx.to)!,
      type: EvmUserHistoryItemDetailType.ADDRESS,
    });
  }

  return details;
};

const buildKnownTransferDisplayItem = (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
  context: EvmTransactionDisplayContext,
): EvmUserHistoryItem | undefined => {
  const tokenInfo = context.tokenInfo;
  if (!tokenInfo || context.amount === undefined) {
    return undefined;
  }

  const receiverAddress = context.receiverAddress ?? tx.to ?? '';
  const receiverLabel = receiverAddress
    ? EvmFormatUtils.formatAddress(receiverAddress)
    : '';
  const details = getTransferDetailsFromContext(tx, walletAddress, context);
  const base = getBaseDisplayItem(tx, walletAddress, context);

  if (tokenInfo.type === EVMSmartContractType.ERC721) {
    const tokenId = getTokenIdFromDetails(details) ?? context.amount.toString();
    return {
      ...base,
      pageTitle: context.pageTitle ?? 'evm_transfer',
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      label: I18nUtils.getMessage(
        'evm_history_operation_safe_transfer_from_erc721_out',
        [tokenInfo.name, tokenId, receiverLabel],
      ),
      detailFields: details,
      receiverAddress: receiverAddress || undefined,
      tokenInfo,
    };
  }

  if (tokenInfo.type === EVMSmartContractType.ERC1155) {
    const tokenId = getTokenIdFromDetails(details) ?? '';
    return {
      ...base,
      pageTitle: context.pageTitle ?? 'evm_transfer',
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      label: I18nUtils.getMessage(
        'evm_history_operation_safe_transfer_from_erc1155_out',
        [context.amount.toString(), tokenInfo.name, tokenId, receiverLabel],
      ),
      detailFields: details,
      receiverAddress: receiverAddress || undefined,
      tokenInfo,
    };
  }

  const amount = formatContextAmount(context.amount, tokenInfo);
  return {
    ...base,
    pageTitle: context.pageTitle ?? 'popup_html_transfer_funds',
    type: EvmUserHistoryItemType.TRANSFER_OUT,
    label: I18nUtils.getMessage('popup_html_evm_history_transfer_out', [
      amount,
      tokenInfo.symbol,
      receiverLabel,
    ]),
    detailFields: details,
    receiverAddress: receiverAddress || undefined,
    tokenInfo,
  };
};

const buildNativeTransferDisplayItem = (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
  context?: EvmTransactionDisplayContext,
): EvmUserHistoryItem => {
  const amount = EvmFormatUtils.formatTokenBalance(
    ethers.formatEther(getBigIntValue(tx.value)),
    18,
  );
  const receiverAddress = context?.receiverAddress ?? tx.to ?? '';
  const receiverLabel = receiverAddress
    ? EvmFormatUtils.formatAddress(receiverAddress)
    : '';

  return {
    ...getBaseDisplayItem(tx, walletAddress, context),
    pageTitle: context?.pageTitle ?? 'popup_html_transfer_funds',
    type: EvmUserHistoryItemType.TRANSFER_OUT,
    label: I18nUtils.getMessage('popup_html_evm_history_transfer_out', [
      amount,
      chain.mainToken,
      receiverLabel,
    ]),
    detailFields: [
      {
        label: 'popup_html_transfer_amount',
        value: `${amount} ${chain.mainToken}`,
        type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
      },
      {
        label: 'popup_html_evm_transaction_info_from',
        value: tx.from ?? walletAddress,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      },
      {
        label: 'popup_html_evm_transaction_info_to',
        value: receiverAddress,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      },
    ],
    receiverAddress: receiverAddress || undefined,
  };
};

const buildContractCreationDisplayItem = (
  tx: TransactionResponse,
  walletAddress: string,
  context?: EvmTransactionDisplayContext,
): EvmUserHistoryItem => ({
  ...getBaseDisplayItem(tx, walletAddress, context),
  pageTitle: context?.pageTitle ?? 'evm_history_smart_contract_creation',
  type: EvmUserHistoryItemType.SMART_CONTRACT_CREATION,
  label: I18nUtils.getMessage(
    'evm_history_smart_contract_creation_message_no_address',
  ),
  detailFields: context?.detailFields ?? [],
});

const buildErc20TransferDisplayItem = (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
  context: EvmTransactionDisplayContext,
  dataHex: string,
): EvmUserHistoryItem | undefined => {
  if (
    context.tokenInfo?.type !== EVMSmartContractType.ERC20 ||
    !('decimals' in context.tokenInfo)
  ) {
    return undefined;
  }

  try {
    const parsed = erc20TransferInterface.parseTransaction({ data: dataHex });
    if (parsed?.name !== 'transfer') {
      return undefined;
    }

    const receiverAddress = (parsed.args[0] as string) ?? context.receiverAddress;
    const amount = ethers.formatUnits(parsed.args[1], context.tokenInfo.decimals);

    return buildKnownTransferDisplayItem(tx, chain, walletAddress, {
      ...context,
      amount,
      receiverAddress,
    });
  } catch {
    return undefined;
  }
};

const buildSmartContractDisplayItem = async (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
  context: EvmTransactionDisplayContext | undefined,
  dataHex: string,
): Promise<EvmUserHistoryItem> => {
  let label = I18nUtils.getMessage(
    'evm_history_default_out_smart_contract_operation',
  );

  try {
    const decoded = await EvmTransactionParserUtils.parseData(dataHex, chain);
    if (decoded?.operationName && tx.to) {
      label = I18nUtils.getMessage(
        'evm_history_operation_generic_smart_contract_messages_out',
        [
          decoded.operationName,
          I18nUtils.getMessage('evm_history_smart_contract'),
          EvmFormatUtils.formatAddress(tx.to),
        ],
      );
    }
  } catch {
    /* Best-effort display only; fall through to default smart-contract label. */
  }

  return {
    ...getBaseDisplayItem(tx, walletAddress, context),
    pageTitle: context?.pageTitle ?? 'evm_broadcast',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    label,
    detailFields:
      context?.detailFields ??
      (tx.to
        ? [
            {
              label: 'evm_history_smart_contract',
              value: tx.to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ]
        : []),
    receiverAddress: context?.receiverAddress,
  };
};

const buildDisplayItemFromBroadcast = async (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
  context?: EvmTransactionDisplayContext,
): Promise<EvmUserHistoryItem> => {
  const knownTransfer = context
    ? buildKnownTransferDisplayItem(tx, chain, walletAddress, context)
    : undefined;
  if (knownTransfer) {
    return knownTransfer;
  }

  if (!tx.to) {
    return buildContractCreationDisplayItem(tx, walletAddress, context);
  }

  const dataHex = getDataHex(tx.data);
  const value = getBigIntValue(tx.value);

  if (isCalldataEmpty(dataHex) && value > BigInt(0)) {
    return buildNativeTransferDisplayItem(tx, chain, walletAddress, context);
  }

  if (dataHex.slice(0, 10).toLowerCase() === ERC20_TRANSFER_SELECTOR) {
    const erc20Transfer = buildErc20TransferDisplayItem(
      tx,
      chain,
      walletAddress,
      context ?? {},
      dataHex,
    );
    if (erc20Transfer) {
      return erc20Transfer;
    }
  }

  if (!isCalldataEmpty(dataHex)) {
    return buildSmartContractDisplayItem(
      tx,
      chain,
      walletAddress,
      context,
      dataHex,
    );
  }

  return getBaseDisplayItem(tx, walletAddress, context);
};

const getDisplayAmount = (
  displayItem?: EvmUserHistoryItem,
  context?: EvmTransactionDisplayContext,
) => {
  if (context?.amount !== undefined) return context.amount;
  const amountDetail = displayItem?.detailFields?.find(
    (detail) =>
      detail.label === 'popup_html_transfer_amount' ||
      detail.type === EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
  );
  return amountDetail?.value;
};

const buildResolvedDisplayItem = (
  displayItem: EvmUserHistoryItem,
  status: EvmTransactionResolvedStatus,
  transactionReceipt?: TransactionReceipt | any,
): EvmUserHistoryItem => ({
  ...displayItem,
  blockNumber: transactionReceipt?.blockNumber ?? displayItem.blockNumber,
  transactionIndex:
    transactionReceipt?.index ??
    transactionReceipt?.transactionIndex ??
    displayItem.transactionIndex,
  isCanceled:
    status === EvmTransactionResolvedStatus.CANCELED ||
    displayItem.isCanceled,
  isReverted:
    status === EvmTransactionResolvedStatus.REVERTED ||
    displayItem.isReverted,
  isFailed:
    status === EvmTransactionResolvedStatus.FAILED ||
    displayItem.isFailed,
});

const buildResultNavigationParams = ({
  transactionResponse,
  transactionReceipt,
  displayItem,
  status,
  gasFee,
  transactionData,
  context,
}: BuildResultNavigationParamsOptions) => {
  const effectiveDisplayItem =
    displayItem && status
      ? buildResolvedDisplayItem(displayItem, status, transactionReceipt)
      : displayItem;

  return {
    pageTitle: effectiveDisplayItem?.pageTitle ?? context?.pageTitle,
    transactionResponse,
    transactionReceipt,
    detailFields: effectiveDisplayItem?.detailFields ?? context?.detailFields,
    tokenInfo: effectiveDisplayItem?.tokenInfo ?? context?.tokenInfo,
    amount: getDisplayAmount(effectiveDisplayItem, context),
    receiverAddress:
      effectiveDisplayItem?.receiverAddress ?? context?.receiverAddress,
    warningMessage:
      effectiveDisplayItem?.warningMessage ?? context?.warningMessage,
    timestamp: effectiveDisplayItem?.timestamp ?? context?.timestamp,
    isCanceled:
      status === EvmTransactionResolvedStatus.CANCELED ||
      effectiveDisplayItem?.isCanceled,
    isReverted:
      status === EvmTransactionResolvedStatus.REVERTED ||
      effectiveDisplayItem?.isReverted,
    isFailed:
      status === EvmTransactionResolvedStatus.FAILED ||
      effectiveDisplayItem?.isFailed,
    isSuccess: status === EvmTransactionResolvedStatus.SUCCESS,
    resolvedStatus: status,
    gasFee,
    transactionData,
    initialDisplayNfts: context?.initialDisplayNfts,
    initialDisplayHistory: context?.initialDisplayHistory,
    displayItem: effectiveDisplayItem,
  };
};

export const EvmTransactionDisplayUtils = {
  buildDisplayItemFromBroadcast,
  buildResolvedDisplayItem,
  buildResultNavigationParams,
};
