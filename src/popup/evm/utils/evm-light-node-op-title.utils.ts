import { toKnownOpName } from '@popup/evm/utils/evm-tokens-history.utils';

/** Maps canonical light-node op names (see toKnownOpName) to messages.json keys under public/_locales. */
const OP_TITLE_I18N_KEY_BY_CANONICAL: Record<string, string> = {
  NATIVE_SEND: 'evm_history_op_native_send',
  NATIVE_RECEIVE: 'evm_history_op_native_receive',
  ERC20_SEND: 'evm_history_op_erc20_send',
  ERC20_RECEIVE: 'evm_history_op_erc20_receive',
  ERC20_APPROVE: 'evm_history_op_erc20_approve',
  ERC20_MINT: 'evm_history_op_erc20_mint',
  ERC20_BURN: 'evm_history_op_erc20_burn',
  ERC721_SEND: 'evm_history_op_erc721_send',
  ERC721_RECEIVE: 'evm_history_op_erc721_receive',
  ERC721_APPROVE: 'evm_history_op_erc721_approve',
  ERC721_APPROVE_FOR_ALL: 'evm_history_op_erc721_approve_for_all',
  ERC721_MINT: 'evm_history_op_erc721_mint',
  ERC721_BURN: 'evm_history_op_erc721_burn',
  ERC1155_SEND: 'evm_history_op_erc1155_send',
  ERC1155_RECEIVE: 'evm_history_op_erc1155_receive',
  ERC1155_APPROVE_FOR_ALL: 'evm_history_op_erc1155_approve_for_all',
  ERC1155_MINT: 'evm_history_op_erc1155_mint',
  ERC1155_BURN: 'evm_history_op_erc1155_burn',
  SWAP: 'evm_history_op_swap',
  AIRDROP_RECEIVE: 'evm_history_op_airdrop_receive',
  CONTRACT_CALL: 'evm_history_op_contract_call',
  CONTRACT_DEPLOY: 'evm_history_op_contract_deploy',
  ADD_LIQUIDITY: 'evm_history_op_add_liquidity',
  REMOVE_LIQUIDITY: 'evm_history_op_remove_liquidity',
  WRAP: 'evm_history_op_wrap',
  UNWRAP: 'evm_history_op_unwrap',
  UNKNOWN: 'evm_history_op_unknown',
};

/**
 * i18n message id for the history-detail page title, or undefined if opName is empty.
 * CANCELED_OP is handled before toKnownOpName (which maps unknown strings to UNKNOWN).
 */
export const getEvmLightNodeOpTitleMessageKey = (
  opName: string | undefined | null,
): string | undefined => {
  const trimmed = opName?.trim();
  if (!trimmed) {
    return undefined;
  }
  const upper = trimmed.toUpperCase();
  if (upper === 'CANCELED_OP') {
    return 'evm_history_op_canceled_op';
  }
  const canonical = toKnownOpName(upper);
  return OP_TITLE_I18N_KEY_BY_CANONICAL[canonical];
};
