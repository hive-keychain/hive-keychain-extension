import { BackgroundMessage } from '@background/background-message.interface';
import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import indexMocks from 'src/__tests__/background/mocks/index-mocks';

const { spies, constants } = indexMocks;

const messages = [
  {
    backgroundMessage: {
      command: BackgroundCommand.GET_MK,
      value: 'empty',
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.sendBackMk).toBeCalledTimes(1);
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.SAVE_MK,
      value: '_MK',
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.saveMk).toBeCalledWith('_MK');
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.IMPORT_ACCOUNTS,
      value: '*filecontent*',
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.sendBackImportedAccounts).toBeCalledWith('*filecontent*');
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.SAVE_RPC,
      value: 'rpc',
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.setActiveRpc).toBeCalledWith('rpc');
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.SEND_REQUEST,
      value: 'rpc',
    } as BackgroundMessage,
    mocking: () => {
      RequestsHandler.getFromLocalStorage = jest
        .fn()
        .mockResolvedValue(constants.requestHandler);
      RequestsHandler.prototype.sendRequest = jest.fn();
    },
    assertions: () => {
      expect(spies.closeWindow).toBeCalledTimes(1);
      expect(RequestsHandler.prototype.sendRequest).toBeCalledTimes(1);
    },
  },
  {
    //case 1 good login
    backgroundMessage: {
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        mk: 'mk',
        domain: 'domain',
        data: { msg: { data: 'Keychain' } },
        tab: 0,
      },
    } as BackgroundMessage,
    mocking: () => {
      MkModule.login = jest.fn().mockResolvedValue(true);
      RequestsHandler.getFromLocalStorage = jest.fn().mockResolvedValue({});
    },
    assertions: () => {
      expect(spies.init).toBeCalledWith('Keychain', 0, 'domain', {});
    },
  },
  {
    //case 1 bad login
    backgroundMessage: {
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        mk: 'mk',
        domain: 'domain',
        data: { msg: { data: 'Keychain' } },
        tab: 0,
      },
    } as BackgroundMessage,
    mocking: () => {
      MkModule.login = jest.fn().mockResolvedValue(false);
    },
    assertions: () => {
      expect(spies.sendMessage).toBeCalledWith({
        command: DialogCommand.WRONG_MK,
        msg: { data: 'Keychain' },
      });
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.REGISTER_FROM_DIALOG,
      value: {
        mk: 'mk',
        domain: 'domain',
        data: { msg: { data: 'Keychain' } },
        tab: 0,
      },
    } as BackgroundMessage,
    mocking: () => {
      MkModule.saveMk = jest.fn().mockReturnValue(undefined);
      RequestsHandler.getFromLocalStorage = jest.fn().mockResolvedValue({});
    },
    assertions: () => {
      expect(spies.init).toBeCalledWith(
        { msg: { data: 'Keychain' } },
        0,
        'domain',
        {},
      );
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: { keep: true, data: 'transaction*', tab: 0, domain: 'domain' },
    } as BackgroundMessage,
    mocking: () => {
      RequestsHandler.getFromLocalStorage = jest.fn().mockResolvedValue({});
    },
    assertions: () => {
      expect(spies.performOperation).toBeCalledWith(
        {},
        'transaction*',
        0,
        'domain',
        true,
      );
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.UPDATE_AUTOLOCK,
      value: '*autolock',
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.autolock.set).toBeCalledWith('*autolock');
    },
  },
  {
    backgroundMessage: {
      command: BackgroundCommand.SEND_BACK_SETTINGS,
      value: JSON.stringify('{rpc: 666settings666}'),
    } as BackgroundMessage,
    assertions: () => {
      expect(spies.sendBackImportedFileContent).toBeCalledWith(
        '{rpc: 666settings666}',
      );
      expect(spies.logger.log).toBeCalledWith('Background message', {
        command: 'sendBackSettings',
        value: '"{rpc: 666settings666}"',
      });
    },
  },
];

export default { messages };
