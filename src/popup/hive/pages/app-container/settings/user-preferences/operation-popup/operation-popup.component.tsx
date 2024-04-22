import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const OperationPopup = ({}: PropsFromRedux) => {
  return (
    <div
      className="operation-popup-page"
      data-testid={`${Screen.SETTINGS_OPERATION_POPUP}-page`}>
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
