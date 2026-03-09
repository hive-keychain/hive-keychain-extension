import { RequestId, RequestPowerUp } from '@interfaces/keychain.interface';
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
  data: RequestPowerUp & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const PowerUp = (props: Props) => {
  const { data, rpc, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);

  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar
          title="dialog_account"
          username={anonymousProps.username}
        />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_powerup')}
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <UsernameWithAvatar title="dialog_to" username={data.recipient} />
      <Separator type={'horizontal'} fullSize />
      <AmountWithLogo
        title="dialog_amount"
        amount={FormatUtils.formatCurrencyValue(data.hive)}
        symbol={CurrencyUtils.getCurrencyLabel('HIVE', rpc.testnet)}
        icon={SVGIcons.WALLET_HIVE_LOGO}
      />
    </Operation>
  );
};

export default PowerUp;
