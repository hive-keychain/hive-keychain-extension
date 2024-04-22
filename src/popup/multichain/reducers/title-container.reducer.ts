import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

export const TitleContainerReducer = (
  state: PageTitleProps = { title: '' },
  { type, payload }: ActionPayload<PageTitleProps>,
): PageTitleProps => {
  switch (type) {
    case MultichainActionType.SET_TITLE_PROPERTIES:
      return payload!;
    default:
      return state;
  }
};
