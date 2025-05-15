import { RequestConvert, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

type Props = {
  data: RequestConvert & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const Convert = (props: Props) => {
  const { data, rpc } = props;
  const unit = CurrencyUtils.getCurrencyLabel(
    data.collaterized ? 'HIVE' : 'HBD',
    rpc.testnet,
  );
  return (
    <Operation
      title={chrome.i18n.getMessage(
        data.collaterized
          ? 'popup_html_proposal_funded_option_hive'
          : 'popup_html_proposal_funded_option_hbd',
      )}
      header={
        data.collaterized
          ? chrome.i18n.getMessage(`popup_html_convert_hive_intro`, [
              data.amount,
            ])
          : chrome.i18n.getMessage(`popup_html_convert_hbd_intro`)
      }
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_amount"
        content={`${FormatUtils.formatCurrencyValue(data.amount)} ${unit}`}
      />
    </Operation>
  );
};

export default Convert;
