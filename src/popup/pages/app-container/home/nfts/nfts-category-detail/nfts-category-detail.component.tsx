import { NFTCategory, NFTItem } from '@interfaces/ntf.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { NftCardComponent } from '@popup/pages/app-container/home/nfts/nfts-category-detail/nft-card/nft-card.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './nfts-category-detail.component.scss';

const NftsDetail = ({
  category,
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [allMine, setAllMine] = useState<NFTItem[]>([]);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts_category_market',
      titleParams: [category.name],
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    setAllMine(await category.getAllMine(activeAccountName));
  };

  return (
    <div className="nfts-detail-page">
      <div className="description">
        {chrome.i18n.getMessage('popup_html_nfts_detail_description')}
      </div>
      <div className="main-panel">
        {allMine.map((item, index) => (
          <NftCardComponent item={item} key={item.image + '-' + index} />
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    category: state.navigation.params?.category as NFTCategory,
    activeAccountName: state.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NftsDetailComponent = connector(NftsDetail);
