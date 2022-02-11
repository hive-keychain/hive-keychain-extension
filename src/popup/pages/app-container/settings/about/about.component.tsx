import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './about.component.scss';

const AboutPage = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_about',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div className="about-page">
      <div
        className="content"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_about_text'),
        }}></div>
      <div className="version">
        {chrome.runtime.getManifest().name +
          ' ' +
          chrome.runtime.getManifest().version}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AboutPageComponent = connector(AboutPage);
