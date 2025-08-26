import { EvmAddressComponent } from '@common-ui/evm/evm-address/evm-address.component';
import { SmallImageCardComponent } from '@common-ui/small-data-card/small-image-card.component';
import {
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { getAbiFromType } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import {
  HDNodeWallet,
  TransactionReceipt,
  TransactionResponse,
  Wallet,
  ethers,
} from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SmallDataCardComponent } from 'src/common-ui/small-data-card/small-data-card.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

enum ReplacedTransactionReason {
  REPRICED = 'repriced',
  CANCELLED = 'cancelled',
  REPLACED = 'replaced',
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
  pageTitle,
  detailFields,
  evmPrices,
  transactionData,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const [waitingForTx, setWaitingForTx] = useState(true);
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt>();
  const [txResult, setTxResult] = useState<TransactionResponse>();

  const [isCanceling, setCanceling] = useState<boolean>(false);
  const [isTransactionSpeedingUp, setTransactionSpeedingUp] =
    useState<boolean>(false);
  const [isGasPanelOpened, setGasPanelOpened] = useState<boolean>(false);
  const [increasedGasFee, setIncreasedGasFee] =
    useState<GasFeeEstimationBase>(gasFee);

  useEffect(() => {
    setTitleContainerProperties({
      title: pageTitle,
      isBackButtonEnabled: true,
    });
    getTransactionStatus();
  }, []);

  const getTransactionStatus = async () => {
    try {
      await transactionResponse
        .wait()
        .then(async (transactionReceipt: TransactionReceipt | null) => {
          console.log('receipt', transactionReceipt);
          if (transactionReceipt) {
            const transactionResult = await EthersUtils.getProvider(
              chain,
            ).getTransaction(transactionReceipt.hash);
            setTxReceipt(transactionReceipt);
            if (transactionResult) setTxResult(transactionResult);
          }
        })
        .catch((err) => {
          if (err.reason) {
            switch (err.reason) {
              case ReplacedTransactionReason.REPRICED:
                Logger.info('Transaction successfully sped up');
                break;
              case ReplacedTransactionReason.CANCELLED:
              case ReplacedTransactionReason.REPLACED:
                Logger.info('Transaction successfully canceled');
                break;
            }
          } else {
            console.log('Catch in getTransactionStatus', { err });
          }
        })
        .finally(() => {
          setWaitingForTx(false);
        });
    } catch (err: any) {
      console.log('catch in get transaction status', err);
    }
  };

  const cancelTransaction = async () => {
    setWaitingForTx(true);

    try {
      const cancelTransactionResponse = await EvmTransactionsUtils.send(
        activeAccount.wallet,
        {
          to: activeAccount.wallet.address,
          value: 0,
          data: ethers.ZeroHash,
          from: activeAccount.wallet.address,
          nonce: transactionResponse.nonce,
          chainId: chain.chainId,
          type: Number(EvmTransactionType.EIP_1559),
        },
        increasedGasFee,
        chain.chainId,
        transactionResponse.nonce,
      );
      if (cancelTransactionResponse) {
        cancelTransactionResponse
          .wait()
          .then(async (cancelTransactionReceipt: TransactionReceipt | null) => {
            console.log('cancelTransactionReceipt', cancelTransactionReceipt);
            if (cancelTransactionReceipt) {
              const cancelTransactionResult = await EthersUtils.getProvider(
                chain,
              ).getTransaction(cancelTransactionReceipt.hash);
              setTxReceipt(cancelTransactionReceipt);
              if (cancelTransactionResult) setTxResult(cancelTransactionResult);
            }
          })
          .catch((err) => {
            console.log('Catch in transaction cancel', { err });
            if (err.code === 'TRANSACTION_REPLACED') {
              setCanceling(false);
              setErrorMessage('evm_transaction_not_canceled_error');
            }
          })
          .finally(() => {
            setWaitingForTx(false);
          });
      }
    } catch (err: any) {
      console.log('Catch in send transaction cancel', { err });
      setErrorMessage(EthersUtils.getErrorMessage(err.code));
      setCanceling(false);
      if (err.code === 'REPLACEMENT_UNDERPRICED') {
        setGasPanelOpened(true);
      }
    }
  };

  const speedUpTransaction = async () => {
    try {
      const speedUpTransactionResponse = await EvmTransactionsUtils.send(
        activeAccount.wallet,
        {
          ...transactionResponse,
          from: activeAccount.wallet.address,
        },
        increasedGasFee,
        chain.chainId,
        transactionResponse.nonce,
      );

      if (speedUpTransactionResponse) {
        await speedUpTransactionResponse
          .wait()
          .then(
            async (speedUpTransactionReceipt: TransactionReceipt | null) => {
              console.log(
                'speedUpTransactionReceipt',
                speedUpTransactionReceipt,
              );
              if (speedUpTransactionReceipt) {
                const speedUpTransactionResult = await EthersUtils.getProvider(
                  chain,
                ).getTransaction(speedUpTransactionReceipt.hash);
                setTxReceipt(speedUpTransactionReceipt);
                if (speedUpTransactionResult)
                  setTxResult(speedUpTransactionResult);
              }
            },
          )
          .catch((err) => {
            console.log('Catch in transaction speed up', { err });
          });
      }
    } catch (err: any) {
      console.log('Catch in send transaction speed up', { err });
      setErrorMessage(EthersUtils.getErrorMessage(err.code));
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
      case 'canceling':
        return 'popup_html_evm_transfer_status_canceling';
      case 'canceled':
        return 'popup_html_evm_transfer_status_canceled';
      default:
        return 'popup_html_evm_transfer_status_pending';
    }
  };

  const getStatus = () => {
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
    chrome.tabs.create({
      url: `${chain.blockExplorer?.url}/block/${blockNumber}`,
    });
  };

  const openWallet = (walletAddress: string) => {
    chrome.tabs.create({
      url: `${chain.blockExplorer?.url}/address/${walletAddress}`,
    });
  };

  const openTransaction = (tx: string) => {
    navigator.clipboard.writeText(tx!.toString());
    // chrome.tabs.create({ url: `${chain.blockExplorer?.url}/tx/${tx}` });
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
    setGasPanelOpened(false);
  };

  const getImage = async (value: string) => {
    const connectedWallet = new Wallet(
      HDNodeWallet.fromPhrase(
        activeAccount?.wallet.mnemonic?.phrase!,
      ).signingKey,
      EthersUtils.getProvider(chain),
    );

    const contract = new ethers.Contract(
      (tokenInfo as any).address,
      getAbiFromType(tokenInfo.type)!,
      connectedWallet,
    );

    const metadata = await EvmNFTUtils.getMetadataFromTokenId(
      tokenInfo.type,
      Number(value).toString(),
      contract,
    );

    return metadata.metadata.image;
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
            {!txResult && !waitingForTx && tokenInfo && (
              <div className="amount">
                {amount
                  ? FormatUtils.withCommas(
                      amount,
                      (tokenInfo as EvmSmartContractInfoErc20).decimals ?? 18,
                      true,
                    )
                  : 1}{' '}
                {tokenInfo.symbol}
              </div>
            )}
            <div className="status">
              {chrome.i18n.getMessage(getStatusLabel(getStatus()))}
            </div>
          </div>
        </div>
        {waitingForTx && !isCanceling && !isTransactionSpeedingUp && (
          <div className="buttons-panel">
            <ButtonComponent
              dataTestId="dialog_cancel-button"
              label={'dialog_cancel'}
              onClick={() => {
                setGasPanelOpened(true);
                setCanceling(true);
              }}
              type={ButtonType.ALTERNATIVE}
              height="small"></ButtonComponent>
            <ButtonComponent
              dataTestId="dialog_confirm-button"
              label={'popup_html_evm_speed_up_transaction'}
              onClick={() => {
                setGasPanelOpened(true);
                setTransactionSpeedingUp(true);
              }}
              type={ButtonType.IMPORTANT}
              height="small"></ButtonComponent>
          </div>
        )}
      </div>
      {isGasPanelOpened && (
        <PopupContainer>
          <div className="title-panel">
            <div className="title">
              {chrome.i18n.getMessage('popup_html_evm_transaction_select_fee')}
            </div>
            <SVGIcon
              icon={SVGIcons.TOP_BAR_CLOSE_BTN}
              onClick={() => closeFeePopup()}
            />
          </div>
          <GasFeePanel
            chain={chain}
            tokenInfo={tokenInfo}
            wallet={localAccounts[0].wallet}
            onSelectFee={(value) => setIncreasedGasFee(value)}
            selectedFee={increasedGasFee}
            multiplier={1.5}
            transactionType={chain.defaultTransactionType}
            prices={evmPrices}
            transactionData={transactionData}
            setErrorMessage={setErrorMessage}
          />
          <ButtonComponent
            label="popup_html_confirm"
            onClick={() => confirmNewFee()}
            height="small"
          />
        </PopupContainer>
      )}
      {txResult && (
        <div className="transaction-info">
          {detailFields &&
            detailFields.map(
              (detail: EvmUserHistoryItemDetail, index: number) => (
                <React.Fragment key={`card-${index}`}>
                  {detail.type === EvmUserHistoryItemDetailType.BASE && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={detail.value!}
                    />
                  )}
                  {detail.type === EvmUserHistoryItemDetailType.IMAGE && (
                    <SmallImageCardComponent
                      value={getImage(detail.value!)}
                      name={detail.label}
                    />
                  )}
                  {detail.type === EvmUserHistoryItemDetailType.ADDRESS && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={
                        <EvmAddressComponent
                          address={detail.value!}
                          chainId={chain.chainId}
                        />
                      }
                      valueOnClickAction={() => openWallet(detail.value!)}
                    />
                  )}
                  {detail.type ===
                    EvmUserHistoryItemDetailType.TOKEN_AMOUNT && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={
                        <div className="value-content-horizontal">
                          {tokenInfo && <EvmTokenLogo tokenInfo={tokenInfo} />}
                          {detail.value}
                        </div>
                      }
                    />
                  )}
                </React.Fragment>
              ),
            )}
          <SmallDataCardComponent
            label="evm_nft_token_type"
            value={tokenInfo ? tokenInfo.type : 'unknown'}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_block_number"
            value={txResult.blockNumber!}
            valueOnClickAction={() => openBlock(txResult.blockNumber!)}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_tx_hash"
            value={EvmFormatUtils.formatAddress(txResult.hash)}
            valueOnClickAction={() => openTransaction(txResult.hash)}
          />
          <SmallDataCardComponent
            label="popup_html_evm_gas_fee"
            value={`${ethers.formatEther(
              txReceipt?.gasPrice! * txReceipt?.gasUsed!,
            )} ${chain.mainToken}`}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_gas_limit"
            value={txResult.gasLimit.toString()!}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_gas_price"
            value={`${EvmFormatUtils.etherToGwei(txResult.gasPrice!)} Gwei`}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_priority_fee"
            value={`${EvmFormatUtils.etherToGwei(
              txResult.maxPriorityFeePerGas!,
            )} Gwei`}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_total_fee_per_gas"
            value={`${EvmFormatUtils.etherToGwei(txResult.maxFeePerGas!)} Gwei`}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    transactionResponse: state.navigation.stack[0].params
      .transactionResponse as TransactionResponse,
    tokenInfo: state.navigation.stack[0].params
      .tokenInfo as EvmSmartContractInfo,
    amount: state.navigation.stack[0].params.amount,
    receiverAddress: state.navigation.stack[0].params.receiverAddress,
    gasFee: state.navigation.stack[0].params.gasFee,
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
    isCanceled: state.navigation.stack[0].params.isCanceled,
    pageTitle: state.navigation.stack[0].params.pageTitle,
    detailFields: state.navigation.stack[0].params.detailFields,
    evmPrices: state.evm.prices,
    transactionData: state.navigation.stack[0].params.transactionData,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransactionResultComponent = connector(EvmTransactionResult);
