export type EvmSecurityReasonWarningMessage = {
  message: string;
  messageParams?: string[];
};

export type EvmSecurityReasonWarningContext = 'address' | 'domain';

const ADDRESS_REASON_MESSAGE_KEYS: Record<string, string> = {
  blacklist_doubt: 'evm_security_reason_blacklist_doubt',
  blackmail_activities: 'evm_security_reason_blackmail_activities',
  cybercrime: 'evm_security_reason_cybercrime',
  darkweb_transactions: 'evm_security_reason_darkweb_transactions',
  fake_kyc: 'evm_security_reason_fake_kyc',
  fake_token: 'evm_security_reason_fake_token',
  financial_crime: 'evm_security_reason_financial_crime',
  gas_abuse: 'evm_security_reason_gas_abuse',
  honeypot_related_address: 'evm_security_reason_honeypot_related_address',
  malicious_mining_activities: 'evm_security_reason_malicious_mining_activities',
  mixer: 'evm_security_reason_mixer',
  money_laundering: 'evm_security_reason_money_laundering',
  phishing_activities: 'evm_security_reason_phishing_activities',
  reinit: 'evm_security_reason_reinit',
  sanctioned: 'evm_security_reason_sanctioned',
  stealing_attack: 'evm_security_reason_stealing_attack',
  scamsniffer_blacklist: 'evm_security_reason_scamsniffer_blacklist',
  phishing_site: 'evm_security_reason_phishing_site',
};

const ADDRESS_FALLBACK_MESSAGE = 'evm_transaction_receiver_malicious';
const DOMAIN_FALLBACK_MESSAGE = 'evm_transaction_domain_phishing';

const getWarningForReason = (reason: string): EvmSecurityReasonWarningMessage => {
  const normalizedReason = reason.trim();
  if (!normalizedReason) {
    return { message: 'evm_security_reason_unknown', messageParams: [reason] };
  }

  if (normalizedReason.startsWith('address_risk:')) {
    return {
      message: 'evm_security_reason_address_risk',
      messageParams: [normalizedReason.slice('address_risk:'.length)],
    };
  }

  if (normalizedReason.startsWith('nft_risk:')) {
    return {
      message: 'evm_security_reason_nft_risk',
      messageParams: [normalizedReason.slice('nft_risk:'.length)],
    };
  }

  const messageKey = ADDRESS_REASON_MESSAGE_KEYS[normalizedReason];
  if (messageKey) {
    return { message: messageKey };
  }

  return {
    message: 'evm_security_reason_unknown',
    messageParams: [normalizedReason],
  };
};

const buildWarningsForSecurityReasons = (
  reasons: string[],
  isMalicious: boolean,
  context: EvmSecurityReasonWarningContext = 'address',
): EvmSecurityReasonWarningMessage[] => {
  const dedupedReasons = [
    ...new Set(
      reasons.map((reason) => reason.trim()).filter((reason) => reason.length > 0),
    ),
  ].sort((a, b) => a.localeCompare(b));

  if (dedupedReasons.length > 0) {
    return dedupedReasons.map((reason) => getWarningForReason(reason));
  }

  if (!isMalicious) {
    return [];
  }

  return [
    {
      message:
        context === 'domain' ? DOMAIN_FALLBACK_MESSAGE : ADDRESS_FALLBACK_MESSAGE,
    },
  ];
};

export const EvmSecurityReasonUtils = {
  getWarningForReason,
  buildWarningsForSecurityReasons,
};
