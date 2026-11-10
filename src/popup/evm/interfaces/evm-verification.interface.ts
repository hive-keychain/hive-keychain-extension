import { EvmLightNodeSecurityCheck } from '@popup/evm/interfaces/evm-light-node.interface';

export type LightNodeVerificationData = {
  domainSecurity?: EvmLightNodeSecurityCheck;
  addressSecurityByAddress?: Record<string, EvmLightNodeSecurityCheck>;
  contractSecurity?: EvmLightNodeSecurityCheck;
  unavailable?: boolean;
};
