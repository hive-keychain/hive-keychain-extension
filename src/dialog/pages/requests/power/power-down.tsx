import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { RequestId, RequestPowerDown } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

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
      <RequestItem
        title="dialog_amount"
        content={`${data.hive_power} ${CurrencyUtils.getCurrencyLabel(
          'HP',
          rpc.testnet,
        )}`}
      />
    </Operation>
  );
};

export default PowerDown;
