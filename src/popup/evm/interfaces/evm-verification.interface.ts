export interface GoPlusApiResponse<T = unknown> {
  code: number;
  message?: string;
  result?: T;
}

export interface GoPlusRequestOptions {
  accessToken?: string;
  signal?: AbortSignal;
}

export interface GoPlusAccessTokenResult {
  access_token: string;
  expires_in: number;
}

export interface GoPlusOwnerRisk {
  owner_address?: string | null;
  owner_type?: string | null;
  value?: number | null;
}

export interface GoPlusTokenSecurityInfo {
  anti_whale_modifiable?: string;
  buy_tax?: string;
  can_take_back_ownership?: string;
  cannot_buy?: string;
  cannot_sell_all?: string;
  creator_address?: string;
  creator_balance?: string;
  creator_percent?: string;
  dex?: Array<{ liquidity?: string; name?: string; pair?: string }>;
  external_call?: string;
  hidden_owner?: string;
  holder_count?: string;
  holders?: Array<{ address?: string; balance?: string; percent?: string }>;
  honeypot_with_same_creator?: string;
  is_anti_whale?: string;
  is_blacklisted?: string;
  is_honeypot?: string;
  is_in_dex?: string;
  is_mintable?: string;
  is_open_source?: string;
  is_proxy?: string;
  is_whitelisted?: string;
  lp_holder_count?: string;
  lp_holders?: Array<{ address?: string; balance?: string; percent?: string }>;
  lp_total_supply?: string;
  owner_address?: string;
  owner_balance?: string;
  owner_change_balance?: string;
  owner_percent?: string;
  personal_slippage_modifiable?: string;
  selfdestruct?: string;
  sell_tax?: string;
  slippage_modifiable?: string;
  token_name?: string;
  token_symbol?: string;
  total_supply?: string;
  trading_cooldown?: string;
  transfer_pausable?: string;
  transfer_tax?: string;
  trust_list?: string;
  [key: string]: unknown;
}

export interface GoPlusAddressSecurityInfo {
  blacklist_doubt?: string;
  blackmail_activities?: string;
  contract_address?: string;
  cybercrime?: string;
  darkweb_transactions?: string;
  data_source?: string;
  fake_kyc?: string;
  fake_standard_interface?: string;
  fake_token?: string;
  financial_crime?: string;
  gas_abuse?: string;
  honeypot_related_address?: string;
  malicious_mining_activities?: string;
  mixer?: string;
  money_laundering?: string;
  number_of_malicious_contracts_created?: string;
  phishing_activities?: string;
  reinit?: string;
  sanctioned?: string;
  stealing_attack?: string;
  [key: string]: unknown;
}

export interface GoPlusNftSecurityInfo {
  nft_name?: string;
  nft_symbol?: string;
  nft_open_source?: string;
  nft_proxy?: string;
  oversupply_minting?: string;
  privileged_burn?: GoPlusOwnerRisk;
  privileged_minting?: GoPlusOwnerRisk;
  restricted_approval?: string;
  self_destruct?: GoPlusOwnerRisk;
  transfer_without_approval?: GoPlusOwnerRisk;
  [key: string]: unknown;
}

export interface GoPlusPhishingSiteInfo {
  phishing_site?: number;
  website_contract_security?: Array<{
    address_risk?: string[];
    contract?: string;
    is_contract?: number;
    is_open_source?: number;
    nft_risk?: Record<string, unknown>;
    standard?: string;
  }>;
}

export interface GoPlusRugPullDetectionInfo {
  approval_abuse?: number;
  blacklist?: number;
  contract_name?: string;
  is_open_source?: number;
  is_proxy?: number;
  owner?: {
    owner_address?: string;
    owner_name?: string;
    owner_type?: string;
  };
  privilege_withdraw?: number;
  selfdestruct?: number;
  withdraw_missing?: number;
}
