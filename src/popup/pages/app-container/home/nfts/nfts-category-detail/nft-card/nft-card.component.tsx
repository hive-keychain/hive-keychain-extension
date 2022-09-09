import { NFTItem } from '@interfaces/ntf.interface';
import { RootState } from '@popup/store';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Config from 'src/config';
import './nft-card.component.scss';

interface NftCardProps {
  item: NFTItem;
  backgroundCardImage?: string;
}

const NftCard = ({
  item,
  backgroundCardImage,
}: PropsFromRedux & NftCardProps) => {
  const [displayBack, setDisplayBack] = useState(false);
  useEffect(() => {}, []);

  const handleClickOnDuplicated = (
    event: BaseSyntheticEvent,
    duplicate: NFTItem,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('handling click on duplicated ' + duplicate.id);
  };

  return (
    <div
      className={`nft-card flip-card ${
        displayBack ? 'display-back' : 'display-front'
      }`}
      onClick={() => setDisplayBack(!displayBack)}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          {item.count > 1 && (
            <div className="item-count-container">
              <img src={Config.nft.splinterlands.multipleCardsImage} />
              <div className="item-count">{item.count}</div>
            </div>
          )}
          <img className="image" src={item.image} />
        </div>
        <div
          className="flip-card-back"
          style={
            backgroundCardImage
              ? {
                  background: `url(${backgroundCardImage})`,
                  backgroundColor: 'unset',
                }
              : {}
          }>
          <div className="info">
            <div className="name">{item.name}</div>
            <div className="duplicated">
              <div
                className="duplicate-item"
                key={`duplicated-${item.key}}`}
                onClick={($event) => handleClickOnDuplicated($event, item)}>
                {item.id}
              </div>
              {item.duplicates.length > 1 &&
                item.duplicates.map((duplicate, index) => (
                  <div
                    className="duplicate-item"
                    key={`duplicated-${item.key}-${index}`}
                    onClick={($event) =>
                      handleClickOnDuplicated($event, duplicate)
                    }>
                    {duplicate.id}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NftCardComponent = connector(NftCard);
