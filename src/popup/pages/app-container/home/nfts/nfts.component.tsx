import { NFTCategory } from '@interfaces/ntf.interface';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { NftsUtils } from 'src/utils/nfts.utils';
import './nfts.component.scss';

const Nfts = ({
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [nftCategories, setNftCategories] = useState<any[]>([]);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts',
      isBackButtonEnabled: true,
    });
    initMarket();
  }, []);

  const initMarket = async () => {
    setNftCategories(await NftsUtils.getCategories());
  };

  const goToCategoryDetail = (category: NFTCategory) => {
    navigateToWithParams(Screen.NFTS_PAGE, { category: category });
  };

  return (
    <div className="nfts-page">
      <div className="description">
        {chrome.i18n.getMessage('popup_html_nfts_description')}
      </div>
      <div className="main-panel">
        <div className="settings-panel">
          <div className="left-panel"></div>
          <Icon
            onClick={() => navigateTo(Screen.NFTS_CATEGORY_PAGE)}
            name={Icons.FILTER}
            type={IconType.OUTLINED}
            additionalClassName="filter"></Icon>
        </div>
        <div className="categories">
          {nftCategories &&
            nftCategories.map((category, index) => (
              <div
                key={`${category.name}-${index}`}
                className="category-card"
                onClick={() => goToCategoryDetail(category)}>
                <div className="title">{category.name}</div>
                <img className="image" src={category.image} />
              </div>
            ))}
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
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NftsComponent = connector(Nfts);
