import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

export const TitleContainerReducer = (
  state: PageTitleProps = { title: '' },
  { type, payload }: ActionPayload<PageTitleProps>,
): PageTitleProps => {
  switch (type) {
    case ActionType.SET_TITLE_PROPERTIES:
      return payload!;
    default:
      return state;
  }
};
