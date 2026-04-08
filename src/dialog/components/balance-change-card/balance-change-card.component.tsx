import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';
import type { BalanceInfo } from './balance-change-card.interface';

interface Props {
  balanceInfo: BalanceInfo;
}

export const BalanceChangeCard = ({ balanceInfo }: Props) => {
  const { mainBalance } = balanceInfo;

  return (
    <Card className="balance-change-panel">
      <div className="balance-change-title">
        {chrome.i18n.getMessage('evm_balance_change_title')}
      </div>

      {mainBalance.insufficientBalance && (
        <span className="insufficient-balance">
          {chrome.i18n.getMessage('insufficient_balance_warning')}
        </span>
      )}

      <div className="balance-panel">
        <div className="balance-before">{mainBalance.before}</div>
        <SVGIcon icon={SVGIcons.GLOBAL_TRIANGLE_ARROW} className="icon" />
        <div className="balance-after">{mainBalance.estimatedAfter}</div>
      </div>
    </Card>
  );
};
