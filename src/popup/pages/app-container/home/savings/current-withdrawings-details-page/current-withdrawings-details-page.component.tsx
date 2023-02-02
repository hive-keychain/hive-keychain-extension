import { CurrentWithdrawingListItem } from '@interfaces/list-item.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { CurrentWithdrawItemComponent } from '@popup/pages/app-container/home/savings/current-withdrawings-details-page/current-withdrawings-item/current-withdrawings-item.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './current-withdrawings-details-page.component.scss';

interface CurrentWithdrawinsProps {
  currentWithdrawLabel?: string;
}

const CurrentWithdrawings = ({
  currentWithdrawingList,
  currentWithdrawLabel,
  setTitleContainerProperties,
}: PropsFromRedux & CurrentWithdrawinsProps) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_savings_current_withdrawing',
      isBackButtonEnabled: true,
    });
  });

  return (
    <div
      className="incoming-outgoing-page"
      aria-label="current-witdraw-savings-page">
      <div className="pending-disclaimer">
        {chrome.i18n.getMessage('popup_html_withdraw_savings_until_message')}
      </div>
      <div className="list-panel">
        <div className="list">
          {currentWithdrawingList.map((currentWithdrawItem) => {
            return (
              <CurrentWithdrawItemComponent
                key={currentWithdrawItem.request_id}
                item={currentWithdrawItem}
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
    currentWithdrawingList: state.navigation.stack[0].params
      .currentWithdrawingList as CurrentWithdrawingListItem[],
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CurrentWithdrawingsPageComponent = connector(CurrentWithdrawings);
