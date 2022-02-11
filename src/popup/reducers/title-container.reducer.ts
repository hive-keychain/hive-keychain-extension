import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

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
