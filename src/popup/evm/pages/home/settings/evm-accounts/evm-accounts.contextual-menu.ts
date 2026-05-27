import { ContextualMenu } from '@interfaces/contextual-menu.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface EvmAccountContextualMenuParams {
  activeSeedName: string;
  onEditClicked: Function;
  onDeleteClicked: Function;
  onCreateClicked: Function;
  onImportClicked: Function;
  onImportKeyClicked: Function;
  onConnectLedgerClicked: Function;
  onCopyClicked: Function;
  isLedgerSource?: boolean;
  isImportedSource?: boolean;
}

const getDeleteSeedConfirmationMessage = (
  isLedgerSource?: boolean,
  isImportedSource?: boolean,
): string => {
  if (isLedgerSource) {
    return 'evm_delete_all_ledger_accounts_confirmation_message';
  }
  if (isImportedSource) {
    return 'evm_delete_all_imported_accounts_confirmation_message';
  }
  return 'evm_delete_seed_confirmation_message';
};

export const EvmAccountsContextualMenu = ({
  activeSeedName,
  onEditClicked,
  onDeleteClicked,
  onCreateClicked,
  onImportClicked,
  onImportKeyClicked,
  onConnectLedgerClicked,
  onCopyClicked,
  isLedgerSource,
  isImportedSource,
}: EvmAccountContextualMenuParams): ContextualMenu => {
  const deleteSeedItem = {
    icon: SVGIcons.EVM_ACCOUNT_DELETE,
    label: 'evm_delete_seed_button',
    onClick: onDeleteClicked,
    needsConfirmation: true,
    confirmationMessage: getDeleteSeedConfirmationMessage(
      isLedgerSource,
      isImportedSource,
    ),
  };

  const seedItems = [
    {
      icon: SVGIcons.EVM_ACCOUNT_EDIT,
      label: 'evm_edit_seed_nickname',
      onClick: onEditClicked,
    },
    deleteSeedItem,
  ];

  const activeSeedItems =
    isLedgerSource || isImportedSource
      ? [deleteSeedItem]
      : [
          {
            icon: SVGIcons.EVM_ACCOUNT_COPY,
            label: 'evm_copy_seed',
            onClick: onCopyClicked,
          },
          ...seedItems,
        ];

  return {
    sections: [
      {
        title: activeSeedName,
        skipTranslation: true,
        items: activeSeedItems,
      },
      {
        title: 'common_seeds',
        items: [
          {
            icon: SVGIcons.EVM_ACCOUNT_ADD,
            label: 'evm_create_seed',
            onClick: onCreateClicked,
          },
          {
            icon: SVGIcons.EVM_ACCOUNT_IMPORT,
            label: 'evm_import_seed',
            onClick: onImportClicked,
          },
          {
            icon: SVGIcons.EVM_ACCOUNT_KEY,
            label: 'evm_import_key',
            onClick: onImportKeyClicked,
          },
          {
            icon: SVGIcons.EVM_ACCOUNT_LEDGER,
            label: 'evm_connect_ledger_wallet',
            onClick: onConnectLedgerClicked,
          },
        ],
      },
    ],
  };
};
