import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';

const Nfts = ({ setTitleContainerProperties, navigateTo }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div className="ntfs-page">
      <div className="description">
        {chrome.i18n.getMessage('popup_html_nfts_description')}
      </div>
      <div className="main-panel">
        <div className="settings-panel">
          <div className="left-panel"></div>
          <Icon
            onClick={() => navigateTo(Screen.NFTS_PAGE)}
            name={Icons.FILTER}
            type={IconType.OUTLINED}
            additionalClassName="filter"></Icon>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NftsComponent = connector(Nfts);
