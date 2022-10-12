import * as LogicAddAccountRequest from 'src/background/requests/logic/addAccountRequest.logic';
import * as LogicAddAccountToEmptyWallet from 'src/background/requests/logic/addAccountToEmptyWallet.logic';
import * as LogicAnonymousRequests from 'src/background/requests/logic/anonymousRequests.logic';
import * as LogicInitializeWallet from 'src/background/requests/logic/initializeWallet.logic';
import * as LogicMissingKey from 'src/background/requests/logic/missingKey.logic';
import * as LogicMissingUser from 'src/background/requests/logic/missingUser.logic';
import * as LogicRequestWithConfirmation from 'src/background/requests/logic/requestWithConfirmation.logic';
import * as LogicRequestWithoutConfirmation from 'src/background/requests/logic/requestWithoutConfirmation.logic';
import * as LogicTransferRequest from 'src/background/requests/logic/transferRequest.logic';
import * as LogicUnlockWallet from 'src/background/requests/logic/unlockWallet.logic';
// If need to mock use as:
// .mockImplementation(() => {}),
export default {
  initializeWallet: jest.spyOn(LogicInitializeWallet, 'initializeWallet'),
  addAccountToEmptyWallet: jest.spyOn(
    LogicAddAccountToEmptyWallet,
    'addAccountToEmptyWallet',
  ),
  unlockWallet: jest.spyOn(LogicUnlockWallet, 'unlockWallet'),
  addAccountRequest: jest.spyOn(LogicAddAccountRequest, 'addAccountRequest'),
  transferRequest: jest.spyOn(LogicTransferRequest, 'transferRequest'),
  anonymousRequests: jest.spyOn(LogicAnonymousRequests, 'anonymousRequests'),
  missingUser: jest.spyOn(LogicMissingUser, 'missingUser'),
  missingKey: jest.spyOn(LogicMissingKey, 'missingKey'),
  requestWithConfirmation: jest.spyOn(
    LogicRequestWithConfirmation,
    'requestWithConfirmation',
  ),
  requestWithoutConfirmation: jest.spyOn(
    LogicRequestWithoutConfirmation,
    'requestWithoutConfirmation',
  ),
};
