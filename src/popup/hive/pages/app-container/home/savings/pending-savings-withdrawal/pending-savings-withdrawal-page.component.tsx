import { SavingsWithdrawal } from '@interfaces/savings.interface';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { PendingSavingsWithdrawalItemComponent } from 'src/popup/hive/pages/app-container/home/savings/pending-savings-withdrawal/pending-savings-withdrawal-item/pending-savings-withdrawal-item.component';
import { RootState } from 'src/popup/hive/store';

interface PendingSavingsWithdrawalProps {
  currentWithdrawLabel?: string;
}

const PendingSavingsWithdrawal = ({
  savingsPendingWithdrawalList,
  currency,
  setTitleContainerProperties,
}: PropsFromRedux & PendingSavingsWithdrawalProps) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_savings_current_withdrawing',
      isBackButtonEnabled: true,
    });
  });

  return (
    <div
      className="pending-savings-withdrawal-page"
      data-testid={`${Screen.PENDING_SAVINGS_WITHDRAWAL_PAGE}-page`}>
      <div className="pending-disclaimer">
        {chrome.i18n.getMessage('popup_html_withdraw_savings_until_message', [
          currency,
        ])}
      </div>
      <div className="list-panel">
        <div className="list">
          {savingsPendingWithdrawalList.map((currentWithdrawItem) => {
            return (
              <PendingSavingsWithdrawalItemComponent
                key={currentWithdrawItem.request_id}
                item={currentWithdrawItem}
                currency={currency}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    savingsPendingWithdrawalList: state.navigation.stack[0].params
      .savingsPendingWithdrawalList as SavingsWithdrawal[],
    currency: state.navigation.stack[0].params.currency as string,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingSavingsWithdrawalPageComponent = connector(
  PendingSavingsWithdrawal,
);
