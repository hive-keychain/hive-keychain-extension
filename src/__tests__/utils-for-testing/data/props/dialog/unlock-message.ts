import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { PropsUnlockMessage } from 'src/__tests__/utils-for-testing/types/props-types';

const props = {
  data: {
    command: DialogCommand.UNLOCK,
    msg: {
      success: false,
      error: 'locked',
      result: null,
      data: {},
      message: 'message',
      display_msg: 'display_msg',
    },
    tab: 0,
    domain: 'domain',
  },
  wrongMk: true,
  index: 1,
} as PropsUnlockMessage;

export default { props };
