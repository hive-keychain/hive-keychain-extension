import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmRequest,
  EvmWalletDomainPermissions,
  ProviderRpcErrorItem,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { ObjectUtils } from 'src/utils/object.utils';

const SUPPORTED_WALLET_REQUEST_PERMISSIONS = [
  EvmRequestPermission.ETH_ACCOUNTS,
];

export const validateWalletRequestPermissionsParams = (
  params: unknown,
): {
  permission?: EvmRequestPermission;
  error?: ProviderRpcErrorItem;
} => {
  if (!params || !Array.isArray(params) || params.length !== 1) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const requestedPermissions = params[0];
  if (!ObjectUtils.isPureObject(requestedPermissions)) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const permissionKeys = Object.keys(requestedPermissions);
  if (permissionKeys.length !== 1) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const requestedPermission = permissionKeys[0];
  if (!SUPPORTED_WALLET_REQUEST_PERMISSIONS.includes(requestedPermission as any)) {
    return { error: ProviderRpcErrorList.unsupportedMethod };
  }

  if (
    !ObjectUtils.isPureObject(
      (requestedPermissions as Record<string, unknown>)[requestedPermission],
    )
  ) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  return {
    permission: requestedPermission as EvmRequestPermission,
  };
};

export const getWalletRequestPermissionsResponse = (
  permission: EvmRequestPermission,
) => [{ parentCapability: permission }];

export type WalletPermissionDescriptor = {
  invoker: string;
  parentCapability: EvmRequestPermission;
  caveats: {
    type: 'restrictReturnedAccounts';
    value: string[];
  }[];
};

const buildEthAccountsPermissionDescriptor = (
  invoker: string,
  exposedAccounts: string[],
): WalletPermissionDescriptor => ({
  invoker,
  parentCapability: EvmRequestPermission.ETH_ACCOUNTS,
  caveats: [
    {
      type: 'restrictReturnedAccounts',
      value: exposedAccounts,
    },
  ],
});

export const getWalletPermissionsResponse = (
  invoker: string,
  permissions?: EvmWalletDomainPermissions,
): WalletPermissionDescriptor[] => {
  const exposedAccounts = permissions?.[EvmRequestPermission.ETH_ACCOUNTS];
  if (exposedAccounts === undefined) return [];

  return [buildEthAccountsPermissionDescriptor(invoker, exposedAccounts)];
};

export const getRequestedConnectionPermission = (
  request?: Pick<EvmRequest, 'method' | 'params'>,
  validatedWalletRequestPermissions?: {
    permission?: EvmRequestPermission;
  },
) => {
  if (!request) return;

  if (request.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
    return EvmRequestPermission.ETH_ACCOUNTS;
  }

  if (request.method === EvmRequestMethod.WALLET_REQUEST_PERMISSIONS) {
    return (
      validatedWalletRequestPermissions?.permission ??
      validateWalletRequestPermissionsParams(request.params).permission
    );
  }
};
