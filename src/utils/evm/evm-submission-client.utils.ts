import { EvmTransactionSubmissionModule } from '@background/evm/evm-transaction-submission.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { ContextType } from '@reference-data/context-type.enum';

export type EvmSubmissionCommand =
  | { action: 'reserve'; from: string; chainId: string; forcedNonce?: number }
  | { action: 'commit'; token: string; raw: string[] }
  | { action: 'release'; token: string }
  | { action: 'broadcast'; token: string };

const execute = async (command: EvmSubmissionCommand) => {
  switch (command.action) {
    case 'reserve':
      return EvmTransactionSubmissionModule.reserve(
        command.from,
        command.chainId,
        1,
        command.forcedNonce,
      );
    case 'commit':
      return EvmTransactionSubmissionModule.commit(command.token, command.raw);
    case 'release':
      return EvmTransactionSubmissionModule.release(command.token);
    case 'broadcast':
      return EvmTransactionSubmissionModule.markBroadcast(command.token);
  }
};

const send = async (command: EvmSubmissionCommand) => {
  if (
    (global as typeof globalThis & { contextType?: ContextType })
      .contextType === ContextType.SERVICE_WORKER
  )
    return execute(command);
  const response = await chrome.runtime.sendMessage({
    command: BackgroundCommand.EVM_TRANSACTION_SUBMISSION,
    value: command,
  });
  if (!response?.success)
    throw response?.error ?? new Error('Transaction submission unavailable');
  return response.result as { token: string; nonce: number } | undefined;
};

const reserve = async (from: string, chainId: string, forcedNonce?: number) => {
  const result = await send({ action: 'reserve', from, chainId, forcedNonce });
  if (!result) throw new Error('Missing transaction reservation');
  return result;
};

export const EvmSubmissionClientUtils = { reserve, send, execute };
