import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const NftsFilter = ({
  setTitleContainerProperties,
  navigateTo,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts_filters',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div className="ntfs-filters-page">
      <div className="description">
        {chrome.i18n.getMessage('popup_html_nfts_filter_description')}
      </div>
      <div className="main-panel"></div>
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

export const NftsFilterComponent = connector(NftsFilter);
