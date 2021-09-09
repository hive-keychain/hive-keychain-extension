import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

export interface TransferInfo {
  amount: string;
  memo: string;
  receiver: string;
  sender: string;
  frequency: number;
  iteration: number;
  isRecurrent: boolean;
}

const TransferConfirmationPage = ({}: PropsType) => {
  return (
    <div className="transfer-confirmation-page">
      <PageTitleComponent
        title="popup_html_confirm"
        isBackButtonEnabled={true}
      />
      <div className="line">
        <div className="label"></div>
        <div className="value"></div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & TransferInfo;

export const TransferConfirmationPageComponent = connector(
  TransferConfirmationPage,
);
