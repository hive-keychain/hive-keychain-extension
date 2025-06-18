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
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { TransactionReceipt, TransactionResponse, ethers } from 'ethers';
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

const EvmTransactionResult = ({
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
  setTitleContainerProperties,
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
    console.log(tokenInfo);
    getTransactionStatus();
  }, []);

  const getTransactionStatus = async () => {
    try {
      const transactionReceipt = await transactionResponse.wait();
      console.log({ transactionReceipt });
      if (transactionReceipt) {
        const transactionResult = await EthersUtils.getProvider(
          chain,
        ).getTransaction(transactionReceipt.hash);
        setTxReceipt(transactionReceipt);
        console.log({ transactionResult });
        if (transactionResult) setTxResult(transactionResult);
      }
    } catch (err) {
      if (!isCanceling && !isTransactionSpeedingUp) {
        Logger.error(`Error while broadcasting`, err);
        // Display error message
      } else {
        Logger.info('Transaction replaced');
      }
    } finally {
      setWaitingForTx(false);
    }
  };

  const cancelTransaction = async () => {
    setWaitingForTx(true);
    const cancelTransactionResponse = await EvmTransactionsUtils.cancel(
      transactionResponse,
      chain,
      gasFee,
      localAccounts[0].wallet,
      amount,
      tokenInfo,
      receiverAddress,
      EvmTransactionType.EIP_1559,
    );
    try {
      await cancelTransactionResponse.wait();
      const cancelTransactionReceipt = await cancelTransactionResponse.wait();

      if (cancelTransactionReceipt) {
        const cancelTransactionResult = await EthersUtils.getProvider(
          chain,
        ).getTransaction(cancelTransactionReceipt.hash);
        setTxReceipt(cancelTransactionReceipt);
        if (cancelTransactionResult) setTxResult(cancelTransactionResult);
      }
    } catch (err) {
      Logger.error(`Error while canceling`, err);
      // catch error
    } finally {
      setWaitingForTx(false);
    }
  };

  const speedUpTransaction = async () => {
    const speedUpTransactionResponse = await EvmTransactionsUtils.transfer(
      chain,
      tokenInfo,
      receiverAddress,
      amount,
      localAccounts[0].wallet,
      increasedGasFee,
      transactionResponse.nonce,
    );

    try {
      const speedUpTransactionReceipt = await speedUpTransactionResponse.wait();

      if (speedUpTransactionReceipt) {
        const speedUpTransactionResult = await EthersUtils.getProvider(
          chain,
        ).getTransaction(speedUpTransactionReceipt.hash);
        setTxReceipt(speedUpTransactionReceipt);
        if (speedUpTransactionResult) setTxResult(speedUpTransactionResult);
      }
    } catch (err) {
      Logger.error(`Error while speeding up`, err);
      // catch error
    } finally {
      setWaitingForTx(false);
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
    chrome.tabs.create({ url: `${chain.blockExplorer?.url}/tx/${tx}` });
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

  return (
    <div className="evm-transaction-result">
      <div className="tx-card">
        <div className="amount-panel">
          <SVGIcon
            icon={getStatusIcon(getStatus())}
            className={`transaction-status`}
          />
          <div className="amount-row">
            {tokenInfo && (
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
                      value={detail.value}
                    />
                  )}
                  {detail.type === EvmUserHistoryItemDetailType.IMAGE && (
                    <SmallImageCardComponent
                      value={detail.value}
                      name={detail.label}
                    />
                  )}
                  {detail.type === EvmUserHistoryItemDetailType.ADDRESS && (
                    <SmallDataCardComponent
                      label={detail.label}
                      value={
                        <EvmAddressComponent
                          address={detail.value}
                          chainId={chain.chainId}
                        />
                      }
                      valueOnClickAction={() => openWallet(detail.value)}
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
          {/* {txResult.from && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_from"
              value={EvmFormatUtils.formatAddress(txResult.from!)}
              valueOnClickAction={() => openWallet(txResult.from)}
            />
          )} */}
          {/* {receiverAddress && (
            <SmallDataCardComponent
              label="popup_html_evm_transaction_info_to"
              value={EvmFormatUtils.formatAddress(receiverAddress)}
              valueOnClickAction={() => openWallet(receiverAddress)}
            />
          )} */}
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
  console.log(state);
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
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransactionResultComponent = connector(EvmTransactionResult);
