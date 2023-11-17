import React from 'react';

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
    </div>
  );
};
