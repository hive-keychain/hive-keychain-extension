import React from 'react';
import { Carousel } from 'react-responsive-carousel';

export interface DApp {
  name: string;
  description: string;
  icon: string;
  url: string;
  appendUsername?: boolean;
  categories: string[];
}

export interface DAppCategory {
  category: string;
  dapps: DApp[];
}

export interface EcosystemCategoryProps {
  category: DAppCategory;
}

export const EcosystemCategory = ({ category }: EcosystemCategoryProps) => {
  const navigateToDapp = (dapp: DApp) => {
    chrome.tabs.create({ url: dapp.url });
  };

  return (
    <div className="category">
      <div className="title">
        {chrome.i18n.getMessage(`ecosystem_category_${category.category}`)}
      </div>
      <Carousel
        showArrows
        showThumbs={false}
        showIndicators={false}
        showStatus={false}
        autoPlay
        centerMode
        centerSlidePercentage={60}
        infiniteLoop>
        {category.dapps.map((dapp, index) => (
          <div
            className="dapp"
            onClick={() => navigateToDapp(dapp)}
            key={`${dapp.name}-${index}`}>
            <img className="logo" src={dapp.icon} />
            <div className="label">{dapp.name}</div>
            <div className="description">{dapp.description}</div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};
