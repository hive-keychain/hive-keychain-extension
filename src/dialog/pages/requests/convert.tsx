import { RequestConvert, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestConvert & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const Convert = (props: Props) => {
  const { data, rpc } = props;
  const currencyLabel = CurrencyUtils.getCurrencyLabel(
    data.collaterized ? 'HIVE' : 'HBD',
    rpc.testnet,
  );
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
      <UsernameWithAvatar title="dialog_account" username={data.username} />
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

export default Convert;
