import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';

const wInitialState = (
  uiElement: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
  storeState: RootState,
) => {
  customRender(uiElement, { initialState: storeState });
};

export default { wInitialState };
