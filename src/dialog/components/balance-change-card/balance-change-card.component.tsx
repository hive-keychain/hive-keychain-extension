import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';

interface Props {
  beforeBalance: string;
  afterBalance: string;
  insufficientBalance?: boolean;
}

export const BalanceChangeCard = ({
  beforeBalance,
  afterBalance,
  insufficientBalance,
}: Props) => {
  return (
    <Card className="balance-change-panel">
      <div className="balance-change-title">
        {chrome.i18n.getMessage('evm_balance_change_title')}
      </div>

      {insufficientBalance && (
        <span className="insufficient-balance">
          {chrome.i18n.getMessage('insufficient_balance_warning')}
        </span>
      )}

      <div className="balance-panel">
        <div className="balance-before">{beforeBalance}</div>
        <SVGIcon icon={SVGIcons.GLOBAL_TRIANGLE_ARROW} className="icon" />
        <div className="balance-after">{afterBalance}</div>
      </div>
    </Card>
  );
};
