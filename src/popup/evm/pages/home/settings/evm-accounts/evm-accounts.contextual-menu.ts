import { ContextualMenu } from '@interfaces/contextual-menu.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface EvmAccountContextualMenuParams {
  activeSeedName: string;
  onEditClicked: Function;
  onDeleteClicked: Function;
  onCreateClicked: Function;
  onImportClicked: Function;
  onConnectLedgerClicked: Function;
  onCopyClicked: Function;
  isLedgerSource?: boolean;
}

export const EvmAccountsContextualMenu = ({
  activeSeedName,
  onEditClicked,
  onDeleteClicked,
  onCreateClicked,
  onImportClicked,
  onConnectLedgerClicked,
  onCopyClicked,
  isLedgerSource,
}: EvmAccountContextualMenuParams): ContextualMenu => {
  const deleteSeedItem = {
    icon: SVGIcons.EVM_ACCOUNT_DELETE,
    label: 'evm_delete_seed_button',
    onClick: onDeleteClicked,
    needsConfirmation: true,
    confirmationMessage: 'evm_delete_seed_confirmation_message',
  };

  const seedItems = [
    {
      icon: SVGIcons.EVM_ACCOUNT_EDIT,
      label: 'evm_edit_seed_nickname',
      onClick: onEditClicked,
    },
    deleteSeedItem,
  ];

  return {
    sections: [
      {
        title: activeSeedName,
        skipTranslation: true,
        items: isLedgerSource
          ? [deleteSeedItem]
          : [
              {
                icon: SVGIcons.EVM_ACCOUNT_COPY,
                label: 'evm_copy_seed',
                onClick: onCopyClicked,
              },
              ...seedItems,
            ],
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
            icon: SVGIcons.EVM_ACCOUNT_LEDGER,
            label: 'evm_connect_ledger_wallet',
            onClick: onConnectLedgerClicked,
          },
        ],
      },
    ],
  };
};
