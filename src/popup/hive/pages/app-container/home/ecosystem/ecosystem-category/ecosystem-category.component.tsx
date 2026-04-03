import React from 'react';

export interface DApp {
  id: number;
  name: string;
  description: string;
  icon: string;
  chainId?: string;
  chainLogo?: string;
  url: string;
  appendUsername?: boolean;
  categories: string[];
  order: number;
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
    <div className="ecosystem-category">
      {(category.dapps ?? []).map((dapp, index) => {
        return (
          <div
            className="dapp"
            onClick={() => navigateToDapp(dapp)}
            key={`${dapp.name}-${index}`}>
            {!!dapp.chainLogo && (
              <img
                className="corner-logo"
                src={dapp.chainLogo}
                alt={`${dapp.name} chain logo`}
              />
            )}
            <img className="logo" src={dapp.icon} alt={dapp.name} />
            <div className="label">{dapp.name}</div>
            <div className="description">{dapp.description}</div>
          </div>
        );
      })}
    </div>
  );
};
