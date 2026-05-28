import { EvmLightNodeContractResponse } from '@popup/evm/interfaces/evm-light-node.interface';
import { VerifyTransactionParams } from '@popup/evm/interfaces/evm-transactions.interface';
import { LightNodeVerificationData } from '@popup/evm/interfaces/evm-verification.interface';
import {
  EvmLightNodeUtils,
  normalizeDomainForLightNode,
} from '@popup/evm/utils/evm-light-node.utils';
import { ethers } from 'ethers';
import Logger from 'src/utils/logger.utils';

const buildDomainCheckInput = (
  params: VerifyTransactionParams,
): string | null => {
  if (params.origin) {
    return params.origin;
  }
  if (params.domain) {
    return params.domain;
  }
  return null;
};

const fetchLightNodeVerificationData = async (
  params: VerifyTransactionParams = {},
): Promise<LightNodeVerificationData> => {
  const result: LightNodeVerificationData = {};
  let hadFailure = false;
  const tasks: Promise<void>[] = [];

  const domainInput = buildDomainCheckInput(params);
  if (domainInput && normalizeDomainForLightNode(domainInput)) {
    tasks.push(
      EvmLightNodeUtils.getDomainSecurity(domainInput).then((check) => {
        if (check) {
          result.domainSecurity = check;
        } else {
          hadFailure = true;
        }
      }),
    );
  }

  const addressesToCheck = new Set<string>();
  if (params.to && ethers.isAddress(params.to)) {
    addressesToCheck.add(params.to.toLowerCase());
  }
  for (const recipient of params.recipients ?? []) {
    if (ethers.isAddress(recipient)) {
      addressesToCheck.add(recipient.toLowerCase());
    }
  }

  for (const address of addressesToCheck) {
    tasks.push(
      EvmLightNodeUtils.getReceiverSecurity(address).then((check) => {
        if (check) {
          if (!result.addressSecurityByAddress) {
            result.addressSecurityByAddress = {};
          }
          result.addressSecurityByAddress[address] = check;
        } else {
          hadFailure = true;
        }
      }),
    );
  }

  const tokenContract = params.tokenContract;
  if (tokenContract && ethers.isAddress(tokenContract) && params.chainId) {
    tasks.push(
      (async () => {
        try {
          let contract: EvmLightNodeContractResponse | null | undefined =
            params.prefetchedContract;
          if (!contract) {
            contract = await EvmLightNodeUtils.getContract(
              params.chainId!,
              tokenContract,
            );
          }
          if (contract?.security) {
            result.contractSecurity = contract.security;
          }
        } catch (error) {
          hadFailure = true;
          Logger.error('Light-node contract security fetch failed', error);
        }
      })(),
    );
  }

  if (tasks.length === 0) {
    return {};
  }

  await Promise.all(tasks);

  if (hadFailure && Object.keys(result).length === 0) {
    return { unavailable: true };
  }

  if (hadFailure) {
    result.unavailable = true;
  }

  return result;
};

export const EvmVerificationUtils = {
  fetchLightNodeVerificationData,
};
