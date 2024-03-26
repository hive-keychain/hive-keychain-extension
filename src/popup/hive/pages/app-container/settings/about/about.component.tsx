import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';

const AboutPage = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_about',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div data-testid={`${Screen.SETTINGS_ABOUT}-page`} className="about-page">
      <div
        data-testid={`${SVGIcons.MENU_ABOUT}-page-content`}
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
