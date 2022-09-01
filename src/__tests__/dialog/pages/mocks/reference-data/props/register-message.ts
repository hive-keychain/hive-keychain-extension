import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import { PropsRegisterMessage } from 'src/__tests__/utils-for-testing/types/props-types';

const props: PropsRegisterMessage = {
  data: {
    command: DialogCommand.REGISTER,
    msg: {
      success: false,
      error: 'register',
      result: null,
      data: voteMocks.constants.data,
      message: 'message',
      display_msg: 'display_msg',
    },
    tab: 0,
    domain: 'domain',
  },
};
const registerMessage = {
  props,
};
export default registerMessage;
