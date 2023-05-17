import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
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
    <div aria-label={`${Screen.SETTINGS_ABOUT}-page`} className="about-page">
      <div
        aria-label={`${Icons.INFO}-page-content`}
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
