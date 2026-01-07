import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { RequestId, RequestTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import React, { useEffect, useState } from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import { useTransferCheck } from 'src/dialog/hooks/transfer-check';
import CurrencyUtils, {
  BaseCurrencies,
} from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
  afterCancel: (requestId: number, tab: number) => void;
};

const Transfer = (props: Props) => {
  const [beforeBalance, setBeforeBalance] = useState<string>('');
  const [afterBalance, setAfterBalance] = useState<string>('');
  const [insufficientBalance, setInsufficientBalance] =
    useState<boolean>(false);
  const { data, accounts, rpc } = props;
  const { memo } = data;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const header = useTransferCheck(data, rpc);
  const currencyLabel = CurrencyUtils.getCurrencyLabel(
    data.currency,
    rpc.testnet,
  );
  let memoField = memo;
  if (memo.length) {
    if (memo.startsWith('#')) {
      memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
    }
  } else {
    memoField = chrome.i18n.getMessage('popup_empty');
  }

  useEffect(() => {
    initBalance();
  }, []);

  const initBalance = async () => {
    if (data.username) {
      const account = await AccountUtils.getExtendedAccount(data.username);
      const balanceNumber = parseFloat(
        (
          (data.currency.toLowerCase() === BaseCurrencies.HIVE
            ? account.balance
            : account.hbd_balance) as string
        ).split(' ')[0],
      );
      setBeforeBalance(
        `${FormatUtils.formatCurrencyValue(balanceNumber)} ${currencyLabel}`,
      );
      setAfterBalance(
        `${FormatUtils.formatCurrencyValue(
          balanceNumber - parseFloat(data.amount),
        )} ${currencyLabel}`,
      );
      setInsufficientBalance(balanceNumber - parseFloat(data.amount) < 0);
    }
  };

  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar title={'dialog_account'} username={data.username} />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_transfer')}
      header={header}
      redHeader
      bottomPanel={
        <>
          {beforeBalance && afterBalance && (
            <BalanceChangeCard
              beforeBalance={beforeBalance}
              afterBalance={afterBalance}
              insufficientBalance={insufficientBalance}
            />
          )}
        </>
      }
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
      {/* <RequestBalance
        username={anonymousProps.username}
        rpc={props.rpc}
        amount={parseFloat(data.amount)}
        currency={data.currency}
      /> */}
      {data.memo && data.memo.length ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_memo" content={`${memoField}`} />
        </>
      ) : (
        <></>
      )}
    </Operation>
  );
};

export default Transfer;
