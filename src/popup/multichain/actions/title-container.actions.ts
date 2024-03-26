import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

export const setTitleContainerProperties = (properties: PageTitleProps) => {
  return {
    type: ActionType.SET_TITLE_PROPERTIES,
    payload: properties,
  };
};

export const resetTitleContainerProperties = () => {
  return { type: ActionType.SET_TITLE_PROPERTIES, payload: { title: '' } };
};
