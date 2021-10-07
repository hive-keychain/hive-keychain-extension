import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './authorized-operations.component.scss';

const AuthorizedOperations = ({}: PropsFromRedux) => {
  return (
    <div className="authorized-operations-page">
      <PageTitleComponent
        title="popup_html_authorized_operations"
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

export const AuthorizedOperationsComponent = connector(AuthorizedOperations);
