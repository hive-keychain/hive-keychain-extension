import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EvmTokenInfoShortErc20 } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
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

const EvmTransactionResult = ({
  chain,
  transactionResponse,
  token,
  amount,
  receiverAddress,
  gasFee,
  localAccounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [waitingForTx, setWaitingForTx] = useState(true);
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt>();
  const [txResult, setTxResult] = useState<TransactionResponse>();

  const [isCanceled, setCanceled] = useState<boolean>(false);
  const [isTransactionSpeedingUp, setTransactionSpeedingUp] =
    useState<boolean>(false);
  const [isGasPanelOpened, setGasPanelOpened] = useState<boolean>(false);
  const [increasedGasFee, setIncreasedGasFee] =
    useState<GasFeeEstimation>(gasFee);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_funds',
      isBackButtonEnabled: true,
    });
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
        console.log({ transactionResult });
        setTxReceipt(transactionReceipt);
        if (transactionResult) setTxResult(transactionResult);
      }
    } catch (err) {
      console.log(err);
      if (!isCanceled) {
        // Display error message
      }
      setWaitingForTx(false);
    }
  };

  const cancelTransaction = async () => {
    setCanceled(true);
    setWaitingForTx(true);
    const cancelTransactionResponse = await EvmTransactionsUtils.cancel(
      transactionResponse,
      chain,
      gasFee,
      localAccounts[0].wallet,
    );
    try {
      await cancelTransactionResponse.wait();
      const cancelTransactionReceipt = await cancelTransactionResponse.wait();
      console.log({ canceltransactionReceipt: cancelTransactionReceipt });

      if (cancelTransactionReceipt) {
        const cancelTransactionResult = await EthersUtils.getProvider(
          chain,
        ).getTransaction(cancelTransactionReceipt.hash);
        console.log({ canceltransactionResult: cancelTransactionResult });
        setTxReceipt(cancelTransactionReceipt);
        if (cancelTransactionResult) setTxResult(cancelTransactionResult);
      }
    } catch (err) {
      console.log(err);
      // catch error
    }
    setWaitingForTx(false);
  };

  const speedUpTransaction = async () => {
    setTransactionSpeedingUp(true);
    setGasPanelOpened(false);
    console.log('speeding up transaction');

    const speedUpTransactionResponse = await EvmTransactionsUtils.transfer(
      chain,
      token,
      receiverAddress,
      amount,
      localAccounts[0].wallet,
      increasedGasFee,
      transactionResponse.nonce,
    );

    try {
      await speedUpTransactionResponse.wait();
      const speedUpTransactionReceipt = await speedUpTransactionResponse.wait();
      console.log({ speedUpTransactionReceipt: speedUpTransactionReceipt });

      if (speedUpTransactionReceipt) {
        const speedUpTransactionResult = await EthersUtils.getProvider(
          chain,
        ).getTransaction(speedUpTransactionReceipt.hash);
        console.log({ speedUpTransactionResult: speedUpTransactionResult });
        setTxReceipt(speedUpTransactionReceipt);
        if (speedUpTransactionResult) setTxResult(speedUpTransactionResult);
      }
    } catch (err) {
      console.log(err);
      // catch error
    }
    setWaitingForTx(false);
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
    if (waitingForTx) {
      if (isCanceled) {
        return 'canceling';
      }
      if (isTransactionSpeedingUp) return 'speeding';
      return 'pending';
    }
    if (txReceipt) {
      if (isCanceled) {
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

  return (
    <div className="evm-transaction-result">
      <div className="tx-card">
        <div className="amount-panel">
          <SVGIcon
            icon={getStatusIcon(getStatus())}
            className={`transaction-status`}
          />
          <div className="amount-row">
            <div className="amount">
              {FormatUtils.withCommas(
                amount,
                (token.tokenInfo as EvmTokenInfoShortErc20).decimals ?? 18,
                true,
              )}{' '}
              {token.tokenInfo.symbol}
            </div>
            <div className="status">
              {chrome.i18n.getMessage(getStatusLabel(getStatus()))}
            </div>
          </div>
        </div>
        {waitingForTx && (!isCanceled || isTransactionSpeedingUp) && (
          <div className="buttons-panel">
            <ButtonComponent
              dataTestId="dialog_cancel-button"
              label={'dialog_cancel'}
              onClick={cancelTransaction}
              type={ButtonType.ALTERNATIVE}
              height="small"></ButtonComponent>
            <ButtonComponent
              dataTestId="dialog_confirm-button"
              label={'popup_html_evm_speed_up_transaction'}
              onClick={() => setGasPanelOpened(true)}
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
              onClick={() => setGasPanelOpened(false)}
            />
          </div>
          <GasFeePanel
            chain={chain}
            token={token}
            receiverAddress={receiverAddress}
            amount={amount}
            wallet={localAccounts[0].wallet}
            onSelectFee={(value) => setIncreasedGasFee(value)}
            selectedFee={increasedGasFee}
            multiplier={1.5}
          />
          <ButtonComponent
            label="popup_html_confirm"
            onClick={() => speedUpTransaction()}
            height="small"
          />
        </PopupContainer>
      )}
      {txResult && (
        <div className="transaction-info">
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_from"
            value={EvmFormatUtils.formatAddress(txResult.from!)}
            valueOnClickAction={() => openWallet(txResult.from)}
          />
          <SmallDataCardComponent
            label="popup_html_evm_transaction_info_to"
            value={EvmFormatUtils.formatAddress(receiverAddress)}
            valueOnClickAction={() => openWallet(receiverAddress)}
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
            label="popup_html_evm_transaction_info_gas_limit"
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
    token: state.navigation.stack[0].params.token as EVMToken,
    amount: state.navigation.stack[0].params.amount,
    receiverAddress: state.navigation.stack[0].params.receiverAddress,
    gasFee: state.navigation.stack[0].params.gasFee,
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransactionResultComponent = connector(EvmTransactionResult);
