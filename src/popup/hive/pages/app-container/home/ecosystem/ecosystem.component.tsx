import { setTitleContainerProperties } from '@popup/hive/actions/title-container.actions';
import {
  DAppCategory,
  EcosystemCategory,
} from '@popup/hive/pages/app-container/home/ecosystem/ecosystem-category/ecosystem-category.component';
import { RootState } from '@popup/hive/store';
import { EcosystemUtils } from '@popup/hive/utils/ecosystem.utils';
import { useChainContext } from '@popup/multichain.context';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';
import { Tab, TabsComponent } from 'src/common-ui/tabs/tabs.component';

export const Ecosystem = ({ setTitleContainerProperties }: any) => {
  const { chain } = useChainContext();

  const [tabs, setTabs] = useState<Tab[]>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'ecosystem',
      isBackButtonEnabled: true,
    } as PageTitleProps);
    init();
  }, []);

  const init = async () => {
    const categories: DAppCategory[] = await EcosystemUtils.getDappList(chain);

    const tempTabs: any = [];
    for (const category of categories) {
      tempTabs.push({
        title: `ecosystem_category_${category.category}`,
        content: (
          <EcosystemCategory
            category={category}
            key={`category-${category.category}`}
          />
        ),
      });
    }
    setTabs(tempTabs);
  };

  return (
    <div className="ecosystem-page">
      <FormContainer>
        {tabs && <TabsComponent tabs={tabs}></TabsComponent>}
        {!tabs && <LoadingComponent />}
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
