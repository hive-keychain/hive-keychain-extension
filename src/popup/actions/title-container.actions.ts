import { ActionType } from '@popup/actions/action-type.enum';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

export const setTitleContainerProperties = (properties: PageTitleProps) => {
  return {
    type: ActionType.SET_TITLE_PROPERTIES,
    payload: properties,
  };
};

export const resetTitleContainerProperties = () => {
  return { type: ActionType.SET_TITLE_PROPERTIES, payload: { title: '' } };
};
