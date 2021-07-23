import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './clear-all-data.component.scss';

const ClearAllData = ({}: PropsFromRedux) => {
  return (
    <div className="actions-section">
      <PageTitleComponent title="popup_html_clear" isBackButtonEnabled={true} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ClearAllDataComponent = connector(ClearAllData);
