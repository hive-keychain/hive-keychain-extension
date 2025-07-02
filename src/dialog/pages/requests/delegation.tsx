import { RequestDelegation, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestDelegation & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const Delegation = (props: Props) => {
  const { data, accounts, rpc } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const currencyLabel = CurrencyUtils.getCurrencyLabel(data.unit, rpc.testnet);
  const renderUsername = () => {
    return !accounts && data.username ? (
      <UsernameWithAvatar title={'dialog_account'} username={data.username} />
    ) : (
      <></>
    );
  };
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_delegation')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <Separator type={'horizontal'} fullSize />
      <UsernameWithAvatar title="dialog_delegatee" username={data.delegatee} />
      <Separator type={'horizontal'} fullSize />
      <AmountWithLogo
        title="dialog_amount"
        amount={FormatUtils.formatCurrencyValue(data.amount)}
        symbol={currencyLabel}
        iconPosition="right"
        icon={
          currencyLabel === 'HIVE'
            ? SVGIcons.WALLET_HIVE_LOGO
            : SVGIcons.WALLET_HBD_LOGO
        }
      />
    </Operation>
  );
};

export default Delegation;
