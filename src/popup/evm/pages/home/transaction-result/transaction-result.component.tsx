import { EvmAddressComponent } from '@common-ui/evm/evm-address/evm-address.component';
import { SmallImageCardComponent } from '@common-ui/small-data-card/small-image-card.component';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import {
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfo,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { getAbiFromType } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import {
  EvmTokensHistoryParserUtils,
  TransactionTokenKind,
} from '@popup/evm/utils/evm-tokens-history-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { getEvmLightNodeOpTitleMessageKey } from '@popup/evm/utils/evm-light-node-op-title.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { TransactionReceipt, TransactionResponse, ethers } from 'ethers';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SmallDataCardComponent } from 'src/common-ui/small-data-card/small-data-card.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import Logger from 'src/utils/logger.utils';
import Decimal from 'decimal.js';

import { I18nUtils } from 'src/utils/i18n.utils';
enum ReplacedTransactionReason {
  REPRICED = 'repriced',
  CANCELLED = 'cancelled',
  REPLACED = 'replaced',
}

/** Recipient address from standard ERC-20 `transfer(address,uint256)` calldata, if applicable. */
function decodeErc20TransferRecipient(data: string | null): string | undefined {
  if (!data || data === '0x' || !data.startsWith('0xa9059cbb')) {
    return undefined;
  }
  try {
    const iface = new ethers.Interface([
      'function transfer(address to, uint256 amount)',
    ]);
    const parsed = iface.parseTransaction({ data });
    if (parsed?.name === 'transfer') {
      return parsed.args[0] as string;
    }
  } catch {
    /* calldata is not a standard ERC-20 transfer */
  }
  return undefined;
}

const TOTAL_FEE_FRACTION_DIGITS = 8;
const PER_GAS_FRACTION_DIGITS = 10;

function formatNativeAmountFromWei(
  wei: bigint | string | number | Decimal,
  fractionDigits: number,
): string {
  const inMainToken = new Decimal(wei.toString()).div(EvmFormatUtils.WEI);
  return GasFeeUtils.formatGasFeeValue(inMainToken, fractionDigits);
}

function formatNativeFeeFromWei(
  wei: bigint | string | number | Decimal,
  fractionDigits: number,
  mainToken: string,
): string {
  return `${formatNativeAmountFromWei(wei, fractionDigits)} ${mainToken}`;
}

function formatEstimatedNativeFeeFromEth(
  ethAmount: Decimal,
  mainToken: string,
): string {
  return `${GasFeeUtils.formatGasFeeValue(
    ethAmount,
    TOTAL_FEE_FRACTION_DIGITS,
  )} ${mainToken}`;
}

const EvmTransactionResult = ({
  activeAccount,
  chain,
  transactionResponse,
  tokenInfo,
  amount,
  receiverAddress,
  gasFee,
  localAccounts,
  isCanceled,
  isReverted,
  isSuccess,
  pageTitle,
  detailFields,
  transactionData,
  warningMessage,
  initialDisplayNfts,
  initialDisplayHistory,
  opName,
  timestamp,
  setTitleContainerProperties,
  setErrorMessage,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [waitingForTx, setWaitingForTx] = useState(true);
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt>();
  const [txResult, setTxResult] = useState<TransactionResponse>();
  const hasRefreshedAccountAfterResolution = useRef(false);

  const [isCanceling, setCanceling] = useState<boolean>(false);
  const [isTransactionSpeedingUp, setTransactionSpeedingUp] =
    useState<boolean>(false);
  const [isGasPanelOpened, setGasPanelOpened] = useState<boolean>(false);
  const [isGasFeeEstimateLoading, setGasFeeEstimateLoading] =
    useState<boolean>(false);
  const [increasedGasFee, setIncreasedGasFee] =
    useState<GasFeeEstimationBase>(gasFee);

  const [transactionTokenType, setTransactionTokenType] = useState<
    string | null
  >(null);
  const shouldShowTokenType =
    transactionTokenType === EVMSmartContractType.ERC20 ||
    transactionTokenType === EVMSmartContractType.ERC721 ||
    transactionTokenType === EVMSmartContractType.ERC1155;

  useEffect(() => {
    const closeNavigationParams = initialDisplayNfts
      ? { initialDisplayNfts: true }
      : initialDisplayHistory
        ? { initialDisplayHistory: true }
        : undefined;
    const historyOpTitle = opName?.trim() ?? '';
    const useHistoryOpTitle =
      Boolean(initialDisplayHistory) && historyOpTitle.length > 0;
    const titleFromHistoryOp = useHistoryOpTitle
      ? getEvmLightNodeOpTitleMessageKey(opName)
      : undefined;
    setTitleContainerProperties({
      title: titleFromHistoryOp ?? pageTitle,
      skipTitleTranslation: false,
      isBackButtonEnabled: false,
      closeNavigationParams,
    });
    if (isSuccess || isCanceled || isReverted) {
      setWaitingForTx(false);
    } else if (transactionResponse?.wait) {
      getTransactionStatus();
    } else {
      setWaitingForTx(false);
    }
  }, []);

  useEffect(() => {
    if (
      waitingForTx ||
      !txReceipt?.status ||
      hasRefreshedAccountAfterResolution.current
    ) {
      return;
    }

    hasRefreshedAccountAfterResolution.current = true;
    loadEvmActiveAccount(chain, activeAccount.wallet);
  }, [
    activeAccount.wallet,
    chain,
    loadEvmActiveAccount,
    txReceipt?.status,
    waitingForTx,
  ]);

  useEffect(() => {
    if (tokenInfo) {
      setTransactionTokenType(tokenInfo.type);
      return;
    }

    if (!transactionResponse?.hash) {
      return;
    }

    const inferred =
      EvmTokensHistoryParserUtils.inferTransactionTokenKindFromTx(
        transactionResponse,
      );
    if (inferred) {
      setTransactionTokenType(inferred);
    }

    EvmTokensHistoryParserUtils.getTransactionTokenKind(
      chain.chainId,
      transactionResponse.hash,
    ).then((type: TransactionTokenKind | null) => {
      if (type) {
        setTransactionTokenType(type as string);
      }
    });
  }, [tokenInfo, chain.chainId, transactionResponse]);

  useEffect(() => {
    if (!isGasPanelOpened) {
      setGasFeeEstimateLoading(false);
    }
  }, [isGasPanelOpened]);

  const getTransactionStatus = async () => {
    const currentTransaction = transactionResponse;
    if (!currentTransaction) {
      setWaitingForTx(false);
      return;
    }
    const provider = await EthersUtils.getProvider(chain);
    try {
      await currentTransaction
        .wait()
        .then(async (transactionReceipt: TransactionReceipt | null) => {
          if (transactionReceipt) {
            const transactionResult = await provider.getTransaction(
              transactionReceipt.hash,
            );
            setTxReceipt(transactionReceipt);
            if (transactionResult) setTxResult(transactionResult);
            setWaitingForTx(false);
          }
        })
        .catch((err) => {
          if (err.reason) {
            switch (err.reason) {
              case ReplacedTransactionReason.REPRICED:
                Logger.info('Transaction successfully sped up');
                setWaitingForTx(false);
                break;
              case ReplacedTransactionReason.CANCELLED:
              case ReplacedTransactionReason.REPLACED:
                Logger.info('Transaction successfully canceled');
                setWaitingForTx(false);
                break;
            }
          } else {
            Logger.error('Unexpected error in getTransactionStatus', err);
          }
        });
    } catch (err: any) {
      Logger.error('getTransactionStatus failed', err);
    }
  };

  const cancelTransaction = async () => {
    const currentTransaction = transactionResponse;
    if (!currentTransaction) {
      setWaitingForTx(false);
      setCanceling(false);
      return;
    }
    const provider = await EthersUtils.getProvider(chain);
    setWaitingForTx(true);

    try {
      const cancelTransactionResponse = await EvmTransactionsUtils.send(
        activeAccount.wallet,
        {
          to: activeAccount.wallet.address,
          value: 0,
          data: ethers.ZeroHash,
          from: activeAccount.wallet.address,
          nonce: currentTransaction.nonce,
          chainId: chain.chainId,
          type: Number(increasedGasFee?.type ?? chain.defaultTransactionType),
        },
        increasedGasFee,
        chain.chainId,
        currentTransaction.nonce,
      );
      if (cancelTransactionResponse) {
        cancelTransactionResponse
          .wait()
          .then(async (cancelTransactionReceipt: TransactionReceipt | null) => {
            if (cancelTransactionReceipt) {
              const cancelTransactionResult = await provider.getTransaction(
                cancelTransactionReceipt.hash,
              );
              setTxReceipt(cancelTransactionReceipt);
              if (cancelTransactionResult) setTxResult(cancelTransactionResult);
            }
          })
          .catch((err) => {
            if (err.code === 'TRANSACTION_REPLACED') {
              setCanceling(false);
              setErrorMessage('evm_transaction_not_canceled_error');
            } else {
              Logger.error('cancelTransaction wait failed', err);
            }
          })
          .finally(() => {
            setWaitingForTx(false);
          });
      }
    } catch (err: any) {
      const error = EthersUtils.getErrorMessage(
        err.code,
        err.reason,
        err.shortMessage,
        err.message,
      );
      setErrorMessage(error.message);
      setCanceling(false);
      if (err.code === 'REPLACEMENT_UNDERPRICED') {
        setGasFeeEstimateLoading(Boolean(transactionData));
        setGasPanelOpened(true);
      }
    }
  };

  const speedUpTransaction = async () => {
    const currentTransaction = transactionResponse;
    if (!currentTransaction) {
      setWaitingForTx(false);
      setTransactionSpeedingUp(false);
      return;
    }
    const provider = await EthersUtils.getProvider(chain);
    try {
      const speedUpTransactionResponse = await EvmTransactionsUtils.send(
        activeAccount.wallet,
        {
          ...currentTransaction,
          from: activeAccount.wallet.address,
        },
        increasedGasFee,
        chain.chainId,
        currentTransaction.nonce,
      );

      if (speedUpTransactionResponse) {
        await speedUpTransactionResponse
          .wait()
          .then(
            async (speedUpTransactionReceipt: TransactionReceipt | null) => {
              if (speedUpTransactionReceipt) {
                const speedUpTransactionResult = await provider.getTransaction(
                  speedUpTransactionReceipt.hash,
                );
                setTxReceipt(speedUpTransactionReceipt);
                if (speedUpTransactionResult)
                  setTxResult(speedUpTransactionResult);
              }
            },
          )
          .catch((err) => {
            Logger.error('speedUpTransaction wait failed', err);
          })
          .finally(() => {
            setWaitingForTx(false);
          });
      }
    } catch (err: any) {
      const error = EthersUtils.getErrorMessage(
        err.code,
        err.reason,
        err.shortMessage,
        err.message,
      );
      setErrorMessage(error.message);
      setTransactionSpeedingUp(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return SVGIcons.EVM_TRANSACTION_STATUS_FINISHED;
      case 'pending':
      case 'canceling':
        return SVGIcons.EVM_TRANSACTION_STATUS_PROCESSING;
      case 'failed':
      case 'reverted':
      case 'canceled':
        return SVGIcons.EVM_TRANSACTION_STATUS_CANCELED;
      default:
        return SVGIcons.EVM_TRANSACTION_STATUS_PROCESSING;
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'popup_html_evm_transfer_status_success';
      case 'pending':
        return 'popup_html_evm_transfer_status_pending';
      case 'speeding':
        return 'popup_html_evm_transfer_status_speeding_up';
      case 'failed':
        return 'popup_html_evm_transfer_status_failed';
      case 'reverted':
        return 'evm_history_operation_reverted_status';
      case 'canceling':
        return 'popup_html_evm_transfer_status_canceling';
      case 'canceled':
        return 'popup_html_evm_transfer_status_canceled';
      default:
        return 'popup_html_evm_transfer_status_pending';
    }
  };

  const getStatus = () => {
    if (isSuccess) return 'success';
    if (isReverted) return 'reverted';
    if (isCanceled) return 'canceled';
    if (waitingForTx) {
      if (isCanceling) {
        return 'canceling';
      }
      if (isTransactionSpeedingUp) return 'speeding';
      return 'pending';
    }
    if (txReceipt) {
      if (isCanceling) {
        return 'canceled';
      } else if (txReceipt.status) return 'success';
      else return 'failed';
    }
    return 'pending';
  };

  const openBlock = (blockNumber: number) => {
    if (!chain.blockExplorer?.url) {
      return;
    }
    chrome.tabs.create({
      url: `${chain.blockExplorer.url}/block/${blockNumber}`,
    });
  };

  const openWallet = (walletAddress: string) => {
    if (!chain.blockExplorer?.url) {
      return;
    }
    chrome.tabs.create({
      url: `${chain.blockExplorer.url}/address/${walletAddress}`,
    });
  };

  const openTransaction = (tx: string) => {
    if (!chain.blockExplorer?.url) {
      return;
    }
    chrome.tabs.create({ url: `${chain.blockExplorer.url}/tx/${tx}` });
  };

  const confirmNewFee = () => {
    setGasPanelOpened(false);
    if (isCanceling) {
      cancelTransaction();
    } else if (isTransactionSpeedingUp) {
      speedUpTransaction();
    }
  };

  const closeFeePopup = () => {
    setTransactionSpeedingUp(false);
    setCanceling(false);
    setGasFeeEstimateLoading(false);
    setGasPanelOpened(false);
  };

  const getImage = async (value: string) => {
    if (!tokenInfo || !(tokenInfo as any).contractAddress) {
      return undefined;
    }

    const contract = new ethers.Contract(
      (tokenInfo as any).contractAddress,
      getAbiFromType(tokenInfo.type)!,
      await EthersUtils.getProvider(chain),
    );

    const metadata = await EvmNFTUtils.getMetadataFromTokenId(
      tokenInfo.type,
      Number(value).toString(),
      contract,
      chain,
      (tokenInfo as any).contractAddress,
    );

    return metadata.metadata.image;
  };

  const handleErrors = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setErrorMessage(error.message, error.params ?? []);
    }
  };

  const displayTx = txResult ?? transactionResponse ?? null;
  const displayBlockNumber = displayTx?.blockNumber;
  const displayData = displayTx?.data;
  const displayGasLimit = displayTx?.gasLimit;
  const displayGasPrice = displayTx?.gasPrice;
  const displayHash = displayTx?.hash;
  const displayMaxFeePerGas = displayTx?.maxFeePerGas;
  const displayMaxPriorityFeePerGas = displayTx?.maxPriorityFeePerGas;
  const displayTo = displayTx?.to;
  const hasMinedReceipt = Boolean(txReceipt?.gasUsed != null);

  const getMinedGasFeeDisplay = (): string => {
    if (!txReceipt?.gasUsed) {
      return I18nUtils.getMessage('popup_html_pending');
    }
    const receipt = txReceipt as TransactionReceipt & {
      effectiveGasPrice?: bigint | null;
    };
    const pricePerGas =
      receipt.gasPrice ?? receipt.effectiveGasPrice ?? undefined;
    if (pricePerGas != null && pricePerGas > BigInt(0)) {
      return formatNativeFeeFromWei(
        pricePerGas * txReceipt.gasUsed,
        TOTAL_FEE_FRACTION_DIGITS,
        chain.mainToken,
      );
    }
    return I18nUtils.getMessage('popup_html_pending');
  };

  const getPendingGasFeeDisplay = (): string => {
    if (gasFee && GasFeeUtils.hasDisplayableEstimatedFee(gasFee)) {
      return formatEstimatedNativeFeeFromEth(
        gasFee.estimatedFeeInEth,
        chain.mainToken,
      );
    }
    if (!displayTx) {
      return I18nUtils.getMessage('popup_html_pending');
    }
    const gl = displayGasLimit;
    const maxFeePerGas = displayMaxFeePerGas ?? displayGasPrice;
    if (
      gl != null &&
      maxFeePerGas != null &&
      gl > BigInt(0) &&
      maxFeePerGas > BigInt(0)
    ) {
      return formatNativeFeeFromWei(
        gl * maxFeePerGas,
        TOTAL_FEE_FRACTION_DIGITS,
        chain.mainToken,
      );
    }
    return I18nUtils.getMessage('popup_html_pending');
  };

  const statusForGasFeeLabel = getStatus();
  const gasFeeLabelKey =
    statusForGasFeeLabel === 'pending' ||
    statusForGasFeeLabel === 'speeding' ||
    statusForGasFeeLabel === 'canceling'
      ? 'popup_html_evm_gas_fee_estimated'
      : 'popup_html_evm_gas_fee';

  const gasFeeValueDisplay = hasMinedReceipt
    ? getMinedGasFeeDisplay()
    : getPendingGasFeeDisplay();

  const blockNumberDisplay =
    displayBlockNumber != null
      ? String(displayBlockNumber)
      : I18nUtils.getMessage('popup_html_pending');

  const showLegacyGasPriceRow =
    displayGasPrice != null &&
    displayMaxFeePerGas == null &&
    displayMaxPriorityFeePerGas == null;

  const showEip1559FeeRows =
    displayMaxFeePerGas != null || displayMaxPriorityFeePerGas != null;

  const txDataHex =
    displayData == null
      ? ''
      : typeof displayData === 'string'
        ? displayData
        : ethers.hexlify(displayData);

  const erc20TransferRecipient = decodeErc20TransferRecipient(
    txDataHex || null,
  );

  const syntheticToAddress =
    receiverAddress ??
    erc20TransferRecipient ??
    (!txDataHex.startsWith('0xa9059cbb')
      ? (displayTo ?? undefined)
      : undefined);

  const detailFieldsIncludeTo = detailFields?.some(
    (d: EvmUserHistoryItemDetail) =>
      d.label === 'popup_html_transfer_to' ||
      d.label === 'popup_html_evm_transaction_info_to' ||
      (d.label === 'evm_operation_smart_contract_address' &&
        d.value?.toLowerCase() === syntheticToAddress?.toLowerCase()),
  );

  const isCanceledHistoryOperation =
    pageTitle === 'evm_history_canceled_transaction';

  const showSyntheticToRow =
    syntheticToAddress != null &&
    !detailFieldsIncludeTo &&
    !isCanceledHistoryOperation &&
    !isReverted;

  const shouldShowStatusAmount =
    tokenInfo !== undefined && amount !== undefined && amount !== null;

  const shouldShowTransactionInfo =
    Boolean(displayTx) ||
    Boolean(detailFields?.length) ||
    Boolean(timestamp) ||
    shouldShowTokenType;
  const shouldShowTransactionMetadataRows =
    Boolean(displayTx) || Boolean(txReceipt) || Boolean(gasFee);

  const getTokenInfoFromAmount = (value?: string) => {
    if (tokenInfo) return tokenInfo;
    const symbol = value?.trim().split(/\s+/).pop();
    if (!symbol) return undefined;
    return activeAccount.nativeAndErc20Tokens.value.find(
      (token) =>
        token.tokenInfo.symbol.toLowerCase() === symbol.toLowerCase(),
    )?.tokenInfo;
  };

  const isAmountDetail = (detail: EvmUserHistoryItemDetail) =>
    detail.label === 'popup_html_transfer_amount' ||
    detail.type === EvmUserHistoryItemDetailType.TOKEN_AMOUNT;

  const smartContractAddressLabels = new Set([
    'evm_operation_smart_contract_address',
    'evm_history_smart_contract',
    'evm_created_smart_contract',
    'evm_smart_contract_address',
  ]);

  const isSmartContractAddressDetail = (detail: EvmUserHistoryItemDetail) =>
    detail.type === EvmUserHistoryItemDetailType.ADDRESS &&
    smartContractAddressLabels.has(detail.label);

  const renderCopiableAddress = (address: string) => (
    <EvmAddressComponent
      address={address}
      chainId={chain.chainId}
      canCopy
      localAccounts={localAccounts}
    />
  );

  const getAddressDetailClickAction = (detail: EvmUserHistoryItemDetail) => {
    if (isSmartContractAddressDetail(detail)) {
      return undefined;
    }
    return () => openWallet(detail.value!);
  };

  const tokenContractAddress =
    tokenInfo &&
    tokenInfo.type !== EVMSmartContractType.NATIVE &&
    'contractAddress' in tokenInfo
      ? tokenInfo.contractAddress
      : undefined;

  const renderCopiableContractLabel = (
    visibleLabel: string,
    contractAddress: string,
  ) => (
    <CustomTooltip
      message={contractAddress}
      skipTranslation
      additionalClassName="evm-address-tooltip">
      <span
        className="value-content evm-address-content address-content"
        onClick={(event) => {
          event.stopPropagation();
          void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
        }}>
        {visibleLabel}
      </span>
    </CustomTooltip>
  );

  const renderTokenAmount = (
    value: string | number,
    contractAddress?: string,
  ) => {
    const amountValue = value.toString().trim();
    const amountTokenInfo = getTokenInfoFromAmount(amountValue);
    const symbol = amountTokenInfo?.symbol;
    const resolvedContractAddress =
      contractAddress ??
      (amountTokenInfo && 'contractAddress' in amountTokenInfo
        ? amountTokenInfo.contractAddress
        : undefined);

    let displayedAmount = amountValue;
    let tokenLabel = symbol;
    if (symbol && amountValue.endsWith(` ${symbol}`)) {
      displayedAmount = amountValue.slice(0, -(` ${symbol}`).length);
      tokenLabel = symbol;
    }

    const isNativeToken =
      amountTokenInfo?.type === EVMSmartContractType.NATIVE ||
      Boolean(
        tokenLabel &&
          tokenLabel.toLowerCase() === chain.mainToken.toLowerCase(),
      );

    const showCopiableToken =
      Boolean(resolvedContractAddress) &&
      Boolean(tokenLabel) &&
      amountValue.includes(tokenLabel!) &&
      !isNativeToken;

    return (
      <div className="value-content-horizontal">
        {amountTokenInfo && <EvmTokenLogo tokenInfo={amountTokenInfo} />}
        {showCopiableToken ? (
          <>
            <span>{displayedAmount}</span>
            {displayedAmount.length > 0 ? ' ' : null}
            {renderCopiableContractLabel(tokenLabel!, resolvedContractAddress!)}
          </>
        ) : (
          <span>{amountValue}</span>
        )}
      </div>
    );
  };

  return (
    <div className="evm-transaction-result">
      <div className="tx-card">
        <div className="amount-panel">
          <SVGIcon
            icon={getStatusIcon(getStatus())}
            className={`transaction-status`}
          />
          <div className="amount-row">
            <div className="status">
              {I18nUtils.getMessage(getStatusLabel(getStatus()))}
            </div>
            {shouldShowStatusAmount && (
              renderTokenAmount(amount, tokenContractAddress)
            )}
            {warningMessage && <div className="warning">{warningMessage}</div>}
          </div>
        </div>
        {waitingForTx &&
          transactionResponse &&
          !isCanceling &&
          !isTransactionSpeedingUp && (
          <div className="buttons-panel">
            <ButtonComponent
              dataTestId="dialog_cancel-button"
              label={'dialog_cancel'}
              onClick={() => {
                setGasFeeEstimateLoading(Boolean(transactionData));
                setGasPanelOpened(true);
                setCanceling(true);
              }}
              type={ButtonType.ALTERNATIVE}
              height="small"></ButtonComponent>
            <ButtonComponent
              dataTestId="dialog_confirm-button"
              label={'popup_html_evm_speed_up_transaction'}
              onClick={() => {
                setGasFeeEstimateLoading(Boolean(transactionData));
                setGasPanelOpened(true);
                setTransactionSpeedingUp(true);
              }}
              type={ButtonType.IMPORTANT}
              height="small"></ButtonComponent>
          </div>
        )}
      </div>
      {isGasPanelOpened && (
        <PopupContainer
          useBodyPortal
          className="transaction-gas-fee-popup">
          <div className="title-panel">
            <div className="title">
              {I18nUtils.getMessage('popup_html_evm_transaction_select_fee')}
            </div>
            <SVGIcon
              icon={SVGIcons.TOP_BAR_CLOSE_BTN}
              onClick={() => closeFeePopup()}
            />
          </div>
          {isGasFeeEstimateLoading && (
            <div
              className="gas-fee-estimate-loading-row"
              data-testid="tx-result-gas-fee-loading">
              <div className="gas-fee-estimate-spinner" aria-hidden />
              <span>
                {I18nUtils.getMessage('popup_html_evm_gas_fee_loading')}
              </span>
            </div>
          )}
          <GasFeePanel
            chain={chain}
            fromAddress={localAccounts[0].wallet.address}
            onSelectFee={(value) => setIncreasedGasFee(value)}
            selectedFee={increasedGasFee}
            defaultFeeLevel="aggressive"
            multiplier={1.5}
            transactionType={chain.defaultTransactionType}
            transactionData={transactionData}
            setErrorMessage={handleErrors}
            onInitialEstimationComplete={() => setGasFeeEstimateLoading(false)}
          />
          <ButtonComponent
            label="popup_html_confirm"
            onClick={() => confirmNewFee()}
            height="small"
            disabled={isGasFeeEstimateLoading}
          />
        </PopupContainer>
      )}
      {shouldShowTransactionInfo && (
        <div className="transaction-info">
          {detailFields &&
            detailFields.map(
              (detail: EvmUserHistoryItemDetail, index: number) => (
                <React.Fragment key={`card-${index}`}>
                  {detail.type === EvmUserHistoryItemDetailType.BASE &&
                    !isAmountDetail(detail) && (
                      <SmallDataCardComponent
                        label={detail.label}
                        value={detail.value!}
                      />
                    )}
                  {detail.type === EvmUserHistoryItemDetailType.IMAGE && (
                    <SmallImageCardComponent
                      value={detail.imageUrl ?? getImage(detail.value!)}
                      name={detail.label}
                      contractAddress={detail.contractAddress}
                    />
                  )}
                  {detail.type === EvmUserHistoryItemDetailType.ADDRESS && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={renderCopiableAddress(detail.value!)}
                      valueOnClickAction={getAddressDetailClickAction(detail)}
                    />
                  )}
                  {isAmountDetail(detail) && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={renderTokenAmount(
                        detail.value,
                        detail.contractAddress,
                      )}
                    />
                  )}
                </React.Fragment>
              ),
            )}
          {showSyntheticToRow && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_to"
              value={renderCopiableAddress(syntheticToAddress!)}
              valueOnClickAction={() => openWallet(syntheticToAddress!)}
            />
          )}
          {timestamp && (
            <SmallDataCardComponent
              label="Time"
              skipLabelTranslation
              value={moment(timestamp).format('YYYY/MM/DD, hh:mm:ss a')}
            />
          )}
          {!isCanceledHistoryOperation && shouldShowTokenType && (
            <SmallDataCardComponent
              label="evm_nft_token_type"
              value={transactionTokenType}
            />
          )}
          {shouldShowTransactionMetadataRows && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_block_number"
              value={blockNumberDisplay}
              valueOnClickAction={
                displayBlockNumber != null
                  ? () => openBlock(Number(displayBlockNumber))
                  : undefined
              }
            />
          )}
          {displayHash && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_tx_hash"
              value={EvmFormatUtils.formatAddress(displayHash)}
              valueOnClickAction={() => openTransaction(displayHash)}
            />
          )}
          {shouldShowTransactionMetadataRows && (
            <SmallDataCardComponent
              label={gasFeeLabelKey}
              value={gasFeeValueDisplay}
              valueClassName="gas-fee-value"
            />
          )}
          {displayGasLimit != null && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_gas_limit"
              value={displayGasLimit.toString()}
            />
          )}
          {showLegacyGasPriceRow && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_gas_price"
              value={formatNativeFeeFromWei(
                displayGasPrice!,
                PER_GAS_FRACTION_DIGITS,
                chain.mainToken,
              )}
            />
          )}
          {showEip1559FeeRows && displayMaxPriorityFeePerGas != null && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_priority_fee"
              value={formatNativeFeeFromWei(
                displayMaxPriorityFeePerGas,
                PER_GAS_FRACTION_DIGITS,
                chain.mainToken,
              )}
            />
          )}
          {showEip1559FeeRows && displayMaxFeePerGas != null && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_total_fee_per_gas"
              value={formatNativeFeeFromWei(
                displayMaxFeePerGas,
                PER_GAS_FRACTION_DIGITS,
                chain.mainToken,
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    transactionResponse: state.navigation.stack[0].params.transactionResponse as
      | TransactionResponse
      | null
      | undefined,
    tokenInfo: state.navigation.stack[0].params
      .tokenInfo as EvmSmartContractInfo,
    amount: state.navigation.stack[0].params.amount,
    receiverAddress: state.navigation.stack[0].params.receiverAddress,
    gasFee: state.navigation.stack[0].params.gasFee,
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
    isCanceled: state.navigation.stack[0].params.isCanceled,
    isReverted: state.navigation.stack[0].params.isReverted,
    isSuccess: state.navigation.stack[0].params.isSuccess,
    pageTitle: state.navigation.stack[0].params.pageTitle,
    detailFields: state.navigation.stack[0].params.detailFields,
    transactionData: state.navigation.stack[0].params.transactionData,
    warningMessage: state.navigation.stack[0].params.warningMessage,
    initialDisplayNfts: state.navigation.stack[0].params.initialDisplayNfts,
    initialDisplayHistory:
      state.navigation.stack[0].params.initialDisplayHistory,
    opName: state.navigation.stack[0].params.opName as string | undefined,
    timestamp: state.navigation.stack[0].params.timestamp,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  loadEvmActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransactionResultComponent = connector(EvmTransactionResult);
