import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';
import type { BalanceDetails, BalanceInfo } from './balance-change-card.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  balanceInfo: BalanceInfo;
}

export const BalanceChangeCard = ({ balanceInfo }: Props) => {
  const balanceRows = [balanceInfo.mainBalance, balanceInfo.feeBalance].filter(
    (balance): balance is BalanceDetails => !!balance,
  );
  const insufficientBalance = balanceRows.find(
    (balance) => balance.insufficientBalance,
  );

  return (
    <Card className="balance-change-panel">
      <div className="balance-change-title">
        {I18nUtils.getMessage('evm_balance_change_title')}
      </div>

      {insufficientBalance ? (
        <div className="insufficient-balance">
          {I18nUtils.getMessage('evm_insufficient_token_balance', [
            insufficientBalance.symbol,
          ])}
        </div>
      ) : (
        <div className="balance-change-rows">
          {balanceRows.map((balance, index) => (
            <React.Fragment key={`${balance.before}-${index}`}>
              <div className="balance-before">{balance.before}</div>
              <SVGIcon
                icon={SVGIcons.GLOBAL_TRIANGLE_ARROW}
                className="icon"
              />
              <div className="balance-after">{balance.estimatedAfter}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </Card>
  );
};
