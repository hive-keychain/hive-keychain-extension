import Operation from '@dialog/hive/operation/operation';
import { RequestId, RequestSavings } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import { SavingOperationType } from 'src/popup/hive/pages/app-container/home/savings/savings-operation-type.enum';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestSavings & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
  afterCancel: (requestId: number, tab: number) => void;
};

const Savings = (props: Props) => {
  const { data, rpc, accounts } = props;
  const { memo } = data;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const isDeposit = data.operation === 'deposit';
  const currencyLabel = CurrencyUtils.getCurrencyLabel(
    data.currency,
    rpc.testnet,
  );
  const amountLabel = `${FormatUtils.formatCurrencyValue(data.amount)} ${
    data.currency
  }`;
  const memoLabel = memo?.startsWith('#')
    ? `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`
    : memo;
  const savingOperationType = isDeposit
    ? SavingOperationType.DEPOSIT
    : SavingOperationType.WITHDRAW;
  const warningMessage =
    TransferUtils.getTransferFromToSavingsValidationWarning(
      data.to,
      savingOperationType,
    );

  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar title="dialog_account" username={data.username} />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage(
        isDeposit ? 'popup_html_deposit_param' : 'popup_html_withdraw_param',
        [currencyLabel],
      )}
      header={
        warningMessage ||
        chrome.i18n.getMessage(
          isDeposit
            ? 'popup_html_confirm_savings_deposit'
            : 'popup_html_confirm_savings_withdraw',
          [amountLabel],
        )
      }
      redHeader={!!warningMessage}
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <UsernameWithAvatar title="dialog_to" username={data.to} />
      <Separator type={'horizontal'} fullSize />
      <AmountWithLogo
        title="dialog_amount"
        amount={FormatUtils.formatCurrencyValue(data.amount)}
        symbol={currencyLabel}
        icon={
          currencyLabel === 'HIVE'
            ? SVGIcons.WALLET_HIVE_LOGO
            : SVGIcons.WALLET_HBD_LOGO
        }
      />
      {memo?.length ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_memo" content={`${memoLabel}`} />
        </>
      ) : (
        <></>
      )}
    </Operation>
  );
};

export default Savings;
