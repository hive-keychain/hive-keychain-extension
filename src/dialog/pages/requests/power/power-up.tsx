import { RequestId, RequestPowerUp } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import CurrencyUtils from 'src/utils/currency.utils';

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
      <RequestItem title="dialog_to" content={`@${data.recipient}`} />
      <RequestItem
        title="dialog_amount"
        content={`${data.hive} ${CurrencyUtils.getCurrencyLabel(
          'HIVE',
          rpc.testnet,
        )}`}
      />
    </Operation>
  );
};

export default PowerUp;
