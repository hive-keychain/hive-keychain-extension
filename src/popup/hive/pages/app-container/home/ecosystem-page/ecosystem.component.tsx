import { setTitleContainerProperties } from '@popup/hive/actions/title-container.actions';
import { RootState } from '@popup/hive/store';
import { EcosystemUtils } from '@popup/hive/utils/ecosystem.utils';
import { useChainContext } from '@popup/multichain.context';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

type DApp = {
  name: string;
  description: string;
  icon: string;
  url: string;
  appendUsername?: boolean;
  categories: string[];
};

interface DAppCategory {
  category: string;
  dapps: DApp[];
}

export const Ecosystem = ({ setTitleContainerProperties }: any) => {
  const { chain } = useChainContext();

  const [dappCategories, setDappCategories] = useState<DAppCategory[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'ecosystem',
      isBackButtonEnabled: true,
    } as PageTitleProps);
    init();
  }, []);

  const init = async () => {
    const dapps: DAppCategory[] = await EcosystemUtils.getDappList(chain);
    setDappCategories(dapps);
  };

  const navigateToDapp = (dapp: DApp) => {
    chrome.tabs.create({ url: dapp.url });
  };

  return (
    <div className="ecosystem-page">
      <FormContainer>
        {dappCategories.map((cat, index) => (
          <div className="category" key={`${cat}-${index}`}>
            <div className="title">
              {chrome.i18n.getMessage(`ecosystem_category_${cat.category}`)}
            </div>
            <div className="dapps">
              {cat.dapps.map((dapp, index) => (
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
          </div>
        ))}
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EcosystemComponent = connector(Ecosystem);
