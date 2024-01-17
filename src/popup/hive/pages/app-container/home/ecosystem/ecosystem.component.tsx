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
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { Tab, TabsComponent } from 'src/common-ui/tabs/tabs.component';

export const Ecosystem = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const { chain } = useChainContext();

  const [tabs, setTabs] = useState<Tab[]>();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'ecosystem',
      isBackButtonEnabled: true,
    } as PageTitleProps);
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const categories: DAppCategory[] = await EcosystemUtils.getDappList(chain);
    if (categories) {
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
    } else {
      setHasError(true);
    }
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="ecosystem-page">
      {!hasError && (
        <>
          {tabs && (
            <FormContainer>
              <TabsComponent tabs={tabs}></TabsComponent>
            </FormContainer>
          )}
          {loading && <LoadingComponent />}
        </>
      )}
      {hasError && (
        <div className="error-ecosystem">
          <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
          <div className="text">
            <div>
              {chrome.i18n.getMessage('html_popup_ecosystem_retrieving_error')}
            </div>
          </div>
        </div>
      )}
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
