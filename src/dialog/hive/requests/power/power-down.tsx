import { RequestId, RequestPowerDown } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestPowerDown & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const PowerDown = (props: Props) => {
  const { data, rpc } = props;

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_powerdown')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_amount"
        content={`${FormatUtils.formatCurrencyValue(
          data.hive_power,
        )} ${CurrencyUtils.getCurrencyLabel('HP', rpc.testnet)}`}
      />
    </Operation>
  );
};

export default PowerDown;
