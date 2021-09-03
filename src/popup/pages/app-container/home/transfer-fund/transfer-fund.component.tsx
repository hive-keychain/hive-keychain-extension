import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import FormatUtils from 'src/utils/format.utils';

const TransferFunds = ({ activeAccount }: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState(0.0);
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [memo, setMemo] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);

  const setAmountToMaxValue = () => {
    setAmount(50);
  };

  return (
    <div className="transfer-funds-page">
      <PageTitleComponent
        title="popup_html_transfer_funds"
        isBackButtonEnabled={true}
      />

      <div className="balance-panel">
        <div className="balance-label">
          {chrome.i18n.getMessage('popup_html_balance', selectedCurrency)}
        </div>
        <div className="balance-value">
          {FormatUtils.formatCurrencyValue(
            activeAccount.account.savings_balance,
          )}
        </div>
      </div>

      <InputComponent
        type={InputType.TEXT}
        logo="arobase"
        placeholder="popup_html_username"
        value={receiverUsername}
        onChange={setReceiverUsername}
      />
      <InputComponent
        type={InputType.NUMBER}
        placeholder="0.000"
        skipTranslation={true}
        value={amount}
        onChange={setAmount}
      />
      <div className="send-max-link" onClick={setAmountToMaxValue}>
        {chrome.i18n.getMessage('popup_html_forgot')}
      </div>
      <InputComponent
        type={InputType.TEXT}
        placeholder="popup_html_memo_optional"
        value={memo}
        onChange={setMemo}
      />
      <SwitchComponent
        title="popup_html_recurrent_transfer"
        checked={isRecurrent}
        onChange={setIsRecurrent}></SwitchComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TransferFundsComponent = connector(TransferFunds);
