import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './auto-lock.component.scss';

const AutoLock = ({}: PropsFromRedux) => {
  return (
    <div className="auto-lock-page">
      <PageTitleComponent
        title="popup_html_autolock"
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

export const AutoLockComponent = connector(AutoLock);
