import { ContextualMenu } from '@interfaces/contextual-menu.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface EvmAccountContextualMenuParams {
  onEditClicked: Function;
  onDeleteClicked: Function;
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
  onEditClicked,
  onDeleteClicked,
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
        items: activeSeedItems,
      },
    ],
  };
};
