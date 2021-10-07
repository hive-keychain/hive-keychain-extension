import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './operation-popup.component.scss';

const OperationPopup = ({}: PropsFromRedux) => {
  return (
    <div className="operation-popup-page">
      <PageTitleComponent
        title="popup_html_operation_popup"
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

export const OperationPopupComponent = connector(OperationPopup);
