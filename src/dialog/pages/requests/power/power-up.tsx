import { RequestId, RequestPowerUp } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

type Props = {
  data: RequestPowerUp & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const PowerUp = (props: Props) => {
  const { data, rpc } = props;

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_powerup')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_to" content={`@${data.recipient}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_amount"
        content={`${FormatUtils.formatCurrencyValue(
          data.hive,
        )} ${CurrencyUtils.getCurrencyLabel('HIVE', rpc.testnet)}`}
      />
    </Operation>
  );
};

export default PowerUp;
