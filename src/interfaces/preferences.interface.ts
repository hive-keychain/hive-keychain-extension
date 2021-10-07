export interface DomainPreference {
  domain: string;
  whitelisted_requests: string[];
}

export interface UserPreference {
  username: string;
  domains: DomainPreference[];
}
