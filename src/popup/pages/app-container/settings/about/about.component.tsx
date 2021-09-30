import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './about.component.scss';

const AboutPage = ({}: PropsFromRedux) => {
  return (
    <div className="about-page">
      <PageTitleComponent
        title={'popup_html_about'}
        isBackButtonEnabled={true}
      />
      <div
        className="content"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_about_text'),
        }}></div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AboutPageComponent = connector(AboutPage);
