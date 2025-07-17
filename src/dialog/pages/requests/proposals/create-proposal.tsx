import {
  RequestCreateProposal,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import CurrencyUtils from '@popup/hive/utils/currency.utils';
import React from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestCreateProposal & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const CreateProposal = (props: Props) => {
  const { data, rpc } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_create_proposal')}
      {...props}>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <UsernameWithAvatar title="dialog_receiver" username={data.receiver} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_title" content={data.subject} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_permlink" content={data.permlink} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_period"
        content={`${data.start.split('T')[0]} - ${data.end.split('T')[0]}`}
      />
      <Separator type={'horizontal'} fullSize />
      <AmountWithLogo
        title="dialog_daily_pay"
        amount={data.daily_pay}
        symbol={CurrencyUtils.getCurrencyLabel('HBD', rpc.testnet)}
        icon={SVGIcons.WALLET_HBD_LOGO}
        iconPosition="right"
      />
    </Operation>
  );
};

export default CreateProposal;
