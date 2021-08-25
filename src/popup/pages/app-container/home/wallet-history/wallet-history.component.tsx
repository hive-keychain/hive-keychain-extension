import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const WalletHistory = ({}: PropsFromRedux) => {
  return (
    <div className="wallet-history-page">
      <PageTitleComponent
        title="popup_html_wallet_history"
        isBackButtonEnabled={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletHistoryComponent = connector(WalletHistory);
