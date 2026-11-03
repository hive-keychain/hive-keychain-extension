import { VaultCommand } from '@reference-data/vault-message-key.enum';

const VAULT_RUNTIME_COMMANDS = new Set<string>(Object.values(VaultCommand));

const isInternalExtensionSender = (
  sender: Pick<chrome.runtime.MessageSender, 'id' | 'url'>,
): boolean => {
  return (
    sender.id === chrome.runtime.id &&
    typeof sender.url === 'string' &&
    sender.url.startsWith(chrome.runtime.getURL(''))
  );
};

/**
 * Firefox stores the master password behind runtime messages.
 * Other onMessage listeners must ignore these commands synchronously,
 * otherwise their returned promise is sent as the reply.
 */
const isVaultRuntimeMessage = (message: unknown): boolean => {
  if (!message || typeof message !== 'object' || !('command' in message)) {
    return false;
  }
  const command = (message as { command?: unknown }).command;
  return typeof command === 'string' && VAULT_RUNTIME_COMMANDS.has(command);
};

export const RuntimeMessageSenderUtils = {
  isInternalExtensionSender,
  isVaultRuntimeMessage,
};
