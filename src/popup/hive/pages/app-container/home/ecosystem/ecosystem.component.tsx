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

export const Ecosystem = ({ setTitleContainerProperties }: any) => {
  const { chain } = useChainContext();

  const [dappCategories, setDappCategories] = useState<DAppCategory[]>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'ecosystem',
      isBackButtonEnabled: true,
    } as PageTitleProps);
    init();
  }, []);

  const init = async () => {
    const categories: DAppCategory[] = await EcosystemUtils.getDappList(chain);
    setDappCategories(categories);
  };

  return (
    <div className="ecosystem-page">
      {dappCategories && (
        <FormContainer>
          {dappCategories.map((cat, index) => (
            <EcosystemCategory category={cat} key={`category-${index}`} />
          ))}
        </FormContainer>
      )}

      {!dappCategories && <LoadingComponent />}
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
