import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const AccountValueExplanation = ({}: PropsFromRedux) => {
  return (
    <div className="account-value-explanation-section">
      <PageTitleComponent
        title="popup_html_estimation_info"
        isBackButtonEnabled={true}
      />

      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_estimation_info_text'),
        }}></p>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AccountValueExplanationComponent = connector(
  AccountValueExplanation,
);
